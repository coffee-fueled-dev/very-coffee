import { v } from "convex/values";
import { languageModels } from "../conversation/_agents";
import { embed, generateObject } from "ai";
import { z } from "zod/v4";
import {
  internalQuery,
  internalMutation,
  internalAction,
} from "../customFunctions";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { doc, partial } from "convex-helpers/validators";
import schema from "../schema";
import { pick } from "convex-helpers";
import { withoutSystemFields } from "convex-helpers";

export const getPort = internalQuery({
  args: {
    id: v.id("ports"),
  },
  returns: v.union(doc(schema, "ports"), v.null()),
  handler: (ctx, { id }): Promise<Doc<"ports"> | null> => ctx.db.get(id),
});

export const getSituationContext = internalQuery({
  args: {
    actor: v.id("actors"),
  },
  returns: v.union(
    v.object({
      situation: doc(schema, "situations"),
      binding: v.union(doc(schema, "bindings"), v.null()),
      port: v.union(doc(schema, "ports"), v.null()),
    }),
    v.null()
  ),
  handler: async (
    ctx
  ): Promise<{
    situation: Doc<"situations">;
    binding: Doc<"bindings"> | null;
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
          binding ? ctx.db.get(binding.port) : null,
        ]);
      })
      .then(([situation, binding, port]) => ({
        situation,
        binding,
        port,
      }))
      .catch(() => null),
});

export const handleBindingData = internalMutation({
  args: withoutSystemFields(doc(schema, "bindings").fields),
  handler: (ctx, binding) =>
    ctx.db.get(binding.port).then((port) => {
      if (!port) return Promise.reject("Port not found");
      return Promise.all([
        ctx.db.insert("bindings", binding),
        ctx.db.patch(binding.port, {
          timesBound: port.timesBound + 1,
          updatedAt: Date.now(),
        }),
      ]);
    }),
});

