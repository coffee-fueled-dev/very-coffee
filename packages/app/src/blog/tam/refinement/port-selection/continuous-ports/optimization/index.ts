import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Optimization",
  tags: ["formal methods", "differential geometry", "learning"],
  summary: "Gradient-based port selection over manifolds",
  posts: {},
} satisfies RegisteredPost;
