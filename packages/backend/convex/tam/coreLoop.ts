import { v } from "convex/values";
import { languageModels, vEmbeddedValue } from "./_util";
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
import { pick } from "convex-helpers";

export const getWorldPorts = internalQuery({
  args: {
    world: v.id("worlds"),
  },
  handler: async (ctx, { world }) => {
    const actionStream = ctx.db
      .query("actions")
      .withIndex("by_world", (q) => q.eq("world", world));

    const ports = [];
    for await (const action of actionStream) {
      const portStream = ctx.db
        .query("ports")
        .withIndex("by_action", (q) => q.eq("action", action._id));

      for await (const port of portStream) {
        ports.push({
          ...pick(port, ["_id", "predicate"]),
          action: pick(action, ["key", "description", "schema"]),
        });
      }
    }

    return ports;
  },
});

export const getPort = internalQuery({
  args: {
    id: v.id("ports"),
  },
  handler: (ctx, { id }) => ctx.db.get(id),
});

export const savePredicate = internalMutation({
  args: {
    port: v.id("ports"),
    predicate: v.object({
      when: vEmbeddedValue,
      then: vEmbeddedValue,
    }),
  },
  handler: (ctx, { port, predicate }) => ctx.db.patch(port, { predicate }),
});

export const saveSituationState = internalMutation({
  args: {
    situation: v.id("situations"),
    state: vEmbeddedValue,
  },
  handler: (ctx, { situation, state }) => ctx.db.patch(situation, { state }),
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
    session: v.id("sessions"),
  },
  handler: async (ctx, { session }) =>
    Promise.all([
      ctx.db.get(session),
      ctx.db
        .query("situations")
        .withIndex("by_session", (q) => q.eq("session", session))
        .order("desc")
        .first(),
      ctx.db
        .query("bindings")
        .withIndex("by_session", (q) => q.eq("session", session))
        .order("desc")
        .first(),
    ])
      .then(([session, situation, binding]) => {
        if (!session) return Promise.reject(`Missing session ${session}`);
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
          ctx.db
            .get(session.actor)
            .then((actor) =>
              actor ? actor : Promise.reject(`Missing actor ${session.actor}`)
            ),
        ]);
      })
      .then(([situation, binding, episode, port, actor]) => ({
        situation,
        binding,
        episode,
        port,
        actor,
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
    actor: v.id("actors"),
    world: v.id("worlds"),
    initialSituation: v.object({
      state: vEmbeddedValue,
    }),
    session: v.object({
      source: v.string(),
      id: v.string(),
    }),
  },
  handler: (ctx, { actor, world, initialSituation, session }) =>
    void ctx.db
      .insert("sessions", {
        actor,
        world,
        external: session,
        status: "active",
      })
      .then((session) =>
        ctx.db.insert("situations", {
          actor,
          previous: null,
          state: initialSituation.state,
          session,
        })
      ),
});

export const initializeSession = internalAction({
  args: {
    actor: v.id("actors"),
    world: v.id("worlds"),
    state: v.string(),
    session: v.object({
      source: v.string(),
      id: v.string(),
    }),
  },
  handler: async (ctx, { actor, world, state, session }) =>
    void ctx.runMutation(internal.tam.coreLoop.handleInitilizationData, {
      actor,
      world,
      initialSituation: { state: { value: state } },
      session,
    }),
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
    session: v.id("sessions"),
    intent: v.string(),
    affordances: v.array(
      v.object({
        _id: v.id("ports"),
        action: v.object({
          key: v.string(),
          description: v.string(),
          schema: v.optional(v.record(v.string(), v.any())),
        }),
        predicate: v.object({ when: v.string(), then: v.string() }),
      })
    ),
  },
  handler: async (ctx, { session, intent, affordances }) => {
    const situationCtx = await ctx.runQuery(
      internal.tam.coreLoop.getSituationContext,
      {
        session,
      }
    );
    if (!situationCtx) throw new Error("No situation exists to bind to");
    if (situationCtx.binding)
      throw new Error("A binding is already in progress");

    const choice = await choosePort(
      situationCtx.situation.state.value,
      affordances,
      intent
    );

    await ctx.runMutation(internal.tam.coreLoop.handleBindingData, {
      situation: situationCtx.situation._id,
      port: choice.portId,
      success: null,
      justification: choice.justification,
      arguments: choice.arguments,
      actor: situationCtx.actor._id,
      status: "active",
      session,
    });
  },
});

export const processEpisode = internalAction({
  args: {
    session: v.id("sessions"),
  },
  handler: async (ctx, { session }) => {
    const situationCtx = await ctx.runQuery(
      internal.tam.coreLoop.getSituationContext,
      { session }
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
      situationCtx.situation.state.value,
      situationCtx.port.predicate.when.value
    );

    const { verdict } = await evaluateThen(
      trajectory,
      situationCtx.port.predicate.then.value
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
      when: situationCtx.port.predicate.when.value,
      then: situationCtx.port.predicate.then.value,
    });

    await ctx.runMutation(internal.tam.coreLoop.handleRefinementData, {
      newSituation: {
        ...situation,
        previous: situationCtx.situation._id,
        actor: situationCtx.actor._id,
        session,
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
                    actor: situationCtx.actor._id,
                  },
                }),
          }
        : null,
    });
  },
});

export const embedPredicate = internalAction({
  args: {
    port: v.id("ports"),
    when: v.optional(v.string()),
    then: v.optional(v.string()),
  },
  handler: async (ctx, { port, when, then }) => {
    const portDoc = await ctx.runQuery(internal.tam.coreLoop.getPort, {
      id: port,
    });
    if (!portDoc) throw new Error(`Port ${port} not found`);

    const currentPredicate = portDoc.predicate;
    const [whenEmbedding, thenEmbedding] = await Promise.all([
      when
        ? embed({
            model: languageModels.textEmbedding,
            value: when,
          }).then(({ embedding }) => ({
            value: when,
            embedding,
          }))
        : Promise.resolve(null),
      then
        ? embed({
            model: languageModels.textEmbedding,
            value: then,
          }).then(({ embedding }) => ({
            value: then,
            embedding,
          }))
        : Promise.resolve(null),
    ]);

    await ctx.runMutation(internal.tam.coreLoop.savePredicate, {
      port,
      predicate: {
        when: whenEmbedding ?? currentPredicate.when,
        then: thenEmbedding ?? currentPredicate.then,
      },
    });
  },
});

export const embedState = internalAction({
  args: { situation: v.id("situations"), state: v.string() },
  handler: (ctx, { situation, state }) =>
    void embed({
      model: languageModels.textEmbedding,
      value: state,
    }).then(({ embedding }) =>
      ctx.runMutation(internal.tam.coreLoop.saveSituationState, {
        situation,
        state: {
          value: state,
          embedding,
        },
      })
    ),
});
