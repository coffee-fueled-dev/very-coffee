import type { RegisteredPost } from "@/lib/post";
import inductiveBias from "./inductive-bias";
import failureAnalysis from "./failure-analysis";
import metaLearning from "./meta-learning";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Refinement Policy",
  tags: ["formal methods", "learning"],
  summary: "Learning how to update affordance predictions",
  posts: {
    inductiveBias,
    failureAnalysis,
    metaLearning,
  },
} satisfies RegisteredPost;
