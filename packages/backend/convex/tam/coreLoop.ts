import { v } from "convex/values";
import { languageModels } from "../conversation/_agents";
import { embed } from "ai";
import {
  internalQuery,
  internalMutation,
  internalAction,
} from "../customFunctions";
import { internal } from "../_generated/api";
import { Doc } from "../_generated/dataModel";
import { doc } from "convex-helpers/validators";
import schema from "../schema";
import { withoutSystemFields } from "convex-helpers";
import { omit } from "convex-helpers";
import {
  choosePort,
  evaluateThen,
  inferTrajectory,
  refinePort,
} from "./_functions";

export const getPort = internalQuery({
  args: {
    id: v.id("ports"),
  },
  returns: v.union(doc(schema, "ports"), v.null()),
  handler: (ctx, { id }): Promise<Doc<"ports"> | null> => ctx.db.get(id),
});

export const updateBindingStatus = internalMutation({
  args: {
    id: v.id("bindings"),
    status: doc(schema, "bindings").fields.status,
  },
  handler: (ctx, { id, status }) => ctx.db.patch(id, { status }),
});

export const getSituationContext = internalQuery({
  args: {
    actor: v.id("actors"),
  },
  returns: v.union(
    v.object({
      situation: doc(schema, "situations"),
      binding: v.union(doc(schema, "bindings"), v.null()),
      episode: v.union(v.array(doc(schema, "contexts")), v.null()),
      port: v.union(doc(schema, "ports"), v.null()),
    }),
    v.null()
  ),
  handler: async (
    ctx
  ): Promise<{
    situation: Doc<"situations">;
    binding: Doc<"bindings"> | null;
    episode: Array<Doc<"contexts">> | null;
    port: Doc<"ports"> | null;
  } | null> =>
    Promise.all([
      ctx.db.query("situations").order("desc").first(),
      ctx.db.query("bindings").order("desc").first(),
    ])
      .then(([situation, binding]) => {
        if (!situation) return Promise.reject("No situations found");
        return Promise.all([
          situation,
          binding,
          binding
            ? ctx.db
                .query("contexts")
                .withIndex("by_binding", (q) => q.eq("binding", binding._id))
                .collect()
            : null,
          binding ? ctx.db.get(binding.port) : null,
        ]);
      })
      .then(([situation, binding, episode, port]) => ({
        situation,
        binding,
        episode,
        port,
      }))
      .catch(() => null),
});

export const handleBindingData = internalMutation({
  args: {
    ...omit(withoutSystemFields(doc(schema, "bindings").fields), ["port"]),
    port: v.string(),
  },
  handler: async (ctx, { port: maybePortId, ...binding }) => {
    const portId = ctx.db.normalizeId("ports", maybePortId);
    if (!portId) throw new Error(`Missing port for id ${maybePortId}`);

    const port = await ctx.db.get(portId);
    if (!port) throw new Error(`Missing port for id ${portId}`);

    return Promise.all([
      ctx.db.insert("bindings", { ...binding, port: portId }),
      ctx.db.patch(portId, {
        history: {
          ...port.history,
          timesBound: port.history.timesBound + 1,
        },
      }),
    ]);
  },
});

