import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
  query as rawQuery,
  internalQuery as rawInternalQuery,
  action as rawAction,
  internalAction as rawInternalAction,
} from "./_generated/server";
import {
  customCtx,
  customMutation,
  customQuery,
  customAction,
} from "convex-helpers/server/customFunctions";
import {
  SessionIdArg,
  runSessionFunctions,
} from "convex-helpers/server/sessions";

// enable children files to register triggers receiving the triggers instance

// Register Triggers.
const triggers = new Triggers<DataModel>();

// Create custom functions that include triggers and other middleware
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB),
);

// For queries and actions, we use the raw functions directly since they don't need triggers
export const query = rawQuery;
export const internalQuery = rawInternalQuery;
export const action = rawAction;
export const internalAction = rawInternalAction;

// Session-aware custom functions
export const sessionQuery = customQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_convexSessionId_status", (q) =>
        q.eq("convexSessionId", sessionId).eq("status", "active"),
      )
      .unique();
    return { ctx: { ...ctx, session, convexSessionId: sessionId }, args: {} };
  },
});

export const sessionMutation = customMutation(mutation, {
  args: SessionIdArg,
  input: async (ctx, { sessionId }) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_convexSessionId_status", (q) =>
        q.eq("convexSessionId", sessionId).eq("status", "active"),
      )
      .unique();

    return { ctx: { ...ctx, session, convexSessionId: sessionId }, args: {} };
  },
});

export const sessionAction = customAction(action, {
  args: SessionIdArg,
  input: (ctx, { sessionId }) => ({
    ctx: {
      ...ctx,
      sessionId,
      ...runSessionFunctions(ctx, sessionId),
    },
    args: {},
  }),
});
