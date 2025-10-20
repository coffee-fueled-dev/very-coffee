import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Pattern Discovery Demo",
  tags: ["machine learning", "tokenization", "compression"],
  summary: "Demo of pattern discovery using the tkn algorithm.",
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
