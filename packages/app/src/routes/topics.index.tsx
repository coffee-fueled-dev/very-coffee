import { TopicList, type Topic } from "@/components/blocks/topic";
import { createFileRoute } from "@tanstack/react-router";
import topicOverviewData from "@/topics/index.md";
import MarkdownPreview from "@uiw/react-markdown-preview";
import type { TopicPreview } from "@/lib/topics";

export const Route = createFileRoute("/topics/")({
  loader: async () => {
    const response = await fetch("/api/topics");
    const topicPreviews: TopicPreview[] = await response.json();
    return topicPreviews;
  },
  component: TopicsPage,
});

function TopicsPage() {
  const topicPreviews = Route.useLoaderData();

  const topics: Topic[] = topicPreviews.map((preview) => ({
    preview,
    link: {
      to: "/topics/$topic",
      params: { topic: preview.slug },
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
          source={topicOverviewData.content}
        />
      </div>
      <TopicList topics={topics} />
    </div>
  );
}
