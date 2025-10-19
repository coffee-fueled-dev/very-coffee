import type { PostModule } from "@/topics/lib";

export default {
  __type: "post",
  author: "Zach Garrett",
  title:
    "Fingerprinting Corpora Using tkn Stream Determinism and Graph Entropy Deltas",
  tags: ["machine learning", "tokenization", "compression"],
  summary: "Describing a concept for fingerprinting copora using tkn.",
  module: () => import("./post.md"),
} satisfies PostModule;
