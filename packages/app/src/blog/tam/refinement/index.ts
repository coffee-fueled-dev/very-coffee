import type { RegisteredPost } from "@/lib/post";
import portSelection from "./port-selection";
import affordancePrediction from "./affordance-prediction";
import refinementPolicy from "./refinement-policy";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "TA Refinement",
  tags: ["formal methods", "lattice theory"],
  summary:
    "An architecture for training behavioral agents via affordance refinement",
  posts: {
    portSelection,
    affordancePrediction,
    refinementPolicy,
  },
} satisfies RegisteredPost;
