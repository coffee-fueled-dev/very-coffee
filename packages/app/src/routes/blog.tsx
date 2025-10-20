import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BlogProvider } from "@/contexts/blog-context";
import { blog } from "@/blog";

export const Route = createFileRoute("/blog")({
  component: () => (
    <BlogProvider rootPost={blog} baseRoute="/blog">
      <div className="space-y-6 p-6 w-full max-w-4xl mx-auto">
        <Outlet />
      </div>
    </BlogProvider>
  ),
});
