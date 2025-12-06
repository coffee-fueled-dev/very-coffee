import type { RegisteredPost } from "@/lib/post";
import learn from "./learn";
import guide from "./guide";
import model from "./model";
import structures from "./structures";
import composition from "./composition";
import bellman from "./bellman";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Trajectory-Affordance Model",
  tags: ["agents", "agency", "formal methods"],
  summary: "A formal model of causal chains between an actor and world",
  posts: { learn, guide, model, structures, composition, bellman },
} satisfies RegisteredPost;
