import { blog } from "@/blog";
import { FullscreenSpinner } from "@/components/blocks/fullscreen-spinner";
import {
  getChildPostPreviews,
  Post,
  PostPreviews,
  resolvePost,
} from "@/components/blocks/post";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

export const Route = createFileRoute("/blog/")({
  component: () => {
    const BlogRoot = getBlogRoot();

    return (
      <Suspense fallback={<FullscreenSpinner />}>
        <BlogRoot />
      </Suspense>
    );
  },
});

const getBlogRoot = () =>
  lazy(async () => {
    const resolvedPost = await resolvePost(blog);
    const childPostPreviews = getChildPostPreviews([], resolvedPost);

    const LazyPostPage = () => (
      <>
        <Post {...resolvedPost} segments={[]} />
        <PostPreviews postPreviews={childPostPreviews} sectionTitle="Topics" />
      </>
    );
    return { default: LazyPostPage };
  });
