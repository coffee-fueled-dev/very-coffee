import type { RegisteredPost } from "@/lib/post";
import valueFunctions from "./value-functions";
import continuousPorts from "./continuous-ports";

export default {
  __type: "post",
  published: true,
  author: "Zach Garrett",
  title: "Port Selection",
  tags: ["formal methods", "learning"],
  summary: "Choosing which port to bind in a given situation",
  posts: {
    valueFunctions,
    continuousPorts,
  },
} satisfies RegisteredPost;
