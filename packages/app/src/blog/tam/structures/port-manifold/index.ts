import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Port Manifold",
  tags: ["formal methods", "differential geometry"],
  summary: "Port space as a smooth manifold with Riemannian structure",
  posts: {},
} satisfies RegisteredPost;
