import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Trajectory-Affordance Model Learning",
  tags: ["agents", "ai", "state spaces"],
  summary:
    "An extension of the Trajectory-Affordance Model that adds learning dynamics for port refinement.",
  posts: {},
} satisfies RegisteredPost;
