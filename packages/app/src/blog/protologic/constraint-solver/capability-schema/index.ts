import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: false,
  author: "Zach Garrett",
  title: "Capability Schema",
  tags: ["agents", "ai", "security", "graphs"],
  summary: "Capability schema for constraint solver.",
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