export const handleRefinementData = internalMutation({
  args: {
    newSituation: v.object(
      withoutSystemFields(doc(schema, "situations").fields)
    ),
    updatedBinding: v.object({
      success: v.boolean(),
      _id: v.id("bindings"),
    }),
    portRefinement: v.union(
      v.object({
        updatedPort: v.object({
          ...partial(withoutSystemFields(doc(schema, "ports").fields)),
          _id: v.id("ports"),
        }),
      }),
      v.object({
        newPort: v.object(withoutSystemFields(doc(schema, "ports").fields)),
      }),
      v.null()
    ),
  },
  handler: (ctx, { newSituation, updatedBinding, portRefinement }) =>
    ctx.db
      .get(updatedBinding._id)
      .then((b) => {
        if (!b) return Promise.reject("Binding not found");
        return ctx.db.get(b.port);
      })
      .then((port) => {
        if (!port) return Promise.reject("Port not found");
        return Promise.all([
          ctx.db.insert("situations", newSituation),
          ctx.db.patch(updatedBinding._id, updatedBinding),
          portRefinement
            ? "updatedPort" in portRefinement
              ? ctx.db.patch(portRefinement.updatedPort._id, {
                  ...portRefinement.updatedPort,
                  timesSuccessful: updatedBinding.success
                    ? (port.timesSuccessful ?? 0) + 1
                    : (port.timesSuccessful ?? 0),
                  updatedAt: Date.now(),
                })
              : ctx.db.insert("ports", portRefinement.newPort)
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
          updatedAt: null,
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
    const situationContext = await ctx.runQuery(
      internal.tam.coreLoop.getSituationContext,
      {
        actor,
      }
    );
    if (!situationContext) throw new Error("No situation exists to bind to");
    if (situationContext.binding)
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
    when: v.string(),
    then: v.optional(v.string()),
  },
  handler: async (ctx, { actor, intent, when, then }) => {
    const situationContext = await ctx.runQuery(
      internal.tam.coreLoop.getSituationContext,
      {
        actor,
      }
    );
    if (!situationContext) throw new Error("No situation exists to bind to");
    if (situationContext.binding)
      throw new Error("A binding is already in progress");

    const [whenMatches, thenMatches] = await Promise.all([
      embed({
        model: languageModels.textEmbedding,
        value: when,
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
      then
        ? embed({
            model: languageModels.textEmbedding,
            value: then,
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

    const choice = await choosePort(
      situationContext.situation.state,
      deduplicatedPorts.map((port) => ({
        _id: port._id,
        predicate: {
          when: port.predicate.when,
          then: port.predicate.then,
        },
      })),
      intent
    );

    await ctx.runMutation(internal.tam.coreLoop.handleBindingData, {
      situation: situationContext.situation._id,
      port: choice.chosenActionId,
      success: null,
      reason: choice.reason,
      confidence: choice.confidence,
      updatedAt: Date.now(),
      actor,
    });
  },
});

export const processEpisode = internalAction({
  args: {
    actor: v.id("actors"),
    episode: v.array(
      v.object({
        source: v.string(),
        timestamp: v.number(),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, { actor, episode }) => {
    const situationContext = await ctx.runQuery(
      internal.tam.coreLoop.getSituationContext,
      { actor }
    );

    if (
      !situationContext ||
      !situationContext.binding ||
      !situationContext.port
    )
      throw new Error("No binding is in progress");

    const { trajectory, situation } = await inferTrajectory(
      episode,
      situationContext.situation.state,
      situationContext.port.predicate.when
    );

    const { verdict } = await evaluateThen(
      trajectory,
      situationContext.port.predicate.then
    );

    const resolvedVerdict =
      verdict.success === "TRUE"
        ? ({ success: "TRUE" } as const)
        : ({
            success: "FALSE",
            exceptions: verdict.exceptions.map((exception) => ({
              event: episode[exception.index],
              reason: exception.reason,
            })),
          } as const);

    const refinement = await refinePort(resolvedVerdict, {
      when: situationContext.port.predicate.when,
      then: situationContext.port.predicate.then,
    });

    await ctx.runMutation(internal.tam.coreLoop.handleRefinementData, {
      newSituation: {
        ...situation,
        previous: situationContext.situation._id,
        actor,
        updatedAt: null,
      },
      updatedBinding: {
        _id: situationContext.binding._id,
        success: verdict.success === "TRUE" ? true : false,
      },
      portRefinement: refinement
        ? {
            ...(refinement.method === "proliferate"
              ? {
                  newPort: {
                    predicate: {
                      when: refinement.when,
                      then: refinement.then,
                      embeddedWhen: refinement.embeddedWhen,
                      embeddedThen: refinement.embeddedThen,
                    },
                    timesSuccessful: null,
                    timesBound: 0,
                    actor,
                    updatedAt: null,
                  },
                }
              : {
                  updatedPort: {
                    ...refinement,
                    _id: situationContext.port._id,
                    actor,
                    updatedAt: Date.now(),
                  },
                }),
          }
        : null,
    });
  },
});

// --- LLM Functions ---

export async function evaluateThen(observedTrajectory: string[], then: string) {
  return generateObject({
    model: languageModels.chat,
    messages: [
      {
        role: "user",
        content: `Did any state of the observed trajectory violate the expected outcome?`,
      },
      {
        role: "assistant",
        content: JSON.stringify({ observedTrajectory, then }, null, 2),
      },
    ],
    schema: z.object({
      verdict: z.union([
        z.object({ success: z.literal("TRUE") }),
        z.object({
          success: z.literal("FALSE"),
          exceptions: z
            .array(
              z.object({
                index: z
                  .number()
                  .min(0)
                  .max(observedTrajectory.length - 1)
                  .describe("Index of the event in the sequence"),
                reason: z
                  .string()
                  .describe(
                    "Reason why this event did not fit the expectation"
                  ),
              })
            )
            .describe("A list of exceptions to the expectation"),
        }),
      ]),
    }),
  }).then((result) => result.object);
}

export async function inferTrajectory(
  episode: { source: string; timestamp: number; content: string }[],
  situation: string,
  port: string
) {
  const { object: trajectory } = await generateObject({
    model: languageModels.chat,
    messages: [
      {
        role: "user",
        content: `From the previous situation, an port was chosen which resulted in an episode from the world.
          Given that episode, infer the causal chain of events in the world, ending with the current state.
          Each state in the causal chain should be a concise description of the world at that point in time.`,
      },
      {
        role: "assistant",
        content: JSON.stringify({ situation, episode, port }, null, 2),
      },
    ],
    output: "array",
    schema: z.string(),
  });

  const { embedding: embeddedState } = await embed({
    model: languageModels.textEmbedding,
    value: trajectory[trajectory.length - 1],
  });

  return {
    trajectory,
    situation: {
      state: trajectory[trajectory.length - 1],
      embeddedState: embeddedState,
    },
  };
}

export async function choosePort(
  situation: string,
  ports: { _id: Id<"ports">; predicate: { when: string; then: string } }[],
  intent: string
) {
  return generateObject({
    model: languageModels.chat,
    messages: [
      {
        role: "user",
        content: `Choose an action to take which best achieves the intent and adheres to the following rules:

          1. The current situation must be accounted for by the action predicate's "when" clause
          2. The action must be expected to advance progress toward the intent
          3. After acting, the world's response must fall within the action predicate's "then" clause expectations
          4. Among valid options, prefer actions with narrower "then" clauses (more specific commitments)`,
      },
      {
        role: "assistant",
        content: JSON.stringify(
          {
            situation,
            intent,
            actions: ports.map(({ _id, predicate }) => ({
              id: _id,
              predicate,
            })),
          },
          null,
          2
        ),
      },
    ],
    schema: z.object({
      chosenActionId: z.string().describe("The ID of the chosen action"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe(
          "Your confidence that the chosen action will achieve the intent while staying within expectations"
        ),
      reason: z.string().describe("The reason for choosing this action"),
    }),
  }).then(
    (result) =>
      result.object as {
        chosenActionId: Id<"ports">;
        confidence: number;
        reason: string;
      }
  );
}

export async function refinePort(
  bindingVerdict:
    | { success: "TRUE" }
    | {
        success: "FALSE";
        exceptions: Array<{
          event: { source: string; content: string; timestamp: number };
          reason: string;
        }>;
      },
  currentPort: {
    when: string;
    then: string;
  }
) {
  const { object: refinement } = await generateObject({
    model: languageModels.chat,
    messages: [
      {
        role: "user",
        content: `Based on the verdict of the binding, refine the port's "when" and "then" clauses according to the following rules:
        
        1. You must always refine your expectations in the case of a binding failure
        2. If the binding was successful, you may optionally refine your expectations to be more specific
        3. Refinement must always result in a port that would have succeeded in the observed episode`,
      },
      {
        role: "assistant",
        content: JSON.stringify(
          {
            bindingVerdict,
            currentPort,
          },
          null,
          2
        ),
      },
    ],
    schema: z.union([
      z
        .object({
          when: z.string().describe("The 'when' clause of the new port"),
          then: z.string().describe("The 'then' clause for the new port"),
          method: z.literal("proliferate"),
        })
        .describe(
          "Create a new, more specific port for this type of situation instead of refining the existing one."
        ),
      z
        .object({
          when: z
            .string()
            .nullable()
            .describe("The refined 'when' clause of the port"),
          then: z
            .string()
            .nullable()
            .describe("The refined 'then' clause of the port"),
          method: z.enum(["widen", "narrow"]),
        })
        .describe("Refine the existing port's 'when' and/or 'then' clauses."),
    ]),
  });

  if (
    refinement.method !== "proliferate" &&
    !refinement.when &&
    refinement.then !== null
  ) {
    const { then, method } = refinement;
    return await embed({
      model: languageModels.textEmbedding,
      value: then,
    }).then(({ embedding }) => ({
      method,
      then,
      embeddedThen: embedding,
    }));
  } else if (
    refinement.method !== "proliferate" &&
    !refinement.then &&
    refinement.when !== null
  ) {
    const { when, method } = refinement;
    return await embed({
      model: languageModels.textEmbedding,
      value: when,
    }).then(({ embedding }) => ({
      method,
      when,
      embeddedWhen: embedding,
    }));
  } else if (!refinement.then && !refinement.when) {
    return null;
  } else {
    return await Promise.all([
      embed({
        model: languageModels.textEmbedding,
        value: refinement.when,
      }),
      embed({
        model: languageModels.textEmbedding,
        value: refinement.then,
      }),
    ]).then(
      ([{ embedding: embeddedWhen }, { embedding: embeddedThen }]) =>
        ({
          ...refinement,
          embeddedWhen,
          embeddedThen,
        }) as {
          when: string;
          then: string;
          embeddedWhen: number[];
          embeddedThen: number[];
          method: "proliferate" | "widen" | "narrow";
        }
    );
  }
}
