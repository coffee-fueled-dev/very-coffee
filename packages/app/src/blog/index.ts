import type { RegisteredPost } from "../lib/post";
import tkn from "./tkn";

export const blog = {
  __type: "post",
  published: true,
  title: "Topics",
  author: "Zach Garrett",
  summary: "Zach's dev blog",
  posts: { tkn },
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
