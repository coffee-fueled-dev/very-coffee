import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: false,
  author: "Zach Garrett",
  title:
    "Fingerprinting Corpora Using tkn Stream Determinism and Graph Entropy Deltas",
  tags: ["machine learning", "tokenization", "compression"],
  summary: "Describing a concept for fingerprinting copora using tkn.",
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
