import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "TA-Bellman Equations",
  tags: ["formal methods", "state spaces", "learning", "agents"],
  summary: "Bellman equations reinterpreted in terms of Trajectory-Affordance.",
  posts: {},
} satisfies RegisteredPost;
