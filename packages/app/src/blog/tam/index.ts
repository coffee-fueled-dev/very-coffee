import type { RegisteredPost } from "@/lib/post";
import learn from "./learn";
import properties from "./properties";
import guide from "./guide";
import model from "./model";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Trajectory-Affordance Model",
  tags: ["agents", "agency", "formal methods"],
  summary: "A formal model of causal chains between an actor and world",
  posts: { learn, properties, guide, model },
} satisfies RegisteredPost;
