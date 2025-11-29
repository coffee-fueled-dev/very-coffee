import type { RegisteredPost } from "@/lib/post";
import architecture from "./architecure";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "AS2",
  tags: ["ai", "agents", "machine learning"],
  summary: "",
  module: () => import("./post.md"),
  posts: { architecture: architecture },
} satisfies RegisteredPost;
