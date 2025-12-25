import { v } from "convex/values";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../customFunctions";
import { internal } from "../_generated/api";
import { embed } from "ai";
import { languageModels, vEmbeddedValue } from "./_util";
import { doc } from "convex-helpers/validators";
import schema from "../schema";
import { Doc } from "../_generated/dataModel";

export const getById = internalQuery({
  args: {
    id: v.id("ports"),
  },
  handler: async (ctx, { id }) =>
    await ctx.db
      .get(id)
      .then((port) => (port ? port : Promise.reject(`Missing port ${id}`))),
});

export const savePredicate = internalMutation({
  args: {
    port: v.id("ports"),
    predicate: v.object({
      behavior: vEmbeddedValue,
      when: vEmbeddedValue,
      then: vEmbeddedValue,
    }),
  },
  handler: async (ctx, { port, predicate }) =>
    await ctx.db.patch(port, { predicate }),
});

export const embedPredicate = internalAction({
  args: {
    port: v.id("ports"),
    behavior: v.optional(v.string()),
    when: v.optional(v.string()),
    then: v.optional(v.string()),
  },
  handler: async (ctx, { port, behavior, when, then }) => {
    const portDoc = await ctx.runQuery(internal.tam.port.getById, { id: port });

    const currentPredicate = portDoc.predicate;
    const [whenEmbedding, thenEmbedding, behaviorEmbedding] = await Promise.all(
      [when, then, behavior].filter(Boolean).map((value) =>
        value
          ? embed({
              model: languageModels.textEmbedding,
              value,
            }).then(({ embedding }) => ({
              value,
              embedding,
            }))
          : Promise.resolve(null)
      )
    );

    await ctx.runMutation(internal.tam.port.savePredicate, {
      port,
      predicate: {
        behavior: behaviorEmbedding ?? currentPredicate.behavior,
        when: whenEmbedding ?? currentPredicate.when,
        then: thenEmbedding ?? currentPredicate.then,
      },
    });
  },
});

export const search = internalAction({
  args: {
    actor: v.id("actors"),
    situation: v.string(),
    predicate: v.optional(v.string()),
  },
  returns: v.array(doc(schema, "ports")),
  handler: async (
    ctx,
    { actor, situation, predicate }
  ): Promise<Doc<"ports">[]> => {
    const [whenMatches, thenMatches] = await Promise.all([
      embed({
        model: languageModels.textEmbedding,
        value: situation,
      })
        .then(({ embedding }) =>
          ctx.vectorSearch("ports", "by_embeddedWhen", {
            vector: embedding,
            limit: 10,
            filter: (q) => q.eq("actor", actor),
          })
        )
        .then((candidates) =>
          Promise.all(
            candidates.map((port) =>
              ctx.runQuery(internal.tam.port.getById, { id: port._id })
            )
          )
        ),
      predicate
        ? embed({
            model: languageModels.textEmbedding,
            value: predicate,
          })
            .then(({ embedding }) =>
              ctx.vectorSearch("ports", "by_embeddedThen", {
                vector: embedding,
                limit: 10,
                filter: (q) => q.eq("actor", actor),
              })
            )
            .then((candidates) =>
              Promise.all(
                candidates.map((port) =>
                  ctx.runQuery(internal.tam.port.getById, { id: port._id })
                )
              )
            )
        : [],
    ]);

    const allPorts = [...whenMatches, ...thenMatches].filter(
      (port): port is NonNullable<typeof port> => port !== null
    );
    const deduplicatedPorts = [
      ...new Map(allPorts.map((port) => [port._id, port])).values(),
    ];

    return deduplicatedPorts;
  },
});
