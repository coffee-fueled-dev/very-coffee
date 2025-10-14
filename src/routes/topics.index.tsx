import { TopicList, type Topic } from "@/components/blocks/topic";
import { createFileRoute, Outlet } from "@tanstack/react-router";

const topics: Topic[] = [
  {
    title: "TKN",
    posts: 1,
    description: "Tokenization",
    route: "/topics/tkn",
  },
];

export const Route = createFileRoute("/topics/")({
  component: () => <TopicList topics={topics} />,
});
