import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: false,
  author: "Zach Garrett",
  title: "Pattern Confidence Demo",
  tags: ["compression", "machine learning", "tokenization"],
  summary:
    "A demonstration of how the tkn algorithm can be used to learn high confidence patterns from a sample.",
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
