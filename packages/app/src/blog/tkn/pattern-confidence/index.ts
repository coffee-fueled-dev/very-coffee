import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Pattern Confidence",
  tags: ["compression", "machine learning", "tokenization"],
  summary:
    "How the tkn algorithm can be used to learn high confidence patterns from a sample.",
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
