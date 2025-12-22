import { StrictMode } from "react";
import ReactDOMClient from "react-dom/client";
import * as ReactDOM from "react-dom";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import * as React from "react";

import { routeTree } from "./routeTree.gen";

// Expose React globally for dynamically loaded MDX modules
if (typeof window !== "undefined") {
  (window as any).React = React;
  // Expose full ReactDOM with createPortal for Radix UI Portal
  (window as any).ReactDOM = ReactDOM;
  // Also expose client version for createRoot
  (window as any).ReactDOMClient = ReactDOMClient;
}

const router = createRouter({
  routeTree,
  notFoundMode: "root",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOMClient.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
}
