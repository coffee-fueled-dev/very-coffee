import { z } from "zod/v4";
import { type ArcGameAction, arcGameActions } from "./_api";

export const ArcAGI3Action6Schema = z.object({
  x: z
    .number()
    .min(0)
    .max(63)
    .describe(
      "The x coordinate to locate the action's effect on the game board"
    ),
  y: z
    .number()
    .min(0)
    .max(63)
    .describe(
      "The x coordinate to locate the action's effect on the game board"
    ),
});

export const ArcAGI3ActionSchema = z.object({
  key: z.enum(arcGameActions),
  args: ArcAGI3Action6Schema.optional(),
});

export const arcAGI3Actions = [
  {
    key: "RESET",
    predicate: {
      behavior: "Initialize or restarts the game/level state",
      when: "The game is in some state",
      then: "The game will be reset to the initial state",
    },
  },
  {
    key: "ACTION1",
    predicate: {
      behavior: "Simple action - varies by game",
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION2",
    predicate: {
      behavior: "Simple action - varies by game",
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION3",
    predicate: {
      behavior: "Simple action - varies by game",
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION4",
    predicate: {
      behavior: "Simple action - varies by game",
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION5",
    predicate: {
      behavior: "Simple action - varies by game",
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION6",
    schema: z.toJSONSchema(ArcAGI3Action6Schema),
    predicate: {
      behavior: "Complex action requiring x,y coordinates (0-63 range)",
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION7",
    predicate: {
      behavior: "Simple action - Undo (e.g., interact, select)",
      when: "The game is in some state",
      then: "The game will be at the previous state",
    },
  },
] as const satisfies {
  key: ArcGameAction;
  schema?: Record<string, any>;
  predicate: { behavior: string; when: string; then: string };
}[];
