import type { RegisteredPost } from "@/lib/post";
import planningEngine from "./planning-engine";
import obpCalculus from "./obp-calculus";
import onlineLearning from "./online-learning";
import integration from "./integration";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Architecture",
  tags: [],
  summary:
    "The Architecture of the AS2 project is a collection of formal models and algorithms for building and reasoning about causal programs.",
  module: () => import("./post.md"),
  posts: {
    "planning-engine": planningEngine,
    "obp-calculus": obpCalculus,
    "online-learning": onlineLearning,
    integration,
  },
} satisfies RegisteredPost;
