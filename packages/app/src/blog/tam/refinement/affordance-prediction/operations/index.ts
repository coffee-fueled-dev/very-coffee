import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Refinement Operations",
  tags: ["formal methods", "lattice theory"],
  summary: "Widen, narrow, and proliferate as lattice operations",
  posts: {},
} satisfies RegisteredPost;

