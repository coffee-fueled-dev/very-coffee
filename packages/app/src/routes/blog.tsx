import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: () => (
    <div className="space-y-6 p-6 w-full max-w-4xl mx-auto">
      <Outlet />
    </div>
  ),
});
