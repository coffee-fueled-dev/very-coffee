import type { RegisteredPost } from "@/lib/post";
import learn from "./learn";
import properties from "./properties";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Trajectory-Affordance Model",
  tags: ["agents", "ai", "state spaces"],
  summary: "A formal model of causal chains between an actor and world",
  posts: { learn, properties },
} satisfies RegisteredPost;
