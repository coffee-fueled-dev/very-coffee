import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { postFromPathSegment } from "@/lib/post";
import {
  getChildPostPreviews,
  Post,
  PostPreviews,
  resolvePost,
} from "@/components/blocks/post";
import { FullscreenSpinner } from "@/components/blocks/fullscreen-spinner";

const MAX_POST_DEPTH = 3; // TODO: Get from module

export const Route = createFileRoute("/blog/$")({
  component: () => {
    const { _splat } = Route.useParams();

    const segments = _splat?.split("/");

    if (!segments || segments.length > MAX_POST_DEPTH) return undefined;
    const LazyPostPage = getPostFromPathSegments(segments);

    return (
      <Suspense fallback={<FullscreenSpinner />}>
        <LazyPostPage />
      </Suspense>
    );
  },
});

const getPostFromPathSegments = (segments: string[]) =>
  lazy(async () => {
    const post = postFromPathSegment(segments);
    const resolvedPost = await resolvePost(post);
    const childPostPreviews = getChildPostPreviews(segments, resolvedPost);

    const LazyPostPage = () => (
      <>
        <Post {...resolvedPost} segments={segments} />
        <PostPreviews postPreviews={childPostPreviews} sectionTitle="Posts" />
      </>
    );
    return { default: LazyPostPage };
  });
