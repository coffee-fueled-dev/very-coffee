import {
  PostHeader,
  PostPreviews,
  PostPageContent,
} from "@/components/blocks/post";
import { createFileRoute } from "@tanstack/react-router";
import { PostProvider } from "@/contexts/post-context";
import { PostBreadcrumb } from "@/components/blocks/post-breadcrumb";

export const Route = createFileRoute("/blog/")({
  component: () => (
    <PostProvider splat={undefined}>
      <section className="space-y-6">
        <PostBreadcrumb />
        <PostHeader />
        <PostPageContent />
        <PostPreviews sectionTitle="Topics" />
      </section>
    </PostProvider>
  ),
});
