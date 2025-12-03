import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Extending TAM with experiential learning",
  tags: ["learning", "agents"],
  summary:
    "An extension of the Trajectory-Affordance Model that adds learning dynamics for port refinement.",
  posts: {},
} satisfies RegisteredPost;
