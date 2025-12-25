import { generateObject } from "ai";
import { z } from "zod/v4";
import { Doc, Id } from "../_generated/dataModel";
import { languageModels } from "./_util";
import taContext from "./prompts/ta.txt";
import { MutationCtx, QueryCtx } from "../_generated/server";

export async function initializeSession(
  ctx: MutationCtx,
  {
    actor,
    world,
    initialSituation,
    session,
  }: {
    actor: Id<"actors">;
    world: Id<"worlds">;
    initialSituation: { state: { value: string } };
    session: { source: string; id: string };
  }
): Promise<{ sessionId: Id<"sessions">; situationId: Id<"situations"> }> {
  const sessionId = await ctx.db.insert("sessions", {
    actor,
    world,
    external: session,
    status: "active",
  });

  const situationId = await ctx.db.insert("situations", {
    actor,
    previous: null,
    state: initialSituation.state,
    session: sessionId,
  });

  return { sessionId, situationId };
}

export async function evaluateThen(observedTrajectory: string[], then: string) {
  return generateObject({
    model: languageModels.trajectoryEvaluation,
    messages: [
      {
        role: "user",
        content: `Did any state of the observed trajectory violate the expected outcome?`,
      },
      {
        role: "assistant",
        content: JSON.stringify({ observedTrajectory, then }, null, 2),
      },
    ],
    schema: z.object({
      verdict: z.discriminatedUnion("outcome", [
        z.object({ outcome: z.literal("success") }),
        z.object({
          outcome: z.literal("failure"),
          exceptions: z
            .array(
              z.object({
                index: z
                  .number()
                  .min(0)
                  .max(observedTrajectory.length - 1)
                  .describe("Index of the event in the sequence"),
                reason: z
                  .string()
                  .describe(
                    "How, specifically, did the outcome deviate from the expectation? Onse sentence or less"
                  ),
              })
            )
            .describe("A list of exceptions to the expectation"),
        }),
      ]),
    }),
  }).then((result) => result.object);
}

export async function inferTrajectory(
  episode: Array<Doc<"contexts">>,
  situation: string,
  port: { when: string; then: string; behavior: string }
) {
  const { object: trajectory } = await generateObject({
    model: languageModels.trajectoryInference,
    messages: [
      {
        role: "user",
        content: `Describe what happened after the last action in one sentence or less.`,
      },
      {
        role: "assistant",
        content: JSON.stringify(
          { previousSituation: situation, chnages: episode, actionTaken: port },
          null,
          2
        ),
      },
    ],
    output: "array",
    schema: z.string(),
  });

  return trajectory;
}

export async function choosePort(
  situation: string,
  ports: {
    _id: Id<"ports">;
    predicate: { behavior: string; when: string; then: string };
    schema?: Record<string, any>;
  }[],
  intent: string
) {
  return generateObject({
    model: languageModels.portChoice,
    messages: [
      {
        role: "user",
        content: `Choose a port to bind which best achieves the intent and adheres to the following rules:
          1. The current situation must be accounted for by the port predicate's "when" clause
          2. The port must be expected to advance progress toward the intent
          3. After binding, the world's response must fall within the port predicate's "then" clause expectations
          4. Among valid options, prefer ports with narrower "then" clauses (more specific commitments)
          5. Only provide arguments if the action has a schema field; if schema is undefined, omit arguments`,
      },
      {
        role: "assistant",
        content: JSON.stringify(
          {
            situation,
            intent,
            ports,
          },
          null,
          2
        ),
      },
    ],
    schema: z.object({
      portId: z.string().describe("The ID of the chosen action"),
      justification: z
        .string()
        .describe(
          "The reason for choosing this action in one sentence or less"
        ),
      arguments: z
        .record(z.string(), z.any())
        .optional()
        .describe(
          "Only provide if the chosen action has a schema; must match that schema exactly"
        ),
    }),
  }).then(({ object }) => object);
}

export async function refinePort(
  bindingVerdict:
    | { outcome: "success" }
    | {
        outcome: "failure";
        exceptions: Array<{
          context: Doc<"contexts">;
        }>;
      },
  currentPort: {
    behavior: string;
    when: string;
    then: string;
  }
) {
  const { object: result } = await generateObject({
    model: languageModels.portRefinement,
    messages: [
      {
        role: "user",
        content: `Refine the port based on what you learned from the last action taken.
        Use when to describe the context in which the port is expected to be used and why.
        Use then to describe the expected outcome of binding the port.
        Use behavior to describe what the port changes in the world.
        Use one sentence or less for each clause.`,
      },
      {
        role: "assistant",
        content: JSON.stringify(
          {
            bindingVerdict,
            currentPort,
          },
          null,
          2
        ),
      },
    ],
    schema: z.object({
      refinement: z.discriminatedUnion("method", [
        z.object({
          method: z
            .literal("proliferate")
            .describe(
              "Create a new, more specific port for this type of situation"
            ),
          behavior: z.string().describe("The behavior of the new port"),
          when: z.string().describe("The 'when' clause of the new port"),
          then: z.string().describe("The 'then' clause for the new port"),
        }),
        z.object({
          method: z.literal("widen").describe("Broaden the existing port"),
          behavior: z.string().optional().describe("Refined 'behavior' clause"),
          when: z.string().optional().describe("Refined 'when' clause"),
          then: z.string().optional().describe("Refined 'then' clause"),
        }),
        z.object({
          method: z
            .literal("narrow")
            .describe("Make the existing port more specific"),
          behavior: z.string().optional().describe("Refined 'behavior' clause"),
          when: z.string().optional().describe("Refined 'when' clause"),
          then: z.string().optional().describe("Refined 'then' clause"),
        }),
      ]),
    }),
  });

  const { refinement } = result;

  if (refinement.method === "proliferate") {
    return {
      behavior: { value: refinement.behavior },
      when: { value: refinement.when },
      then: { value: refinement.then },
      method: "proliferate" as const,
    };
  }

  const updates = {
    ...(refinement.behavior && { behavior: { value: refinement.behavior } }),
    ...(refinement.when && { when: { value: refinement.when } }),
    ...(refinement.then && { then: { value: refinement.then } }),
  };

  if (Object.keys(updates).length === 0) {
    return null;
  }

  return {
    ...updates,
    method: refinement.method,
  };
}

export async function getSessionContext(
  ctx: QueryCtx,
  { session }: { session: Id<"sessions"> }
) {
  return await Promise.all([
    ctx.db.get(session),
    ctx.db
      .query("situations")
      .withIndex("by_session", (q) => q.eq("session", session))
      .order("desc")
      .first(),
    ctx.db
      .query("bindings")
      .withIndex("by_session_status", (q) => q.eq("session", session))
      .order("desc")
      .first(),
  ])
    .then(([session, situation, binding]) => {
      if (!session) return Promise.reject(`Missing session ${session}`);
      if (!situation) return Promise.reject("No situations found");
      return Promise.all([
        ctx.db.get(session.world),
        session,
        situation,
        binding,
        binding
          ? ctx.db
              .query("contexts")
              .withIndex("by_binding", (q) => q.eq("binding", binding._id))
              .collect()
          : null,
        binding ? ctx.db.get(binding.port) : null,
        ctx.db
          .get(session.actor)
          .then((actor) =>
            actor ? actor : Promise.reject(`Missing actor ${session.actor}`)
          ),
      ]);
    })
    .then(([world, session, situation, binding, episode, port, actor]) => ({
      ...session,
      world,
      situation,
      binding,
      episode,
      port,
      actor,
    }))
    .catch(() => null);
}
