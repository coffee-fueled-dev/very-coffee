import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Subjective Usage of OBP",
  tags: [],
  summary:
    "This document describes Subjective OBP as a particular way of using the OBP calculus from the first-person perspective of an acto: either as a view of the global execution category or as a stand-alone OBP graph built from external observations, using OBP to maintain a belief-consistent internal plan and to learn from expectation violations.",
  module: () => import("./post.md"),
} satisfies RegisteredPost;
