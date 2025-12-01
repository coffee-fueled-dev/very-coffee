import type { RegisteredPost } from "@/lib/post";
import neuralPorts from "./neural-ports";
import subjectiveUsage from "./subjective-usage";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Trajectory-Affordance Process Calculus",
  tags: [],
  summary:
    "The Trajectory-Affordance Process Calculus (TAPC) is a process calculus in which all interactions are realized as admissible trajectories in a global state space.",
  posts: {
    "neural-ports": neuralPorts,
    "subjective-usage": subjectiveUsage,
  },
} satisfies RegisteredPost;
