import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Integration",
  tags: [],
  summary:
    "How OBP, the Online Learner, and the Planning Engine are wired together: typed traces, functors, and the closed-loop cognitive cycle.",
  module: () => import("./post.md"),
} satisfies RegisteredPost;
