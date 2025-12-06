import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Multi-Agent Composition",
  tags: ["agents", "category theory", "lattice theory"],
  summary:
    "Category-theoretic composition of grounded TA agents via lattice meet",
  posts: {},
} satisfies RegisteredPost;
