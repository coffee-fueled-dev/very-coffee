import { closeScorecard } from "./_api";
import { internalAction, internalMutation } from "../customFunctions";
import { v } from "convex/values";
import { arcAGI3Actions } from "./_adapters";
import {
  arcGameTitles,
  listArcGames,
  openScorecard,
  sendCommand,
} from "./_api";
import { internal } from "../_generated/api";
import { initializeSession } from "../tam/_functions";
import { Id } from "../_generated/dataModel";

export const initialize = internalAction({
  args: {
    gameTitles: v.array(v.union(...arcGameTitles.map(v.literal))),
    player: v.union(
      v.object({ id: v.id("actors") }),
      v.object({ name: v.string() })
    ),
    limits: v.object({
      maxSteps: v.number(),
    }),
  },
  handler: async (
    ctx,
    { gameTitles, player, limits }
  ): Promise<Id<"gameplays">[]> => {
    const games = await listArcGames();
    const chosenGames = games.filter((game) => gameTitles.includes(game.title));

    const actor = await ctx.runMutation(internal.arcAgi.tam.getActor, {
      player,
    });

    const externalScorecard = await openScorecard({
      tags: ["agent", "tam", JSON.stringify(limits)],
      opaque: {
        actor: { source: "convex:actors", id: actor },
      },
    });

    console.log(`Opened scorecard: ${externalScorecard.card_id}`);

    const scorecard = await ctx.runMutation(
      internal.arcAgi.scorecard.createScorecard,
      {
        cardId: externalScorecard.card_id,
        player: actor,
      }
    );

    return await Promise.all(
      chosenGames.map((game) =>
        sendCommand({
          action: "RESET",
          gameId: game.game_id,
          cardId: externalScorecard.card_id,
        }).then((initialFrame) =>
          ctx.runMutation(internal.arcAgi.scorecard.handleInitialization, {
            title: game.title,
            gameId: game.game_id,
            guid: initialFrame.guid,
            scorecard,
            initialSituation: initialFrame.frame[0],
            availableActions: initialFrame.available_actions,
            actor,
            limits,
          })
        )
      )
    );
  },
});

export const createScorecard = internalMutation({
  args: {
    cardId: v.string(),
    player: v.id("actors"),
  },
  returns: v.id("scorecards"),
  handler: (ctx, { cardId, player }) =>
    ctx.db.insert("scorecards", { cardId, player, status: "active" }),
});

export const handleInitialization = internalMutation({
  args: {
    title: v.union(...arcGameTitles.map(v.literal)),
    gameId: v.string(),
    guid: v.string(),
    scorecard: v.id("scorecards"),
    initialSituation: v.array(v.array(v.number())),
    availableActions: v.array(v.number()),
    actor: v.id("actors"),
    limits: v.object({
      maxSteps: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const world = await ctx.db
      .query("worlds")
      .withIndex("by_external", (q) =>
        q.eq("external", {
          source: "arc-agi-3",
          id: args.gameId,
        })
      )
      .unique()
      .then((world) =>
        world
          ? world
          : ctx.db
              .insert("worlds", {
                name: args.title,
                external: {
                  source: "arc-agi-3",
                  id: args.gameId,
                },
              })
              .then((newWorld) => ctx.db.get(newWorld))
              .then((newWorld) =>
                newWorld
                  ? newWorld
                  : Promise.reject(`Missing world ${newWorld}`)
              )
      );

    // Find or create gameActions and ports, preventing duplicates
    const gameActionIds: Id<"gameActions">[] = [];

    for (const actionIndex of args.availableActions) {
      const seedAction = arcAGI3Actions[actionIndex];
      if (!seedAction) continue;

      // Look for existing gameAction with matching key
      const existingGameAction = await ctx.db
        .query("gameActions")
        .withIndex("by_key", (q) => q.eq("key", seedAction.key))
        .unique();

      // Check if there's already a port for this world linked to this action
      if (existingGameAction) {
        const existingRelations = await ctx.db
          .query("portActions")
          .withIndex("by_gameAction", (q) =>
            q.eq("gameAction", existingGameAction._id)
          )
          .collect();

        let hasPortInWorld = false;
        for (const relation of existingRelations) {
          const port = await ctx.db.get(relation.port);
          if (port && port.world === world._id) {
            hasPortInWorld = true;
            break;
          }
        }

        if (hasPortInWorld) {
          gameActionIds.push(existingGameAction._id);
          continue;
        }

        // Create a new port for this world and link to existing action
        const port = await ctx.db.insert("ports", {
          actor: args.actor,
          world: world._id,
          schema: "schema" in seedAction ? seedAction.schema : undefined,
          predicate: {
            behavior: { value: seedAction.predicate.behavior },
            when: { value: seedAction.predicate.when },
            then: { value: seedAction.predicate.then },
          },
          history: {
            timesBound: 0,
            timesSuccessful: null,
            totalIterations: 0,
          },
        });

        await ctx.db.insert("portActions", {
          port,
          gameAction: existingGameAction._id,
        });

        gameActionIds.push(existingGameAction._id);
        continue;
      }

      // Create new port and gameAction
      const port = await ctx.db.insert("ports", {
        actor: args.actor,
        world: world._id,
        schema: "schema" in seedAction ? seedAction.schema : undefined,
        predicate: {
          behavior: { value: seedAction.predicate.behavior },
          when: { value: seedAction.predicate.when },
          then: { value: seedAction.predicate.then },
        },
        history: {
          timesBound: 0,
          timesSuccessful: null,
          totalIterations: 0,
        },
      });

      const gameActionId = await ctx.db.insert("gameActions", {
        key: seedAction.key,
        description: seedAction.predicate.behavior,
        schema: "schema" in seedAction ? seedAction.schema : undefined,
      });

      await ctx.db.insert("portActions", {
        port,
        gameAction: gameActionId,
      });

      gameActionIds.push(gameActionId);
    }

    const { sessionId, situationId } = await initializeSession(ctx, {
      actor: args.actor,
      world: world._id,
      initialSituation: {
        state: { value: JSON.stringify(args.initialSituation) },
      },
      session: {
        source: "arc-agi-3",
        id: args.gameId,
      },
    });

    const existingGame = await ctx.db
      .query("games")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .unique();

    let gameId: Id<"games">;
    if (existingGame) {
      // Merge availableActions, avoiding duplicates
      const existingIds = new Set(existingGame.availableActions);
      const newActions = gameActionIds.filter((id) => !existingIds.has(id));
      const mergedActions = [...existingGame.availableActions, ...newActions];
      await ctx.db.patch(existingGame._id, { availableActions: mergedActions });
      gameId = existingGame._id;
    } else {
      gameId = await ctx.db.insert("games", {
        world: world._id,
        gameId: args.gameId,
        title: args.title,
        availableActions: gameActionIds,
      });
    }

    return await ctx.db.insert("gameplays", {
      status: "active",
      currentStep: 0,
      game: gameId,
      session: sessionId,
      scorecard: args.scorecard,
      initialSituation: situationId,
      guid: args.guid,
      maxSteps: args.limits.maxSteps,
    });
  },
});

export const handleCompletion = internalAction({
  args: { cardId: v.string() },
  handler: async (_ctx, { cardId }) => {
    const scorecard = await closeScorecard(cardId);
    console.log(
      `Closed scorecard ${cardId} with result ${JSON.stringify(scorecard)}`
    );
    return scorecard;
  },
});
