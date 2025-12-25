import { v } from "convex/values";
import { internalMutation, internalQuery } from "../customFunctions";
import { doc } from "convex-helpers/validators";
import schema from "../schema";

export const updateStatus = internalMutation({
  args: {
    id: v.id("bindings"),
    status: doc(schema, "bindings").fields.status,
  },
  handler: (ctx, { id, status }) => ctx.db.patch(id, { status }),
});

export const resolve = internalQuery({
  args: {
    id: v.id("bindings"),
  },
  handler: (ctx, { id }) =>
    ctx.db
      .get(id)
      .then(async (binding) => {
        if (!binding) return null;
        if (!binding.port) return null;
        const port = await ctx.db.get(binding.port);
        return { port, binding };
      })
      .then(async (res) => {
        if (!res || !res.port) return null;
        const actor = await ctx.db.get(res.port.actor);
        return {
          ...res.binding,
          port: res.port,
          actor,
        };
      }),
});
