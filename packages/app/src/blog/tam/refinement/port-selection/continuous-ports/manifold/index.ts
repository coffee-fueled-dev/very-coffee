import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Port Manifold",
  tags: ["formal methods", "differential geometry"],
  summary: "Geometric structure on continuous port spaces",
  posts: {},
} satisfies RegisteredPost;
