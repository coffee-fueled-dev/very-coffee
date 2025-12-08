import type { RegisteredPost } from "@/lib/post";
import llmAgents from "./llm-agents";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Practical Guides",
  tags: ["agents", "learning"],
  summary: "Concrete implementations of TA concepts",
  posts: {
    llmAgents,
  },
} satisfies RegisteredPost;
