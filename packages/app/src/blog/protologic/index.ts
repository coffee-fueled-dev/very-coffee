import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  title: "Protologic",
  author: "Zach Garrett",
  summary: "Auto-progressive agent entitlement",
  tags: ["agents", "ai", "security", "graphs"],
  posts: {},
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
