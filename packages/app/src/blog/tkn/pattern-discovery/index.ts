import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Pattern Discovery",
  tags: ["machine learning", "tokenization", "compression"],
  summary: "How the tkn algorithm discovers patterns from a sample.",
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
