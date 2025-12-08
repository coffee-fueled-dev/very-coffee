import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Exploration",
  tags: ["learning", "differential geometry"],
  summary: "Navigating continuous port spaces to test expectations",
  posts: {},
} satisfies RegisteredPost;
