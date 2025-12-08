import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Meta-Learning",
  tags: ["learning"],
  summary: "Learning the refinement policy itself",
  posts: {},
} satisfies RegisteredPost;

