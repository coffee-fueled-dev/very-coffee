import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Online Learning",
  tags: [],
  summary:
    "The Online Learner is a structural pattern extractor over causal traces.",
  module: () => import("./post.md"),
} satisfies RegisteredPost;
