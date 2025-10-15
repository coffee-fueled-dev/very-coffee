import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { Post } from "@/components/blocks/post";
import type { Post as PostData } from "@/lib/post";

export const Route = createFileRoute("/topics/$topic/$post")({
  loader: async ({ params }): Promise<PostData> => {
    const response = await fetch(`/api/topics/${params.topic}/${params.post}`);

    if (!response.ok) {
      throw notFound({ routeId: rootRouteId });
    }

    return await response.json();
  },
  component: PostPage,
});

function PostPage() {
  const post = Route.useLoaderData();

  return <Post post={post} />;
}
