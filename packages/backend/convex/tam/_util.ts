import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";

export const languageModels = {
  chat: openai.chat("gpt-4.1-nano"),
  textEmbedding: openai.textEmbedding("text-embedding-3-small"),
};

export const vEmbeddedValue = v.object({
  value: v.string(),
  embedding: v.optional(v.array(v.float64())),
});
