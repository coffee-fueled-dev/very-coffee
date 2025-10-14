import entry from "../public/index.html";
import { getTopics, getTopicPosts, getPost, getTopic } from "./lib/topics";

Bun.serve({
  port: 3000,

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

        // Get topic metadata and content
        const topicData = await getTopic(topic);
        if (!topicData) {
          return new Response("Topic not found", { status: 404 });
        }

        // Get posts for this topic
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
