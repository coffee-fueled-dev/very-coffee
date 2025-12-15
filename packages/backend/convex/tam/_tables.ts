import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tamTables = {
  actors: defineTable({
    name: v.string(),
    updatedAt: v.union(v.number(), v.null()),
  }),

  ports: defineTable({
    actor: v.id("actors"),
    predicate: v.object({
      when: v.string(),
      then: v.string(),
      embeddedWhen: v.array(v.float64()),
      embeddedThen: v.array(v.float64()),
    }),
    timesSuccessful: v.union(v.number(), v.null()),
    timesBound: v.number(),
    agencyScore: v.optional(v.float64()),
    updatedAt: v.union(v.number(), v.null()),
  })
    .vectorIndex("by_embeddedPredicate", {
      vectorField: "predicate.embeddedWhen",
      dimensions: 1536,
      filterFields: ["actor"],
    })
    .vectorIndex("by_embeddedWhen", {
      vectorField: "predicate.embeddedWhen",
      dimensions: 1536,
      filterFields: ["actor"],
    })
    .vectorIndex("by_embeddedThen", {
      vectorField: "predicate.embeddedThen",
      dimensions: 1536,
      filterFields: ["actor"],
    }),

  situations: defineTable({
    actor: v.id("actors"),
    previous: v.union(v.id("situations"), v.null()),
    state: v.string(),
    embeddedState: v.array(v.float64()),
    updatedAt: v.union(v.number(), v.null()),
  })
    .index("by_previous", ["previous"])
    .vectorIndex("by_embeddedState", {
      vectorField: "embeddedState",
      dimensions: 1536,
      filterFields: ["actor"],
    }),

  bindings: defineTable({
    actor: v.id("actors"),
    port: v.id("ports"),
    situation: v.id("situations"),
    reason: v.string(),
    confidence: v.float64(),
    success: v.union(v.null(), v.boolean()),
    updatedAt: v.union(v.number(), v.null()),
  })
    .index("by_situation", ["situation"])
    .index("by_port", ["port"]),
};
