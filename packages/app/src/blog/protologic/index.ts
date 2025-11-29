import type { RegisteredPost } from "@/lib/post";
import constraintSolver from "./constraint-solver";

export default {
  __type: "post",
  published: true,
  title: "Protologic",
  author: "Zach Garrett",
  summary: "Auto-progressive agent entitlement",
  tags: ["agents", "ai", "security", "graphs"],
  posts: { constraintSolver },
} satisfies RegisteredPost;