export const handleRefinementData = internalMutation({
  args: {
    newSituation: v.object(
      withoutSystemFields(doc(schema, "situations").fields)
    ),
    verdict: v.union(
      v.object({ binding: v.id("bindings"), outcome: v.literal("success") }),
      v.object({
        binding: v.id("bindings"),
        outcome: v.literal("failure"),
        exceptions: v.array(v.object({ context: doc(schema, "contexts") })),
      })
    ),
    portRefinement: v.union(
      v.object({
        updatedPort: v.object({
          actor: v.id("actors"),
          predicate: doc(schema, "ports").fields.predicate.partial(),
          _id: v.id("ports"),
        }),
      }),
      v.object({
        newPort: v.object(withoutSystemFields(doc(schema, "ports").fields)),
      }),
      v.null()
    ),
  },
  handler: (ctx, { newSituation, verdict, portRefinement }) =>
    ctx.db
      .get(verdict.binding)
      .then((b) => {
        if (!b) return Promise.reject("Binding not found");
        return ctx.db.get(b.port);
      })
      .then((port) => {
        if (!port) return Promise.reject("Port not found");
        return Promise.all([
          ctx.db.insert("situations", newSituation),
          ctx.db.patch(verdict.binding, {
            success: verdict.outcome === "success",
          }),
          ...(verdict.outcome === "failure"
            ? verdict.exceptions.map((exception) =>
                ctx.db.replace(exception.context._id, exception.context)
              )
            : []),
          portRefinement
            ? "updatedPort" in portRefinement
              ? ctx.db
                  .insert("portIterations", {
                    port: port._id,
                    timesBound: 0,
                    timesSuccessful: null,
                  })
                  .then((portIteration) =>
                    ctx.db.patch(portRefinement.updatedPort._id, {
                      currentIteration: portIteration,
                      history: {
                        ...port.history,
                        timesSuccessful:
                          verdict.outcome === "success"
                            ? (port.history.timesSuccessful ?? 0) + 1
                            : (port.history.timesSuccessful ?? 0),
                      },
                    })
                  )
              : ctx.db
                  .insert("ports", portRefinement.newPort)
                  .then((newPortId) =>
                    ctx.db.insert("portIterations", {
                      port: newPortId,
                      timesBound: 0,
                      timesSuccessful: null,
                    })
                  )
            : null,
        ]);
      }),
});

export const handleInitilizationData = internalMutation({
  args: {
    name: v.string(),
    initialSituation: v.object({
      state: v.string(),
      embeddedState: v.array(v.float64()),
    }),
  },
  handler: (ctx, { name, initialSituation }) =>
    ctx.db
      .insert("actors", {
        name,
        updatedAt: Date.now(),
      })
      .then((actor) =>
        ctx.db.insert("situations", {
          actor,
          previous: null,
          state: initialSituation.state,
          embeddedState: initialSituation.embeddedState,
        })
      ),
});

export const initializeActor = internalAction({
  args: {
    name: v.string(),
    state: v.string(),
  },
  handler: async (ctx, { name, state }) => {
    await embed({
      model: languageModels.textEmbedding,
      value: state,
    }).then(({ embedding: embeddedState }) =>
      ctx.runMutation(internal.tam.coreLoop.handleInitilizationData, {
        name,
        initialSituation: { state, embeddedState },
      })
    );
  },
});

export const searchPorts = internalAction({
  args: {
    actor: v.id("actors"),
    situation: v.string(),
    predicate: v.optional(v.string()),
  },
  returns: v.array(doc(schema, "ports")),
  handler: async (
    ctx,
    { actor, situation, predicate }
  ): Promise<Doc<"ports">[]> => {
    const situationCtx = await ctx.runQuery(
      internal.tam.coreLoop.getSituationContext,
      {
        actor,
      }
    );
    if (!situationCtx) throw new Error("No situation exists to bind to");
    if (situationCtx.binding)
      throw new Error("A binding is already in progress");

    const [whenMatches, thenMatches] = await Promise.all([
      embed({
        model: languageModels.textEmbedding,
        value: situation,
      })
        .then(({ embedding }) =>
          ctx.vectorSearch("ports", "by_embeddedWhen", {
            vector: embedding,
            limit: 10,
            filter: (q) => q.eq("actor", actor),
          })
        )
        .then((candidates) =>
          Promise.all(
            candidates.map((port) =>
              ctx.runQuery(internal.tam.coreLoop.getPort, { id: port._id })
            )
          )
        ),
      predicate
        ? embed({
            model: languageModels.textEmbedding,
            value: predicate,
          })
            .then(({ embedding }) =>
              ctx.vectorSearch("ports", "by_embeddedThen", {
                vector: embedding,
                limit: 10,
                filter: (q) => q.eq("actor", actor),
              })
            )
            .then((candidates) =>
              Promise.all(
                candidates.map((port) =>
                  ctx.runQuery(internal.tam.coreLoop.getPort, { id: port._id })
                )
              )
            )
        : [],
    ]);

    const allPorts = [...whenMatches, ...thenMatches].filter(
      (port): port is NonNullable<typeof port> => port !== null
    );
    const deduplicatedPorts = [
      ...new Map(allPorts.map((port) => [port._id, port])).values(),
    ];

    return deduplicatedPorts;
  },
});

