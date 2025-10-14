import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { Post } from "@/components/blocks/post";
import type { PostMeta } from "@/lib/post";

interface PostData {
  content: string;
  meta: PostMeta;
}

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
  const postData = Route.useLoaderData();

  return <Post content={postData.content} meta={postData.meta} />;
}
