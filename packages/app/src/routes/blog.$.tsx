import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import {
  getChildPostPreviews,
  Post,
  PostPreviews,
  resolvePost,
} from "@/components/blocks/post";
import { FullscreenSpinner } from "@/components/blocks/fullscreen-spinner";
import { PostProvider, useStaticPost } from "@/contexts/post-context";
import type { RegisteredPost } from "@/lib/post";

export const Route = createFileRoute("/blog/$")({
  component: () => {
    const { _splat } = Route.useParams();

    return (
      <PostProvider splat={_splat}>
        <PostPageContent />
      </PostProvider>
    );
  },
});

function PostPageContent() {
  const { post, segments, isValid } = useStaticPost();

  if (!isValid || !post) throw notFound({ routeId: rootRouteId });

  const LazyPostPage = getPostFromPathSegments(post, segments);

  return (
    <Suspense fallback={<FullscreenSpinner />}>
      <LazyPostPage />
    </Suspense>
  );
}

const getPostFromPathSegments = (post: RegisteredPost, segments: string[]) =>
  lazy(async () => {
    const resolvedPost = await resolvePost(post);
    const childPostPreviews = getChildPostPreviews(segments, resolvedPost);

    const LazyPostPage = () => (
      <>
        <Post {...resolvedPost} />
        <PostPreviews postPreviews={childPostPreviews} sectionTitle="Posts" />
      </>
    );
    return { default: LazyPostPage };
  });
