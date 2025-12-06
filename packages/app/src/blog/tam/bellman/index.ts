import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "TAM-Bellman Equations",
  tags: ["formal methods", "state spaces", "learning", "agents"],
  summary:
    "Bellman equations reinterpreted in the Trajectory-Affordance Model.",
  posts: {},
} satisfies RegisteredPost;
