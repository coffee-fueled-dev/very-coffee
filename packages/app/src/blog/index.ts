import type { PostModule } from "../lib/post";
import tkn from "./tkn";

export const blog = {
  __type: "post",
  title: "Topics",
  author: "Zach Garrett",
  summary: "Zach's dev blog",
  posts: { tkn },
  module: () => import("./post.mdx"),
} satisfies PostModule;
