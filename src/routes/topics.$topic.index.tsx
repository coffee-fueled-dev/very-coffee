import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { Topic } from "@/components/blocks/topic";
import type { Post } from "@/components/blocks/post";
import type { PostMeta } from "@/lib/post";
import type { TopicMeta } from "@/lib/topics";

interface PostData {
  slug: string;
  topic: string;
  meta: PostMeta;
}

interface TopicData {
  meta: TopicMeta;
  content: string;
  posts: PostData[];
}

export const Route = createFileRoute("/topics/$topic/")({
  loader: async ({ params }): Promise<TopicData> => {
    const response = await fetch(`/api/topics/${params.topic}`);

    if (!response.ok) {
      throw notFound({ routeId: rootRouteId });
    }

    return await response.json();
  },
  component: TopicPostsPage,
});

function TopicPostsPage() {
  const data = Route.useLoaderData();

  const postItems: Post[] = data.posts.map((post) => ({
    link: {
      to: "/topics/$topic/$post",
      params: { topic: post.topic, post: post.slug },
    },
    meta: post.meta,
  }));

  return <Topic meta={data.meta} content={data.content} posts={postItems} />;
}
