import type { RegisteredPost } from "@/lib/post";
import patternDiscovery from "./pattern-discovery";
import corpusFingerprinting from "./corpus-fingerprinting";
import userData from "./user-data";
import patternConfidence from "./pattern-confidence";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "tkn",
  tags: ["compression", "machine learning", "tokenization"],
  summary:
    "An online algorithm that incrementally discovers and compresses recurring symbol patterns in a data stream, building its own token vocabulary without any prior linguistic or statistical model.",
  module: () => import("./post.mdx"),
  posts: {
    "user-data": userData,
    "corpus-fingerprinting": corpusFingerprinting,
    "pattern-discovery": patternDiscovery,
    "pattern-confidence": patternConfidence,
  },
} satisfies RegisteredPost;
