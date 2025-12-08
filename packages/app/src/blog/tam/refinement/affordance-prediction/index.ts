import type { RegisteredPost } from "@/lib/post";
import lattices from "./lattices";
import predicates from "./predicates";
import operations from "./operations";
import grounding from "./grounding";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Affordance Prediction",
  tags: ["formal methods", "lattice theory"],
  summary: "Learning which trajectories to expect from each port",
  posts: {
    lattices,
    predicates,
    operations,
    grounding,
  },
} satisfies RegisteredPost;
