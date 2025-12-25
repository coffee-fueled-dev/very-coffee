import { v } from "convex/values";
import { workflow } from "../workflow";
import { arcGameTitles } from "./_api";
import { internal } from "../_generated/api";
import { vWorkflowId, WorkflowId } from "@convex-dev/workflow";
import { vResultValidator } from "@convex-dev/workpool";
import { internalMutation, internalQuery, mutation } from "../customFunctions";

export const getAvailablePorts = internalQuery({
  args: {
    gameId: v.id("games"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { gameId, limit }) => {
    const game = await ctx.db.get(gameId);
    if (!game) throw new Error(`Missing game ${gameId}`);

    const portStream = ctx.db
      .query("ports")
      .withIndex("by_world", (q) => q.eq("world", game.world));

    if (limit) {
      return portStream.take(limit);
    }

    return portStream.collect();
  },
});

export const gameplayById = internalQuery({
  args: {
    id: v.id("gameplays"),
  },
  handler: (ctx, { id }) =>
    ctx.db
      .get(id)
      .then((gameplay) =>
        gameplay ? gameplay : Promise.reject(`Missing gameplay ${id}`)
      ),
});

export const bySession = internalQuery({
  args: {
    session: v.id("sessions"),
  },
  handler: (ctx, { session }) =>
    ctx.db
      .query("gameplays")
      .withIndex("by_session", (q) => q.eq("session", session))
      .unique()
      .then((gameplay) =>
        gameplay
          ? ctx.db
              .get(gameplay.game)
              .then((game) =>
                game
                  ? { game, gameplay }
                  : Promise.reject(`Missing game for session ${session}`)
              )
          : Promise.reject(`Missing gameplay for session ${session}`)
      ),
});

const vStartGamesArgs = v.object({
  gameTitles: v.array(v.union(...arcGameTitles.map(v.literal))),
  player: v.union(
    v.object({ id: v.id("actors") }),
    v.object({ name: v.string() })
  ),
  limits: v.object({
    maxSteps: v.number(),
  }),
});

export const startGames = workflow.define({
  args: vStartGamesArgs.fields,
  handler: async (ctx, { gameTitles, player, limits }) => {
    const gameplays = await ctx.runAction(
      internal.arcAgi.scorecard.initialize,
      {
        gameTitles,
        player,
        limits,
      }
    );

    for (const gameplay of gameplays) {
      await workflow.start(
        ctx,
        internal.arcAgi.gameStep.execute,
        { gameplay },
        {
          onComplete: internal.arcAgi.gameStep.after,
          context: { gameplay },
        }
      );
    }
  },
});

export const afterStartGames = internalMutation({
  args: {
    workflowId: vWorkflowId,
    result: vResultValidator,
    context: vStartGamesArgs,
  },
  handler: async (ctx, { workflowId, result, context }) => {
    await workflow.cleanup(ctx, workflowId);

    if (result.kind === "success") {
      console.log(
        `Successfully started games\n${JSON.stringify(context, null, 2)}`
      );
    } else if (result.kind === "failed") {
      console.error(
        `Failed to start games\n${JSON.stringify(context, null, 2)}`
      );
    } else if (result.kind === "canceled") {
      console.error(
        `Canceled starting games\n${JSON.stringify(context, null, 2)}`
      );
    }
  },
});

export const runStartGames = mutation({
  args: vStartGamesArgs.fields,
  handler: async (ctx, { gameTitles, player, limits }): Promise<WorkflowId> => {
    const workflowId = await workflow.start(
      ctx,
      internal.arcAgi.game.startGames,
      { gameTitles, player, limits },
      {
        onComplete: internal.arcAgi.game.afterStartGames,
        context: { gameTitles, player, limits },
      }
    );

    return workflowId;
  },
});
