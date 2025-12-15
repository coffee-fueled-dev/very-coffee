import { defineTable } from "convex/server";
import { SessionIdArg } from "convex-helpers/server/sessions";
import { v } from "convex/values";

export const aclTables = {
  sessions: defineTable({
    user: v.optional(v.id("users")),
    status: v.union(v.literal("active"), v.literal("inactive")),
    expiredAt: v.optional(v.number()),
    convexSessionId: SessionIdArg.sessionId,
    updatedAt: v.optional(v.number()),
  })
    .index("by_convexSessionId_status", ["convexSessionId", "status"])
    .index("by_user_status", ["user", "status"]),
};
