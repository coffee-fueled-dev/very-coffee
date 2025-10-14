import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "@/components/blocks/post";

import { meta } from "@/topics/tkn/project-proposal.post.md";

export const Route = createFileRoute("/topics/tkn/")({
  component: () => (
    <PostList
      posts={[
        {
          route: "/topics/tkn/project-proposal",
          meta,
        },
      ]}
    />
  ),
});
