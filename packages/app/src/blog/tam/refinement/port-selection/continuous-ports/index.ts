import type { RegisteredPost } from "@/lib/post";
import manifold from "./manifold";
import coherence from "./coherence";
import optimization from "./optimization";
import exploration from "./exploration";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Continuous Ports",
  tags: ["formal methods", "differential geometry"],
  summary: "Geometric structure for continuous port spaces",
  posts: {
    manifold,
    coherence,
    optimization,
    exploration,
  },
} satisfies RegisteredPost;
