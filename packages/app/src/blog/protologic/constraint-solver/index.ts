import type { RegisteredPost } from "@/lib/post";
import semanticSchema from "./semantic-schema";

export default {
  __type: "post",
  published: false,
  author: "Zach Garrett",
  title: "Constraint Solver",
  tags: ["state spaces", "ai", "graphs"],
  summary: "A constraint solver for state spaces.",
  posts: {
    "semantic-schema": semanticSchema,
  },
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
