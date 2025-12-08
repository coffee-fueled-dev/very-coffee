import type { RegisteredPost } from "@/lib/post";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Affordance Lattices",
  tags: ["formal methods", "lattice theory"],
  summary: "Affordance cones as elements of a complete Heyting algebra",
  posts: {},
} satisfies RegisteredPost;

