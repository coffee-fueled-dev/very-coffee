import { WithoutSystemFields } from "convex/server";
import { Doc } from "../_generated/dataModel";
import { mutation } from "../customFunctions";
import { v } from "convex/values";
import { z } from "zod/v4";

const arcAGI3Actions = [
  {
    key: "RESET",
    description: "Initialize or restarts the game/level state",
    predicate: {
      when: "The game is in some state",
      then: "The game will be reset to the initial state",
    },
  },
  {
    key: "ACTION1",
    description: "Simple action - varies by game (semantically mapped to up)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION2",
    description: "Simple action - varies by game (semantically mapped to down)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION3",
    description: "Simple action - varies by game (semantically mapped to left)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION4",
    description:
      "Simple action - varies by game (semantically mapped to right)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION5",
    description:
      "Simple action - varies by game (e.g., interact, select, rotate, attach/detach, execute, etc.)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION6",
    description: "Complex action requiring x,y coordinates (0-63 range)",
    schema: z.toJSONSchema(
      z.object({
        x: z
          .number()
          .min(0)
          .max(63)
          .describe(
            "The x coordinate to locate the action's effect on the game board"
          ),
        y: z
          .number()
          .min(0)
          .max(63)
          .describe(
            "The x coordinate to locate the action's effect on the game board"
          ),
      })
    ),
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION7",
    description: "Simple action - Undo (e.g., interact, select)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be at the previous state",
    },
  },
] as const satisfies (WithoutSystemFields<Omit<Doc<"actions">, "world">> & {
  predicate: { when: string; then: string };
})[];

export const initializeGame = mutation({
  args: {
    name: v.string(),
    id: v.string(),
    guid: v.string(),
    initialSituation: v.array(v.array(v.number())),
    availableActions: v.array(v.number()),
    player: v.union(
      v.object({ id: v.id("actors") }),
      v.object({ name: v.string() })
    ),
  },
  handler: async (ctx, game) => {
    const world = await ctx.db
      .query("worlds")
      .withIndex("by_external", (q) =>
        q.eq("external", {
          source: "arc-agi-3",
          id: game.id,
        })
      )
      .unique()
      .then((world) =>
        world
          ? world
          : ctx.db
              .insert("worlds", {
                name: game.name,
                external: {
                  source: "arc-agi-3",
                  id: game.id,
                },
              })
              .then((newWorld) => ctx.db.get(newWorld))
              .then((newWorld) =>
                newWorld
                  ? newWorld
                  : Promise.reject(`Missing world ${newWorld}`)
              )
      );

    const actor =
      "id" in game.player
        ? game.player.id
        : await ctx.db.insert("actors", { name: game.player.name });

    await Promise.all(
      game.availableActions
        .map((a) => arcAGI3Actions[a])
        .filter(Boolean)
        .map((seedAction) =>
          ctx.db
            .query("actions")
            .withIndex("by_key", (q) => q.eq("key", seedAction.key))
            .unique()
            .then((action) =>
              action
                ? action._id
                : ctx.db.insert("actions", {
                    ...seedAction,
                    world: world._id,
                  })
            )
            .then((action) =>
              ctx.db.insert("ports", {
                action,
                actor,
                predicate: {
                  when: { value: seedAction.predicate.when },
                  then: { value: seedAction.predicate.then },
                },
                history: {
                  timesBound: 0,
                  timesSuccessful: null,
                  totalIterations: 0,
                },
              })
            )
        )
    );

    // Create a scorecard in the arc agi api
    // Create a session with internal.tam.coreLoop.initializeSession and the scorecard id
  },
});
