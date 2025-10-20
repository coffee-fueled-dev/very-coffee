import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: false,
  title: "Protologic",
  author: "Zach Garrett",
  summary: "Auto-progressive and regressive agent entitlement",
  posts: {},
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
