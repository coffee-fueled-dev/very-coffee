import type { RegisteredPost } from "@/lib/post";
import properties from "./properties";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Trajectory-Affordance",
  tags: ["formal methods", "state spaces"],
  summary: "A formal model of causal chains between an actor and world",
  posts: { properties },
} satisfies RegisteredPost;