export const bindPort = internalAction({
  args: {
    actor: v.id("actors"),
    intent: v.string(),
    affordances: v.array(
      v.object({
        _id: v.id("ports"),
        action: v.object({
          name: v.string(),
          description: v.string(),
          schema: v.record(v.string(), v.any()),
        }),
        predicate: v.object({ when: v.string(), then: v.string() }),
      })
    ),
  },
  handler: async (ctx, { actor, intent, affordances }) => {
    const situationCtx = await ctx.runQuery(
      internal.tam.coreLoop.getSituationContext,
      {
        actor,
      }
    );
    if (!situationCtx) throw new Error("No situation exists to bind to");
    if (situationCtx.binding)
      throw new Error("A binding is already in progress");

    const choice = await choosePort(
      situationCtx.situation.state,
      affordances,
      intent
    );

    await ctx.runMutation(internal.tam.coreLoop.handleBindingData, {
      situation: situationCtx.situation._id,
      port: choice.portId,
      success: null,
      justification: choice.justification,
      arguments: choice.arguments,
      actor,
      status: "active",
    });
  },
});

export const processEpisode = internalAction({
  args: {
    actor: v.id("actors"),
  },
  handler: async (ctx, { actor }) => {
    const situationCtx = await ctx.runQuery(
      internal.tam.coreLoop.getSituationContext,
      { actor }
    );

    if (
      !situationCtx ||
      !situationCtx.binding ||
      !situationCtx.port ||
      !situationCtx.episode
    ) {
      throw new Error("No binding is in progress");
    }

    await ctx.runMutation(internal.tam.coreLoop.updateBindingStatus, {
      id: situationCtx.binding._id,
      status: "evaluating",
    });

    const { trajectory, situation } = await inferTrajectory(
      situationCtx.episode,
      situationCtx.situation.state,
      situationCtx.port.predicate.when
    );

    const { verdict } = await evaluateThen(
      trajectory,
      situationCtx.port.predicate.then
    );

    const resolvedVerdict =
      verdict.outcome === "success"
        ? verdict
        : {
            ...verdict,
            exceptions: verdict.exceptions.map((exception) => ({
              context: {
                ...situationCtx.episode![exception.index],
                verdict: {
                  outcome: "exception" as const,
                  reason: exception.reason,
                },
              },
            })),
          };

    const refinement = await refinePort(resolvedVerdict, {
      when: situationCtx.port.predicate.when,
      then: situationCtx.port.predicate.then,
    });

    await ctx.runMutation(internal.tam.coreLoop.handleRefinementData, {
      newSituation: {
        ...situation,
        previous: situationCtx.situation._id,
        actor,
      },
      verdict: { binding: situationCtx.binding._id, ...resolvedVerdict },
      portRefinement: refinement
        ? {
            ...(refinement.method === "proliferate"
              ? {
                  newPort: {
                    ...situationCtx.port,
                    predicate: {
                      when: refinement.when,
                      then: refinement.then,
                      embeddedWhen: refinement.embeddedWhen,
                      embeddedThen: refinement.embeddedThen,
                    },
                    history: {
                      totalIterations: 0,
                      timesSuccessful: null,
                      timesBound: 0,
                    },
                  },
                }
              : {
                  updatedPort: {
                    predicate: omit(refinement, ["method"]),
                    _id: situationCtx.port._id,
                    actor,
                  },
                }),
          }
        : null,
    });
  },
});
