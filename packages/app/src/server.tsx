import entry from "../public/index.html";
import { getTopics, getTopicPosts, getPost, getTopic } from "./lib/topics";

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
        const topics = await getTopics();
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

        const posts = await getTopicPosts(topic);

        return Response.json({
          ...topicData,
          posts,
        });
      },
    },
    "/api/topics/:topic/:slug": {
      async GET(req) {
        const { topic, slug } = req.params;
        const post = await getPost(topic, slug);
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
