import { createFileRoute } from "@tanstack/react-router";

import { content, meta } from "../../public/posts/tkn/project-proposal.md";
import { Post } from "@/components/blocks/post";

export const Route = createFileRoute("/topics/tkn/project-proposal")({
  component: () => (
    <Post
      content={content}
      author={meta.author ?? ""}
      lastModified={meta.lastModified}
      title={meta.title ?? meta.lastModified}
    />
  ),
});
