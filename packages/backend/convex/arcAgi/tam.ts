import { internalMutation } from "../customFunctions";
import { v } from "convex/values";

export const getActor = internalMutation({
  args: {
    player: v.union(
      v.object({ id: v.id("actors") }),
      v.object({ name: v.string() })
    ),
  },
  handler: async (ctx, { player }) => {
    return "id" in player
      ? player.id
      : await ctx.db.insert("actors", { name: player.name });
  },
});
