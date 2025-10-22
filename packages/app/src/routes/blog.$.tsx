import {
  PostHeader,
  PostPreviews,
  PostPageContent,
} from "@/components/blocks/post";
import { createFileRoute } from "@tanstack/react-router";
import { PostProvider } from "@/contexts/post-context";
import { PostBreadcrumb } from "@/components/blocks/post";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/blog/$")({
  component: () => {
    const { _splat } = Route.useParams();

    return (
      <PostProvider splat={_splat}>
        <section className="space-y-6">
          <PostHeader />
          <PostBreadcrumb />
          <Separator />
          <PostPreviews sectionTitle="Posts" />
          <PostPageContent />
        </section>
      </PostProvider>
    );
  },
});
