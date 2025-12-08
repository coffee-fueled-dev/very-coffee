import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Grounding",
  tags: ["formal methods", "lattice theory"],
  summary: "Fixed points of refinement operators via Knaster-Tarski",
  posts: {},
} satisfies RegisteredPost;

