import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Coherence",
  tags: ["formal methods", "differential geometry"],
  summary: "How port geometry relates coherently to affordance predictions",
  posts: {},
} satisfies RegisteredPost;
