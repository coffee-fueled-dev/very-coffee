import { blog } from "@/blog";
import { FullscreenSpinner } from "@/components/blocks/fullscreen-spinner";
import {
  getChildPostPreviews,
  Post,
  PostPreviews,
  resolvePost,
} from "@/components/blocks/post";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

export const Route = createFileRoute("/blog/")({
  component: () => {
    const { pathname } = useLocation();
    const BlogRoot = getBlogRoot(pathname);

    return (
      <Suspense fallback={<FullscreenSpinner />}>
        <BlogRoot />
      </Suspense>
    );
  },
});

const getBlogRoot = (pathname: string) =>
  lazy(async () => {
    const resolvedPost = await resolvePost(blog);
    const childPostPreviews = getChildPostPreviews(pathname, resolvedPost);

    const LazyPostPage = () => (
      <div className="w-full space-y-6">
        <Post {...resolvedPost} />
        <PostPreviews postPreviews={childPostPreviews} sectionTitle="Topics" />
      </div>
    );
    return { default: LazyPostPage };
  });
