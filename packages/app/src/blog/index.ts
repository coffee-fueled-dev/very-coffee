import type { RegisteredPost } from "@/lib/post";
import tkn from "./tkn";
import protologic from "./protologic";
import as2 from "./as2";

export const blog = {
  __type: "post",
  published: true,
  title: "Topics",
  author: "Zach Garrett",
  summary: "Zach's dev blog",
  posts: { tkn, protologic, as2 },
  module: () => import("./post.mdx"),
} satisfies RegisteredPost;
