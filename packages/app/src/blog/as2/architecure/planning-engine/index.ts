import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Planning Engine",
  tags: [],
  summary:
    "The Planning Engine is a goal-driven synthesizer of admissible causal programs.",
} satisfies RegisteredPost;
