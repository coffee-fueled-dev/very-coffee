import entry from "../public/index.html";
import { getTopic, getTopicPreviews } from "./lib/topics";
import { getPost } from "./lib/post";
import { join } from "node:path";

const server = Bun.serve({
  port: process.env.PORT || 3000,

  development:
    process.env.NODE_ENV !== "production"
      ? {
          hmr: true,
          console: true,
        }
      : false,

  routes: {
    "/api/topics": {
      async GET() {
        const topics = await getTopicPreviews();
        return Response.json(topics);
      },
    },
    "/api/topics/:topic": {
      async GET(req) {
        const { topic } = req.params;

        const topicData = await getTopic(topic);
        if (!topicData) {
          return new Response("Topic not found", { status: 404 });
        }

        return Response.json(topicData);
      },
    },
    "/api/topics/:topic/:slug": {
      async GET(req) {
        const { topic, slug } = req.params;
        const postPath = join(
          process.cwd(),
          "public/topics",
          topic,
          `${slug}.post.md`
        );
        const post = await getPost(postPath);
        if (!post) {
          return new Response("Post not found", { status: 404 });
        }
        return Response.json(post);
      },
    },
    "/*": entry,
  },
});

console.log(`Server is running on ${server.url}`);
