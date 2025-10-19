import type { PostModule } from "@/topics/lib";
import corpusFingerprinting from "./corpus-fingerprinting";
import userData from "./user-data";

export default {
  __type: "post",
  author: "Zach Garrett",
  title: "tkn",
  tags: ["compression", "machine learning", "tokenization"],
  summary:
    "An online algorithm that incrementally discovers and compresses recurring symbol patterns in a data stream, building its own token vocabulary without any prior linguistic or statistical model.",
  module: () => import("./post.md"),
  posts: {
    "user-data": userData,
    "corpus-fingerprinting": corpusFingerprinting,
  },
} satisfies PostModule;
