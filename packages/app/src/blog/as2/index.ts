import type { RegisteredPost } from "@/lib/post";
import tam from "./tam";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "AS2",
  tags: ["ai", "agents", "machine learning"],
  summary: "",
  posts: { tam },
} satisfies RegisteredPost;
