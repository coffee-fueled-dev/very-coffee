import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Failure Analysis",
  tags: ["formal methods"],
  summary: "Interpreting binding failures to inform refinement choice",
  posts: {},
} satisfies RegisteredPost;

