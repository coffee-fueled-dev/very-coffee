import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/topics/$topic")({
  component: () => <Outlet />,
});
