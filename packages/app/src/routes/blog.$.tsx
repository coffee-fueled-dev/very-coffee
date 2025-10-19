import { createFileRoute, useLocation } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { postFromPathSegment } from "@/blog/lib";
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
    const { pathname } = useLocation();

    const segments = _splat?.split("/");

    if (!segments || segments.length > MAX_POST_DEPTH) return undefined;
    const LazyPostPage = getPostFromPathSegment(pathname, segments);

    return (
      <Suspense fallback={<FullscreenSpinner />}>
        <LazyPostPage />
      </Suspense>
    );
  },
});

const getPostFromPathSegment = (pathname: string, pathSegment: string[]) =>
  lazy(async () => {
    const post = postFromPathSegment(pathSegment);
    const resolvedPost = await resolvePost(post);
    const childPostPreviews = getChildPostPreviews(pathname, resolvedPost);

    const LazyPostPage = () => (
      <div className="w-full space-y-6">
        <Post {...resolvedPost} />
        <PostPreviews postPreviews={childPostPreviews} sectionTitle="Posts" />
      </div>
    );
    return { default: LazyPostPage };
  });
