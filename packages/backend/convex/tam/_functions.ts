import { generateObject } from "ai";
import { z } from "zod/v4";
import { Doc, Id } from "../_generated/dataModel";
import { languageModels } from "./_util";
import taContext from "./prompts/ta.txt";

export async function evaluateThen(observedTrajectory: string[], then: string) {
  return generateObject({
    model: languageModels.chat,
    messages: [
      {
        role: "system",
        content: taContext,
      },
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
      verdict: z.union([
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
                    "Reason why this event did not fit the expectation"
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
  port: string
) {
  const { object: trajectory } = await generateObject({
    model: languageModels.chat,
    messages: [
      {
        role: "system",
        content: taContext,
      },
      {
        role: "user",
        content: `From the previous situation, an port was chosen which resulted in an episode from the world.
          Given that episode, infer the causal chain of events in the world, ending with the current state.
          Each state in the causal chain should be a concise description of the world at that point in time.`,
      },
      {
        role: "assistant",
        content: JSON.stringify({ situation, episode, port }, null, 2),
      },
    ],
    output: "array",
    schema: z.string(),
  });

  return {
    trajectory,
    situation: {
      state: {
        value: trajectory[trajectory.length - 1],
      },
    },
  };
}

export async function choosePort(
  situation: string,
  ports: {
    _id: Id<"ports">;
    action: Pick<Doc<"actions">, "description" | "key" | "schema">;
    predicate: { when: string; then: string };
  }[],
  intent: string
) {
  return generateObject({
    model: languageModels.chat,
    messages: [
      {
        role: "system",
        content: taContext,
      },
      {
        role: "user",
        content: `Choose a port to bind which best achieves the intent and adheres to the following rules:
          1. The current situation must be accounted for by the port predicate's "when" clause
          2. The port must be expected to advance progress toward the intent
          3. After binding, the world's response must fall within the port predicate's "then" clause expectations
          4. Among valid options, prefer ports with narrower "then" clauses (more specific commitments)
          5. Choose arguments which adhere to the provided action schema`,
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
      justification: z.string().describe("The reason for choosing this action"),
      arguments: z
        .record(z.string(), z.any())
        .describe(
          "Your choice of arguments which adhere to the schema for the chosen action"
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
    when: string;
    then: string;
  }
) {
  const { object: refinement } = await generateObject({
    model: languageModels.chat,
    messages: [
      {
        role: "system",
        content: taContext,
      },
      {
        role: "user",
        content: `Based on the verdict of the binding, refine the port's "when" and "then" clauses according to the following rules:
        1. You must always refine your expectations in the case of a binding failure
        2. If the binding was successful, you may optionally refine your expectations to be more specific
        3. Refinement must always result in a port that would have succeeded in the observed episode`,
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
    schema: z.union([
      z
        .object({
          when: z.string().describe("The 'when' clause of the new port"),
          then: z.string().describe("The 'then' clause for the new port"),
          method: z.literal("proliferate"),
        })
        .describe(
          "Create a new, more specific port for this type of situation instead of refining the existing one."
        ),
      z
        .object({
          when: z
            .string()
            .optional()
            .describe("The refined 'when' clause of the port"),
          then: z
            .string()
            .optional()
            .describe("The refined 'then' clause of the port"),
          method: z.enum(["widen", "narrow"]),
        })
        .describe("Refine the existing port's 'when' and/or 'then' clauses."),
    ]),
  });

  if (refinement.method === "proliferate") {
    return {
      when: { value: refinement.when },
      then: { value: refinement.then },
      method: refinement.method,
    };
  } else if (!refinement.when && refinement.then) {
    return {
      then: { value: refinement.then },
      method: refinement.method,
    };
  } else if (!refinement.then && refinement.when) {
    return {
      when: { value: refinement.when },
      method: refinement.method,
    };
  } else if (!refinement.then && !refinement.when) {
    return null;
  } else {
    return {
      when: { value: refinement.when! }, // TODO: Double check logic. This type assertion makes me think there's a bug
      then: { value: refinement.then! }, // TODO: Double check logic. This type assertion makes me think there's a bug
      method: refinement.method,
    };
  }
}
