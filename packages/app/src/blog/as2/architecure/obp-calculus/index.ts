import type { RegisteredPost } from "@/lib/post";
import neuralPorts from "./neural-ports";
import subjectiveUsage from "./subjective-usage";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "OBP Calculus",
  tags: [],
  summary:
    "The Offer-Bind-Port Calculus (OBP) is a formal model of workflows in which parties interact by binding to ports on offers.",
  module: () => import("./post.md"),
  posts: {
    "neural-ports": neuralPorts,
    "subjective-usage": subjectiveUsage,
  },
} satisfies RegisteredPost;
