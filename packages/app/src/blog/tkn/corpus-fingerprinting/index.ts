import type { PostModule } from "@/topics/lib";

export default {
  __type: "post",
  author: "Zach Garrett",
  title: "Learning From User Behavioral Data From Web Apps",
  tags: ["machine learning", "tokenization", "compression"],
  summary:
    "Describing a concept for building training data from session-scoped user interactions with a web app.",
  module: () => import("./post.md"),
} satisfies PostModule;
