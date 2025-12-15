import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conversationTables = {
  conversations: defineTable({
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    threadId: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_threadId", ["threadId"])
    .searchIndex("by_title", {
      searchField: "title",
      filterFields: ["threadId"],
    }),

  participants: defineTable({
    conversation: v.id("conversations"),
    alias: v.union(
      v.object({
        type: v.literal("user"),
        account: v.id("accounts"),
      }),
      v.object({
        type: v.literal("agent"),
        name: v.string(),
      }),
    ),
    updatedAt: v.number(),
  }).index("by_conversation_alias", ["conversation", "alias"]),
};
