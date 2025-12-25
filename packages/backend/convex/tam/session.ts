import { v } from "convex/values";
import { internalQuery, internalMutation } from "../customFunctions";
import { doc } from "convex-helpers/validators";
import schema from "../schema";
import { withoutSystemFields } from "convex-helpers";
import { omit } from "convex-helpers";
import { getSessionContext } from "./_functions";
import { Id } from "../_generated/dataModel";

export const getContext = internalQuery({
  args: {
    session: v.id("sessions"),
  },
  handler: async (ctx, { session }) =>
    await getSessionContext(ctx, { session }),
});

export const handleBindingData = internalMutation({
  args: {
    ...omit(withoutSystemFields(doc(schema, "bindings").fields), ["port"]),
    port: v.string(),
  },
  handler: async (ctx, { port: maybePortId, ...binding }) => {
    const portId = ctx.db.normalizeId("ports", maybePortId);
    if (!portId) throw new Error(`Missing port for id ${maybePortId}`);

    const port = await ctx.db.get(portId);
    if (!port) throw new Error(`Missing port for id ${portId}`);

    const [bindingId] = await Promise.all([
      ctx.db.insert("bindings", { ...binding, port: portId }),
      ctx.db.patch(portId, {
        history: {
          ...port.history,
          timesBound: port.history.timesBound + 1,
        },
      }),
    ]);

    return bindingId;
  },
});

export const handleRefinementData = internalMutation({
  args: {
    newSituation: v.object(
      withoutSystemFields(doc(schema, "situations").fields)
    ),
    verdict: v.union(
      v.object({ binding: v.id("bindings"), outcome: v.literal("success") }),
      v.object({
        binding: v.id("bindings"),
        outcome: v.literal("failure"),
        exceptions: v.array(v.object({ context: doc(schema, "contexts") })),
      })
    ),
    portRefinement: v.union(
      v.object({
        updatedPort: v.object({
          actor: v.id("actors"),
          predicate: doc(schema, "ports").fields.predicate.partial(),
          _id: v.id("ports"),
        }),
      }),
      v.object({
        newPort: v.object(withoutSystemFields(doc(schema, "ports").fields)),
      }),
      v.null()
    ),
  },
  handler: async (ctx, { newSituation, verdict, portRefinement }) => {
    const binding = await ctx.db.get(verdict.binding);
    if (!binding) throw new Error(`Missing binding ${verdict.binding}`);
    const port = await ctx.db.get(binding.port);
    if (!port) throw new Error(`Missing port ${binding.port}`);

    const promises: Promise<void | Id<"situations"> | Id<"portIterations">>[] =
      [];

    promises.push(ctx.db.insert("situations", newSituation));
    promises.push(
      ctx.db.patch(verdict.binding, {
        success: verdict.outcome === "success",
      })
    );

    if (verdict.outcome === "failure") {
      for (const exception of verdict.exceptions) {
        promises.push(ctx.db.replace(exception.context._id, exception.context));
      }
    }

    if (portRefinement && "updatedPort" in portRefinement) {
      promises.push(
        ctx.db
          .insert("portIterations", {
            port: port._id,
            timesBound: 0,
            timesSuccessful: null,
          })
          .then((portIteration) =>
            ctx.db.patch(portRefinement.updatedPort._id, {
              currentIteration: portIteration,
              history: {
                ...port.history,
                timesSuccessful:
                  verdict.outcome === "success"
                    ? (port.history.timesSuccessful ?? 0) + 1
                    : (port.history.timesSuccessful ?? 0),
              },
            })
          )
      );
    } else if (portRefinement) {
      promises.push(
        ctx.db.insert("ports", portRefinement.newPort).then((newPortId) =>
          ctx.db.insert("portIterations", {
            port: newPortId,
            timesBound: 0,
            timesSuccessful: null,
          })
        )
      );
    }

    await Promise.all(promises);
  },
});
