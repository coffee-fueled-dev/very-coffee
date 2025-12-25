import { v } from "convex/values";
import { internalMutation, internalQuery } from "../customFunctions";
import { getSessionContext } from "./_functions";

export const getPorts = internalQuery({
  args: {
    world: v.id("worlds"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { world, limit }) => {
    const portStream = ctx.db
      .query("ports")
      .withIndex("by_world", (q) => q.eq("world", world));

    if (limit) {
      return portStream.take(limit);
    }

    return portStream.collect();
  },
});

export const produceContext = internalMutation({
  args: {
    session: v.id("sessions"),
    context: v.object({
      content: v.string(),
      external: v.object({
        source: v.string(),
        id: v.string(),
      }),
    }),
  },
  handler: async (ctx, { session, context }) => {
    const sessionCtx = await getSessionContext(ctx, { session });

    if (!sessionCtx) throw new Error(`Missing session ${session}`);
    if (!sessionCtx.world) throw new Error(`Missing world ${sessionCtx.world}`);
    if (!sessionCtx.binding)
      throw new Error(`No binding is in progress for session ${session}`);

    await ctx.db.insert("contexts", {
      session,
      world: sessionCtx.world._id,
      binding: sessionCtx.binding._id,
      content: context.content,
      external: context.external,
    });
  },
});
