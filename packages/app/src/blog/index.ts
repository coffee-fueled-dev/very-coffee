import type { RegisteredPost } from "@/lib/post";
import tkn from "./tkn";
import protologic from "./protologic";
import tam from "./tam";

export const blog = {
  __type: "post",
  published: true,
  title: "Topics",
  author: "Zach Garrett",
  summary: "Zach's dev blog",
  posts: { tkn, protologic, tam },
} satisfies RegisteredPost;
