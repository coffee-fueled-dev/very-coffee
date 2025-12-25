import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../customFunctions";
import { v } from "convex/values";
import { ArcAGI3ActionSchema } from "./_adapters";
import { sendCommand } from "./_api";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { workflow } from "../workflow";
import { vWorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";

export const getGameAction = internalQuery({
  args: {
    port: v.id("ports"),
  },
  handler: async (ctx, { port: initialPortId }) => {
    // Traverse parent chain to find a port with an action
    let currentPortId: Id<"ports"> | null = initialPortId;
    const maxDepth = 100; // Prevent infinite loops

    for (let i = 0; i < maxDepth && currentPortId !== null; i++) {
      const relation = await ctx.db
        .query("portActions")
        .withIndex("by_port", (q) => q.eq("port", currentPortId!))
        .unique();

      if (relation) {
        return ctx.db.get(relation.gameAction);
      }

      // Follow parent chain
      const portDoc: Doc<"ports"> | null = await ctx.db.get(currentPortId);
      currentPortId = portDoc?.parentPort ?? null;
    }

    return null;
  },
});

export const selectCommand = internalAction({
  args: {
    gameplay: v.id("gameplays"),
  },
  returns: v.id("bindings"),
  handler: async (ctx, { gameplay: gameplayId }): Promise<Id<"bindings">> => {
    const gameplay = await ctx.runQuery(internal.arcAgi.game.gameplayById, {
      id: gameplayId,
    });

    const availablePorts = await ctx.runQuery(
      internal.arcAgi.game.getAvailablePorts,
      {
        gameId: gameplay.game,
      }
    );

    const binding = await ctx.runAction(internal.tam.situation.bindPort, {
      session: gameplay.session,
      intent: `Learn the objective of the game by testing actions and observing their effects on the game, and win using the actions available to you.
        The objective of the game will not be obvious until you take an action which causes an effect on some aspect of the game board.
        Notice what you control by acting, and what is effected by your actions.`,
      affordances: availablePorts.map((port) => ({
        _id: port._id,
        predicate: {
          behavior: port.predicate.behavior.value,
          when: port.predicate.when.value,
          then: port.predicate.then.value,
        },
        schema: port.schema,
      })),
    });

    return binding;
  },
});

export const commitCommand = internalAction({
  args: {
    binding: v.id("bindings"),
  },
  handler: async (ctx, { binding }) => {
    const resolvedBinding = await ctx.runQuery(internal.tam.binding.resolve, {
      id: binding,
    });
    if (!resolvedBinding) throw new Error(`Missing binding ${binding}`);
    if (!resolvedBinding.port)
      throw new Error(`Missing port for binding ${binding}`);

    const gameAction = await ctx.runQuery(
      internal.arcAgi.gameStep.getGameAction,
      { port: resolvedBinding.port._id }
    );
    if (!gameAction)
      throw new Error(
        `Missing gameAction for port ${resolvedBinding.port._id}`
      );

    const { game, gameplay } = await ctx.runQuery(
      internal.arcAgi.game.bySession,
      {
        session: resolvedBinding.session,
      }
    );

    try {
      const arcAction = ArcAGI3ActionSchema.parse({
        key: gameAction.key,
        args:
          resolvedBinding.arguments?.x != null &&
          resolvedBinding.arguments?.y != null
            ? {
                x: resolvedBinding.arguments?.x,
                y: resolvedBinding.arguments?.y,
              }
            : undefined,
      });

      const nextFrame = await sendCommand({
        action: arcAction.key,
        gameId: game.gameId,
        guid: gameplay.guid,
        x: arcAction.args?.x,
        y: arcAction.args?.y,
      });

      for (let i = 0; i < nextFrame.frame.length; i++) {
        await ctx.runMutation(internal.tam.world.produceContext, {
          session: resolvedBinding.session,
          context: {
            content: JSON.stringify(nextFrame.frame[i]),
            external: {
              source: "arc-agi-3",
              id: `${gameplay.guid}:${nextFrame.action_input.id}:${i}`,
            },
          },
        });
      }
    } catch (error) {
      await ctx.runMutation(internal.tam.world.produceContext, {
        session: resolvedBinding.session,
        context: {
          content: JSON.stringify(error),
          external: {
            source: "convex",
            id: `binding:${resolvedBinding._id}:error`,
          },
        },
      });
    } finally {
      await ctx.runAction(internal.tam.situation.processEpisode, {
        session: resolvedBinding.session,
      });
    }
  },
});

export const execute = workflow.define({
  args: {
    gameplay: v.id("gameplays"),
  },
  workpoolOptions: {
    retryActionsByDefault: true,
    defaultRetryBehavior: {
      base: 1000,
      initialBackoffMs: 1000,
      maxAttempts: 3,
    },
  },
  handler: async (ctx, { gameplay }) => {
    const binding = await ctx.runAction(
      internal.arcAgi.gameStep.selectCommand,
      {
        gameplay,
      }
    );

    await ctx.runAction(internal.arcAgi.gameStep.commitCommand, {
      binding,
    });
  },
});

export const after = internalMutation({
  args: {
    workflowId: vWorkflowId,
    result: vResultValidator,
    context: v.object({
      gameplay: v.id("gameplays"),
    }),
  },
  handler: async (ctx, args) => {
    await workflow.cleanup(ctx, args.workflowId);

    if (args.result.kind === "failed") {
      console.error(
        `Failed to execute game step\n${JSON.stringify(args.context, null, 2)}`
      );
      return;
    } else if (args.result.kind === "canceled") {
      console.error(
        `Canceled game step execution\n${JSON.stringify(args.context, null, 2)}`
      );
      return;
    }

    const gameplay = await ctx.db.get(args.context.gameplay);
    if (!gameplay) throw new Error(`Missing gameplay ${args.context.gameplay}`);
    await ctx.db.patch(gameplay._id, { currentStep: gameplay.currentStep + 1 });

    console.log(
      `Completed game step ${gameplay.currentStep + 1} of ${gameplay.maxSteps ?? "infinite"} for gameplay ${gameplay._id}`
    );

    const activeBinding = await ctx.db
      .query("bindings")
      .withIndex("by_session_status", (q) =>
        q.eq("session", gameplay.session).eq("status", "evaluating")
      )
      .unique();

    if (activeBinding) {
      await ctx.db.patch(activeBinding._id, { status: "resolved" });
    }

    if (
      gameplay.maxSteps === 0 ||
      (!!gameplay.maxSteps && gameplay.currentStep + 1 >= gameplay.maxSteps)
    ) {
      await ctx.db.patch(gameplay._id, { status: "complete" });
      const activeGames = await ctx.db
        .query("gameplays")
        .withIndex("by_scorecard_status", (q) =>
          q.eq("scorecard", gameplay.scorecard).eq("status", "active")
        )
        .collect();

      if (activeGames.length === 0) {
        console.log(
          `No active games found for scorecard ${gameplay.scorecard}`
        );
        const scorecard = await ctx.db.get(gameplay.scorecard);
        if (!scorecard)
          throw new Error(`Missing scorecard ${gameplay.scorecard}`);

        await ctx.db.patch(gameplay.session, { status: "complete" });
        await ctx.db.patch(gameplay.scorecard, { status: "complete" });

        await ctx.scheduler.runAfter(
          0,
          internal.arcAgi.scorecard.handleCompletion,
          {
            cardId: scorecard.cardId,
          }
        );
      }
    } else {
      console.log(
        `Starting next game step for gameplay ${args.context.gameplay}`
      );
      await workflow.start(
        ctx,
        internal.arcAgi.gameStep.execute,
        {
          gameplay: args.context.gameplay,
        },
        {
          onComplete: internal.arcAgi.gameStep.after,
          context: args.context,
        }
      );
    }
  },
});
