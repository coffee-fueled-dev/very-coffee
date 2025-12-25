import { defineTable } from "convex/server";
import { v } from "convex/values";
import { arcGameActions, arcGameTitles } from "./_api";

export const arcAGI3Tables = {
  scorecards: defineTable({
    cardId: v.string(),
    player: v.id("actors"),
    status: v.union(v.literal("active"), v.literal("complete")),
  })
    .index("by_cardId", ["cardId"])
    .index("by_player", ["player"]),

  games: defineTable({
    world: v.id("worlds"),
    availableActions: v.array(v.id("gameActions")),
    title: v.union(...arcGameTitles.map(v.literal)),
    gameId: v.string(),
  })
    .index("by_gameId", ["gameId"])
    .index("by_world", ["world"]),

  gameplays: defineTable({
    game: v.id("games"),
    guid: v.string(),
    session: v.id("sessions"),
    scorecard: v.id("scorecards"),
    initialSituation: v.id("situations"),
    maxSteps: v.optional(v.number()),
    currentStep: v.number(),
    status: v.union(v.literal("active"), v.literal("complete")),
  })
    .index("by_session", ["session"])
    .index("by_scorecard_status", ["scorecard", "status"]),

  gameActions: defineTable({
    key: v.union(...arcGameActions.map(v.literal)),
    description: v.string(),
    schema: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_key", ["key"])
    .searchIndex("by_fulltextDescription", {
      searchField: "description",
    }),

  portActions: defineTable({
    port: v.id("ports"),
    gameAction: v.id("gameActions"),
  })
    .index("by_port", ["port"])
    .index("by_gameAction", ["gameAction"]),
};
