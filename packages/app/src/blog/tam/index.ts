import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Trajectory-Affordance Model",
  tags: ["agents", "ai", "state spaces"],
  summary:
    "A formal model for structuring causal chains, expectation, and exception from it between an actor  and an external world",
  posts: {},
} satisfies RegisteredPost;
