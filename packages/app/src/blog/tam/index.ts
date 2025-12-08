import type { RegisteredPost } from "@/lib/post";
import guides from "./guides";
import model from "./model";
import refinement from "./refinement";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Trajectory-Affordance",
  tags: ["agents", "agency", "formal methods"],
  summary: "A formal model of causal chains between an actor and world",
  posts: { guides, model, refinement },
} satisfies RegisteredPost;
