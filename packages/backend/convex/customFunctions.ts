import { Triggers } from "convex-helpers/server/triggers";
import { DataModel } from "./_generated/dataModel";
import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
  query as rawQuery,
  internalQuery as rawInternalQuery,
  action as rawAction,
  internalAction as rawInternalAction,
  QueryCtx,
  MutationCtx,
} from "./_generated/server";
import {
  customCtx,
  customMutation,
  customQuery,
  customAction,
} from "convex-helpers/server/customFunctions";
import {
  SessionId,
  SessionIdArg,
  runSessionFunctions,
} from "convex-helpers/server/sessions";
import { internal } from "./_generated/api";

// enable children files to register triggers receiving the triggers instance

// Register Triggers.
const triggers = new Triggers<DataModel>();

triggers.register("ports", async (ctx, change) => {
  if (
    (change.newDoc?.predicate.then.value &&
      !change.newDoc?.predicate.then.embedding) ||
    (change.newDoc?.predicate.when.value &&
      !change.newDoc?.predicate.when.embedding)
  ) {
    await ctx.scheduler.runAfter(0, internal.tam.coreLoop.embedPredicate, {
      port: change.newDoc._id,
      when: change.newDoc?.predicate.when.value,
      then: change.newDoc?.predicate.then.value,
    });
  }
});

triggers.register("situations", async (ctx, change) => {
  if (change.newDoc?.state.value && !change.newDoc?.state.embedding) {
    await ctx.scheduler.runAfter(0, internal.tam.coreLoop.embedState, {
      situation: change.newDoc._id,
      state: change.newDoc?.state.value,
    });
  }
});

// Create custom functions that include triggers and other middleware
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB)
);

// For queries and actions, we use the raw functions directly since they don't need triggers
export const query = rawQuery;
export const internalQuery = rawInternalQuery;
export const action = rawAction;
export const internalAction = rawInternalAction;

async function getSession(
  ctx: QueryCtx | MutationCtx,
  convexSessionId: SessionId
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_external_status", (q) =>
      q
        .eq("external", { source: "convex", id: convexSessionId })
        .eq("status", "active")
    )
    .unique();

  return session;
}

// Session-aware custom functions
export const sessionQuery = customQuery(query, {
  args: SessionIdArg,
  input: async (ctx, { sessionId: convexSessionId }) => {
    const session = await getSession(ctx, convexSessionId);
    return { ctx: { ...ctx, session, convexSessionId }, args: {} };
  },
});

export const sessionMutation = customMutation(mutation, {
  args: SessionIdArg,
  input: async (ctx, { sessionId: convexSessionId }) => {
    const session = await getSession(ctx, convexSessionId);
    return { ctx: { ...ctx, session, convexSessionId }, args: {} };
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
