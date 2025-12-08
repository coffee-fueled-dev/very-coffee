import type { RegisteredPost } from "@/lib/post";
import continuousNav from "./continuous-nav";

export default {
  __type: "post",
  published: false,
  author: "Zach Garrett",
  title: "Demos",
  tags: ["agency"],
  summary: "Interactive TAM demonstrations",
  posts: {
    continuousNav,
  },
} satisfies RegisteredPost;
