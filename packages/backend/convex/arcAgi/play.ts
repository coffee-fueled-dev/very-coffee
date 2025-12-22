import { action, internalMutation } from "../customFunctions";
import { v } from "convex/values";
import { arcAGI3Actions } from "./_adapters";

export const initializeGame = action({
  args: {},
  handler: async (ctx) => {},
});

export const handleInitializationData = internalMutation({
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
