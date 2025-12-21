import { defineTable } from "convex/server";
import { v } from "convex/values";
import { vEmbeddedValue } from "./_util";

export const tamTables = {
  worlds: defineTable({
    name: v.string(),
    external: v.object({
      source: v.string(),
      id: v.string(),
    }),
  })
    .index("by_external", ["external"])
    .searchIndex("by_fulltextName", {
      searchField: "name",
    }),

  contexts: defineTable({
    binding: v.id("bindings"),
    session: v.id("sessions"),
    world: v.id("worlds"),
    external: v.object({
      source: v.string(),
      id: v.string(),
    }),
    content: v.string(),
    exception: v.optional(
      v.object({
        distance: v.optional(v.number()),
        reason: v.string(),
      })
    ),
  })
    .index("by_session", ["session"])
    .index("by_binding", ["binding"])
    .index("by_external", ["external"]),

  sessions: defineTable({
    actor: v.id("actors"),
    world: v.id("worlds"),
    status: v.union(v.literal("active"), v.literal("complete")),
    external: v.object({
      source: v.string(),
      id: v.string(),
    }),
  })
    .index("by_external_status", ["external", "status"])
    .index("by_actor_status", ["actor", "status"]),

  actions: defineTable({
    world: v.id("worlds"),
    key: v.string(),
    description: v.string(),
    schema: v.optional(v.record(v.string(), v.any())),
  })
    .index("by_world", ["world"])
    .index("by_key", ["key"])
    .searchIndex("by_fulltextDescription", {
      searchField: "description",
    }),

  actors: defineTable({
    name: v.string(),
  }),

  ports: defineTable({
    actor: v.id("actors"),
    action: v.id("actions"),
    currentIteration: v.optional(v.id("portIterations")),
    predicate: v.object({
      when: vEmbeddedValue,
      then: vEmbeddedValue,
    }),
    history: v.object({
      totalIterations: v.number(),
      timesSuccessful: v.union(v.number(), v.null()),
      timesBound: v.number(),
    }),
    agencyScore: v.optional(v.float64()),
  })
    .index("by_currentIteration", ["currentIteration"])
    .index("by_action", ["action"])
    .vectorIndex("by_embeddedWhen", {
      vectorField: "predicate.when.embedding",
      dimensions: 1536,
      filterFields: ["actor"],
    })
    .vectorIndex("by_embeddedThen", {
      vectorField: "predicate.then.embedding",
      dimensions: 1536,
      filterFields: ["actor"],
    }),

  portIterations: defineTable({
    port: v.id("ports"),
    timesBound: v.number(),
    timesSuccessful: v.union(v.number(), v.null()),
    agencyScore: v.optional(v.float64()),
  }).index("by_port", ["port"]),

  situations: defineTable({
    actor: v.id("actors"),
    session: v.id("sessions"),
    previous: v.union(v.id("situations"), v.null()),
    state: vEmbeddedValue,
  })
    .index("by_session", ["session"])
    .index("by_previous", ["previous"])
    .vectorIndex("by_embeddedState", {
      vectorField: "state.embedding",
      dimensions: 1536,
      filterFields: ["actor"],
    }),

  bindings: defineTable({
    actor: v.id("actors"),
    port: v.id("ports"),
    situation: v.id("situations"),
    session: v.id("sessions"),
    arguments: v.record(v.string(), v.any()),
    justification: v.string(),
    success: v.union(v.null(), v.boolean()),
    status: v.union(
      v.literal("active"),
      v.literal("evaluating"),
      v.literal("resolved")
    ),
  })
    .index("by_situation", ["situation"])
    .index("by_session", ["session"])
    .index("by_port", ["port"]),
};
