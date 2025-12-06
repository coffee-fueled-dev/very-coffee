import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Implementing TA with LLMs",
  tags: ["llm", "agents", "learning"],
  summary:
    "A practical guide for building agents with experiential learning using TA.",
  posts: {},
} satisfies RegisteredPost;
