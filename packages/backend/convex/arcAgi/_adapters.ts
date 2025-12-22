import { WithoutSystemFields } from "convex/server";
import { Doc } from "../_generated/dataModel";
import { z } from "zod/v4";
import { ArcGameAction } from "./_types";

export const arcAGI3Actions = [
  {
    key: "RESET",
    description: "Initialize or restarts the game/level state",
    predicate: {
      when: "The game is in some state",
      then: "The game will be reset to the initial state",
    },
  },
  {
    key: "ACTION1",
    description: "Simple action - varies by game (semantically mapped to up)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION2",
    description: "Simple action - varies by game (semantically mapped to down)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION3",
    description: "Simple action - varies by game (semantically mapped to left)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION4",
    description:
      "Simple action - varies by game (semantically mapped to right)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION5",
    description:
      "Simple action - varies by game (e.g., interact, select, rotate, attach/detach, execute, etc.)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION6",
    description: "Complex action requiring x,y coordinates (0-63 range)",
    schema: z.toJSONSchema(
      z.object({
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
      })
    ),
    predicate: {
      when: "The game is in some state",
      then: "The game will be in a new state",
    },
  },
  {
    key: "ACTION7",
    description: "Simple action - Undo (e.g., interact, select)",
    predicate: {
      when: "The game is in some state",
      then: "The game will be at the previous state",
    },
  },
] as const satisfies {
  key: ArcGameAction;
  description: string;
  schema?: Record<string, any>;
  predicate: { when: string; then: string };
}[];
