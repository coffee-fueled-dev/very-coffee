import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: false,
  author: "Zach Garrett",
  title: "Learning From User Behavioral Data From Web Apps",
  tags: ["machine learning", "tokenization", "compression"],
  summary:
    "Describing a concept for building training data from session-scoped user interactions with a web app.",
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
