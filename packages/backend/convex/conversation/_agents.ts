import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { SessionId } from "convex-helpers/server/sessions";
import { Doc, Id } from "../_generated/dataModel";

export const languageModels = {
  chat: openai.chat("gpt-4.1-nano"),
  textEmbedding: openai.textEmbedding("text-embedding-3-small"),
};

interface AgentArgs {
  sessionId: SessionId;
  conversationId: Id<"conversations">;
  messageId?: string;
  session: Doc<"sessions">;
}

export default {
  Agent: ({ sessionId, conversationId, session }: AgentArgs) =>
    new Agent(components.agent, {
      name: "Agent",
      languageModel: languageModels.chat,
      textEmbeddingModel: languageModels.textEmbedding,
      maxSteps: 5,
      tools: {},
      instructions: "",
    }),
};
