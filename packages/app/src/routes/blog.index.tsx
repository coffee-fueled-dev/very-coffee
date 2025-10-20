import { blog } from "@/blog";
import { FullscreenSpinner } from "@/components/blocks/fullscreen-spinner";
import {
  Post,
  PostHeader,
  PostPreviews,
  resolvePost,
} from "@/components/blocks/post";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { PostProvider } from "@/contexts/post-context";
import { PostBreadcrumb } from "@/components/blocks/post-breadcrumb";

export const Route = createFileRoute("/blog/")({
  component: () => {
    const BlogRoot = getBlogRoot();

    return (
      <PostProvider splat={undefined}>
        <section className="space-y-6">
          <PostBreadcrumb />
          <PostHeader />
          <Suspense fallback={<FullscreenSpinner />}>
            <BlogRoot />
          </Suspense>
          <PostPreviews sectionTitle="Topics" />
        </section>
      </PostProvider>
    );
  },
});

const getBlogRoot = () =>
  lazy(async () => {
    const resolvedPost = await resolvePost(blog);

    const LazyPostPage = () => <Post {...resolvedPost} />;
    return { default: LazyPostPage };
  });
