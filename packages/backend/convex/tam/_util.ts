import { openai } from "@ai-sdk/openai";
import { v } from "convex/values";

// Lazy initialization to avoid env var access during schema evaluation
let _languageModels: {
  portChoice: ReturnType<typeof openai.chat>;
  portRefinement: ReturnType<typeof openai.chat>;
  trajectoryInference: ReturnType<typeof openai.chat>;
  trajectoryEvaluation: ReturnType<typeof openai.chat>;
  textEmbedding: ReturnType<typeof openai.textEmbedding>;
} | null = null;

function getLanguageModels() {
  if (!_languageModels) {
    _languageModels = {
      portChoice: openai.chat("gpt-4.1"),
      trajectoryInference: openai.chat("gpt-4.1-nano"),
      portRefinement: openai.chat("gpt-4.1-mini"),
      trajectoryEvaluation: openai.chat("gpt-4.1-nano"),
      textEmbedding: openai.textEmbedding("text-embedding-3-large"),
    };
  }
  return _languageModels;
}

export const languageModels = {
  get portChoice() {
    return getLanguageModels().portChoice;
  },
  get trajectoryEvaluation() {
    return getLanguageModels().trajectoryEvaluation;
  },
  get trajectoryInference() {
    return getLanguageModels().trajectoryInference;
  },
  get portRefinement() {
    return getLanguageModels().portRefinement;
  },
  get textEmbedding() {
    return getLanguageModels().textEmbedding;
  },
};

export const vEmbeddedValue = v.object({
  value: v.string(),
  embedding: v.optional(v.array(v.float64())),
});
