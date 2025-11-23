import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: false,
  author: "Zach Garrett",
  title: "Semantic Schema for Constraint Solver",
  tags: ["state spaces", "ai", "graphs"],
  summary: "Semantic schema for constraint solver.",
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
