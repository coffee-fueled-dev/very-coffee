import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tamTables = {
  actors: defineTable({
    name: v.string(),
    updatedAt: v.union(v.number(), v.null()),
  }),

  actions: defineTable({
    name: v.string(),
    description: v.string(),
    schema: v.record(v.string(), v.any()),
    embeddedSchema: v.array(v.float64()),
  })
    .searchIndex("by_fulltextName", {
      searchField: "name",
    })
    .searchIndex("by_fulltextDescription", {
      searchField: "description",
    })
    .vectorIndex("by_embeddedSchema", {
      vectorField: "embeddedSchema",
      dimensions: 1536,
    }),

  portIterations: defineTable({
    port: v.id("ports"),
    timesBound: v.number(),
    timesSuccessful: v.union(v.number(), v.null()),
    agencyScore: v.optional(v.float64()),
  }).index("by_port", ["port"]),

  ports: defineTable({
    actor: v.id("actors"),
    action: v.id("actions"),
    currentIteration: v.optional(v.id("portIterations")),
    predicate: v.object({
      when: v.string(),
      then: v.string(),
      embeddedWhen: v.array(v.float64()),
      embeddedThen: v.array(v.float64()),
    }),
    history: v.object({
      totalIterations: v.number(),
      timesSuccessful: v.union(v.number(), v.null()),
      timesBound: v.number(),
    }),
    agencyScore: v.optional(v.float64()),
  })
    .index("by_currentIteration", ["currentIteration"])
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
  })
    .index("by_previous", ["previous"])
    .vectorIndex("by_embeddedState", {
      vectorField: "embeddedState",
      dimensions: 1536,
      filterFields: ["actor"],
    }),

  contexts: defineTable({
    binding: v.id("bindings"),
    source: v.string(),
    content: v.string(),
    exception: v.optional(
      v.object({
        distance: v.optional(v.number()),
        reason: v.string(),
      })
    ),
  })
    .index("by_binding", ["binding"])
    .searchIndex("by_source", {
      searchField: "source",
    }),

  bindings: defineTable({
    actor: v.id("actors"),
    port: v.id("ports"),
    arguments: v.record(v.string(), v.any()),
    situation: v.id("situations"),
    justification: v.string(),
    success: v.union(v.null(), v.boolean()),
    status: v.union(
      v.literal("active"),
      v.literal("evaluating"),
      v.literal("resolved")
    ),
  })
    .index("by_situation", ["situation"])
    .index("by_port", ["port"]),
};
