import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: () => (
    <div className="w-full space-y-6 p-6">
      <Outlet />
    </div>
  ),
});
