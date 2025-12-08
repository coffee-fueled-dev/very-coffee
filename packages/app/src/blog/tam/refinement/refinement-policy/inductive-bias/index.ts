import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Inductive Bias",
  tags: ["learning"],
  summary: "What the refinement policy encodes about generalization",
  posts: {},
} satisfies RegisteredPost;

