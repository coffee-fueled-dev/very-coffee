import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: false,
  author: "Zach Garrett",
  title: "Continuous Navigation",
  tags: ["agency", "differential geometry"],
  summary: "TAM with continuous port manifolds",
  module: () => import("./spec.md"),
} satisfies RegisteredPost;
