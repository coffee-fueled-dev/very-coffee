import {
  createFileRoute,
  notFound,
  rootRouteId,
  type LinkComponentProps,
} from "@tanstack/react-router";
import { Topic } from "@/components/blocks/topic";
import type { Topic as TopicData } from "@/lib/topics";

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
  const topic = Route.useLoaderData();

  const postLinks: Record<string, Omit<LinkComponentProps, "children">> = {};
  topic.posts.forEach((post) => {
    const slug = post.fileData.name.replace(".post.md", "");
    postLinks[post.fileData.name] = {
      to: "/topics/$topic/$post",
      params: { topic: topic.slug, post: slug },
    };
  });

  return <Topic topic={topic} postLinks={postLinks} />;
}
