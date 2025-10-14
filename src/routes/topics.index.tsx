import { TopicList, type Topic } from "@/components/blocks/topic";
import { createFileRoute } from "@tanstack/react-router";

interface TopicInfo {
  slug: string;
  name: string;
  description: string;
  postCount: number;
}

export const Route = createFileRoute("/topics/")({
  loader: async () => {
    const response = await fetch("/api/topics");
    const topicInfos: TopicInfo[] = await response.json();
    return topicInfos;
  },
  component: TopicsPage,
});

function TopicsPage() {
  const topicInfos = Route.useLoaderData();

  const topics: Topic[] = topicInfos.map((info) => ({
    title: info.name,
    posts: info.postCount,
    description: info.description,
    link: {
      to: "/topics/$topic",
      params: { topic: info.slug },
    },
  }));

  return <TopicList topics={topics} />;
}
