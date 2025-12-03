import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Implementing TAM with LLMs",
  tags: ["agents", "ai", "state spaces"],
  summary: "A practical guide for building agents with situational learning.",
  posts: {},
} satisfies RegisteredPost;
