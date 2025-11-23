import { z } from "zod";

const partyEnum = z.enum(["system", "user"]);
const operatorEnum = z.enum(["AND", "OR"]);

const condition = z.object({
  relation: z.enum(["requires", "prohibits"]),
  capability: z.string(),
});

const statement = z
  .object({
    operator: operatorEnum,
    conditions: z.array(condition),
  })
  .describe(
    "A statement grouping a set of conditions with an shared operator."
  );

const policy = z.array(z.object({ statement, next: operatorEnum }));

const effect = z.object({
  party: partyEnum.describe(
    "The participant who experiences the effect. 'system' means the backend or SDK state changes; 'user' means what the developer or app user observes."
  ),
  subject: z
    .string()
    .describe(
      "The domain entity whose state changes as a result of the operation (e.g., 'User', 'SDK', 'System')."
    ),
  object: z
    .string()
    .describe(
      "The property or aspect of the subject that changes (e.g., 'event_stream', 'timezone', 'authentication_state')."
    ),
  predicate: z.object({
    when: policy,
    then: z
      .string()
      .describe(
        "Description of the state change or effect on the object (e.g., 'is updated', 'becomes authenticated', 'is appended with a new event')."
      ),
  }),
});

export const semanticInteractionModel = z.object({
  name: z
    .string()
    .describe(
      "Canonical name of the SDK operation or developer action (e.g., 'Initialize', 'TrackEvent')."
    ),
  effects: z
    .array(effect)
    .describe(
      "List of outcomes produced by performing this operation, each defined as a conditional state transition in the domain model."
    ),
});

export type SemanticInteractionModel = z.infer<typeof semanticInteractionModel>;
