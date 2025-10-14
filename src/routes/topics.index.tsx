import { TopicList, type Topic } from "@/components/blocks/topic";
import { createFileRoute } from "@tanstack/react-router";

import { content as topicOverview } from "@/topics/index.md";
import MarkdownPreview from "@uiw/react-markdown-preview";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MarkdownPreview
          style={{
            backgroundColor: "transparent",
            color: "inherit",
          }}
          source={topicOverview}
        />
      </div>
      <TopicList topics={topics} />
    </div>
  );
}
