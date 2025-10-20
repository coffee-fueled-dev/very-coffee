import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import {
  Post,
  PostHeader,
  PostPreviews,
  resolvePost,
} from "@/components/blocks/post";
import { FullscreenSpinner } from "@/components/blocks/fullscreen-spinner";
import { PostProvider, useStaticPost } from "@/contexts/post-context";
import type { RegisteredPost } from "@/lib/post";
import { PostBreadcrumb } from "@/components/blocks/post-breadcrumb";

export const Route = createFileRoute("/blog/$")({
  component: () => {
    const { _splat } = Route.useParams();

    return (
      <PostProvider splat={_splat}>
        <section className="space-y-6">
          <PostBreadcrumb />
          <PostHeader />
          <PostPageContent />
          <PostPreviews sectionTitle="Posts" />
        </section>
      </PostProvider>
    );
  },
});

function PostPageContent() {
  const { post, isValid } = useStaticPost();

  if (!isValid || !post) throw notFound({ routeId: rootRouteId });

  const LazyPostPage = getPostFromPathSegments(post);

  return (
    <Suspense fallback={<FullscreenSpinner />}>
      <LazyPostPage />
    </Suspense>
  );
}

const getPostFromPathSegments = (post: RegisteredPost) =>
  lazy(async () => {
    const resolvedPost = await resolvePost(post);

    const LazyPostPage = () => <Post {...resolvedPost} />;
    return { default: LazyPostPage };
  });
