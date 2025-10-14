import { createFileRoute } from "@tanstack/react-router";

import { content, meta } from "@/topics/tkn/project-proposal.post.md";
import { Post } from "@/components/blocks/post";

export const Route = createFileRoute("/topics/tkn/project-proposal")({
  component: () => <Post content={content} meta={meta} />,
});
