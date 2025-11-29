import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Neural Realization of OBP Ports",
  tags: [],
  summary:
    "This document describes a principled approach for grounding OBP Ports in neural models while preserving the formal semantics of the OBP calculus.",
  module: () => import("./post.md"),
} satisfies RegisteredPost;
