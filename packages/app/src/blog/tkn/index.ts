import type { PostModule } from "@/lib/post";
import patternDiscovery from "./pattern-discovery";

export default {
  __type: "post",
  author: "Zach Garrett",
  title: "tkn",
  tags: ["compression", "machine learning", "tokenization"],
  summary:
    "An online algorithm that incrementally discovers and compresses recurring symbol patterns in a data stream, building its own token vocabulary without any prior linguistic or statistical model.",
  module: () => import("./post.mdx"),
  posts: {
    // "user-data": userData,
    // "corpus-fingerprinting": corpusFingerprinting,
    "pattern-discovery": patternDiscovery,
  },
} satisfies PostModule;
