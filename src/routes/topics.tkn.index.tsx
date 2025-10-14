import { createFileRoute } from "@tanstack/react-router";
import { PostList } from "@/components/blocks/post";

import { meta } from "../../public/posts/tkn/project-proposal.md";

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
