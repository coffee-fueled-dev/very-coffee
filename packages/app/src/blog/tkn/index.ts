import type { RegisteredPost } from "@/lib/post";
import patternDiscovery from "./pattern-discovery";
import patternConfidence from "./pattern-confidence";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "tkn",
  tags: ["compression", "machine learning", "tokenization"],
  summary:
    "An online algorithm that incrementally discovers and compresses recurring patterns in a data stream.",
  posts: {
    patternDiscovery,
    patternConfidence,
  },
} satisfies RegisteredPost;
