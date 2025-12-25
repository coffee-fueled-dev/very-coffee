import { v } from "convex/values";
import {
  internalQuery,
  internalMutation,
  internalAction,
} from "../customFunctions";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { omit } from "convex-helpers";
import {
  choosePort,
  evaluateThen,
  inferTrajectory,
  refinePort,
} from "./_functions";
import { languageModels, vEmbeddedValue } from "./_util";
import { embed } from "ai";

export const get = internalQuery({
  args: {
    situation: v.id("situations"),
  },
  handler: async (ctx, { situation }) => {
    return await ctx.db.get(situation);
  },
});

export const saveState = internalMutation({
  args: {
    situation: v.id("situations"),
    state: vEmbeddedValue,
  },
  handler: (ctx, { situation, state }) => ctx.db.patch(situation, { state }),
});

export const embedState = internalAction({
  args: { situation: v.id("situations"), state: v.string() },
  handler: async (ctx, { situation, state }) => {
    await embed({
      model: languageModels.textEmbedding,
      value: state,
    }).then(({ embedding }) =>
      ctx.runMutation(internal.tam.situation.saveState, {
        situation,
        state: {
          value: state,
          embedding,
        },
      })
    );
  },
});

export const bindPort = internalAction({
  args: {
    session: v.id("sessions"),
    intent: v.string(),
    affordances: v.array(
      v.object({
        _id: v.id("ports"),
        predicate: v.object({
          behavior: v.string(),
          when: v.string(),
          then: v.string(),
        }),
        schema: v.optional(v.record(v.string(), v.any())),
      })
    ),
  },
  returns: v.id("bindings"),
  handler: async (
    ctx,
    { session, intent, affordances }
  ): Promise<Id<"bindings">> => {
    const sessionCtx = await ctx.runQuery(internal.tam.session.getContext, {
      session,
    });
    if (!sessionCtx) throw new Error(`Missing session ${session}`);
    if (sessionCtx.binding && sessionCtx.binding.status === "active")
      throw new Error("A binding is already in progress");

    const choice = await choosePort(
      sessionCtx.situation.state.value,
      affordances,
      intent
    );

    const bindingId = await ctx.runMutation(
      internal.tam.session.handleBindingData,
      {
        situation: sessionCtx.situation._id,
        port: choice.portId,
        success: null,
        justification: choice.justification,
        arguments: choice.arguments,
        actor: sessionCtx.actor._id,
        status: "active",
        session,
      }
    );

    return bindingId;
  },
});

export const processEpisode = internalAction({
  args: {
    session: v.id("sessions"),
  },
  handler: async (ctx, { session }) => {
    const sessionCtx = await ctx.runQuery(internal.tam.session.getContext, {
      session,
    });

    if (
      !sessionCtx ||
      !sessionCtx.binding ||
      !sessionCtx.port ||
      !sessionCtx.episode
    ) {
      throw new Error("No binding is in progress");
    }

    await ctx.runMutation(internal.tam.binding.updateStatus, {
      id: sessionCtx.binding._id,
      status: "evaluating",
    });

    const trajectory = await inferTrajectory(
      sessionCtx.episode,
      sessionCtx.situation.state.value,
      {
        when: sessionCtx.port.predicate.when.value,
        then: sessionCtx.port.predicate.then.value,
        behavior: sessionCtx.port.predicate.behavior.value,
      }
    );

    const { verdict } = await evaluateThen(
      trajectory,
      sessionCtx.port.predicate.then.value
    );

    const resolvedVerdict =
      verdict.outcome === "success"
        ? verdict
        : {
            outcome: verdict.outcome,
            exceptions: verdict.exceptions
              .filter(
                (exception) =>
                  exception.index >= 0 &&
                  exception.index < sessionCtx.episode!.length
              )
              .map((exception) => ({
                context: {
                  ...sessionCtx.episode![exception.index],
                  exception: {
                    reason: exception.reason,
                  },
                },
              })),
          };

    const refinement = await refinePort(resolvedVerdict, {
      behavior: sessionCtx.port.predicate.behavior.value,
      when: sessionCtx.port.predicate.when.value,
      then: sessionCtx.port.predicate.then.value,
    });

    console.log("refinement", refinement);

    await ctx.runMutation(internal.tam.session.handleRefinementData, {
      newSituation: {
        state: {
          value: trajectory[trajectory.length - 1],
        },
        previous: sessionCtx.situation._id,
        actor: sessionCtx.actor._id,
        session,
      },
      verdict: { binding: sessionCtx.binding._id, ...resolvedVerdict },
      portRefinement: refinement
        ? {
            ...(refinement.method === "proliferate"
              ? {
                  newPort: {
                    actor: sessionCtx.port.actor,
                    world: sessionCtx.port.world,
                    parentPort: sessionCtx.port._id,
                    schema: sessionCtx.port.schema,
                    predicate: {
                      behavior: refinement.behavior,
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
                    _id: sessionCtx.port._id,
                    actor: sessionCtx.actor._id,
                  },
                }),
          }
        : null,
    });
  },
});
