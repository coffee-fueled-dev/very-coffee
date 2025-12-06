import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Extending TA with experiential learning",
  tags: ["learning", "agents"],
  summary:
    "An extension of Trajectory-Affordance that adds learning dynamics for port refinement.",
  posts: {},
} satisfies RegisteredPost;
