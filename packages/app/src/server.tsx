import entry from "../public/index.html";
import mdxPlugin from "./plugins/mdx";
import type { BunFile } from "bun";
import path from "path";
import { LRUCache } from "lru-cache";

// Note: Page-specific OG tags for link previews require either:
// 1. Server-side rendering (SSR)
// 2. An edge function/worker that intercepts bot requests
// 3. Static pre-rendering at build time
//
// Bun's route-based architecture serves bundled HTML directly, which doesn't
// allow middleware-style interception before route matching. The default OG
// tags in index.html provide a baseline preview for all pages.

// Cache for compiled MDX bundles
// Key: filePath, Value: { code, mtime }
const mdxCache = new LRUCache<string, { code: string; mtime: number }>({
  max: 100, // Max 100 posts cached
  ttl: 1000 * 60 * 60, // 1 hour TTL
});

// React shim - exports from window.React (ensures single React instance)
const reactShim = `
// React shim - uses window.React from main app
const React = window.React;
export default React;
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useContext = React.useContext;
export const useReducer = React.useReducer;
export const useCallback = React.useCallback;
export const useMemo = React.useMemo;
export const useRef = React.useRef;
export const useImperativeHandle = React.useImperativeHandle;
export const useLayoutEffect = React.useLayoutEffect;
export const useDebugValue = React.useDebugValue;
export const useDeferredValue = React.useDeferredValue;
export const useTransition = React.useTransition;
export const useId = React.useId;
export const useSyncExternalStore = React.useSyncExternalStore;
export const useInsertionEffect = React.useInsertionEffect;
export const Fragment = React.Fragment;
export const StrictMode = React.StrictMode;
export const Suspense = React.Suspense;
export const Component = React.Component;
export const PureComponent = React.PureComponent;
export const createElement = React.createElement;
export const cloneElement = React.cloneElement;
export const createContext = React.createContext;
export const isValidElement = React.isValidElement;
export const Children = React.Children;
export const memo = React.memo;
export const forwardRef = React.forwardRef;
export const lazy = React.lazy;
export const startTransition = React.startTransition;
export const version = React.version;
`;

// JSX runtime shim
const jsxRuntimeShim = `
// JSX runtime shim - uses window.React from main app
const React = window.React;
export const Fragment = React.Fragment;

// jsx-runtime keeps children in props - don't extract them
export function jsx(type, props, key) {
  if (key !== undefined) {
    return React.createElement(type, { ...props, key });
  }
  return React.createElement(type, props);
}

export function jsxs(type, props, key) {
  if (key !== undefined) {
    return React.createElement(type, { ...props, key });
  }
  return React.createElement(type, props);
}

export const jsxDEV = jsx;
`;

// React DOM shim
const reactDomShim = `
// React DOM shim - uses window.ReactDOM from main app
const ReactDOM = window.ReactDOM;
export default ReactDOM;
export const createRoot = ReactDOM.createRoot;
export const hydrateRoot = ReactDOM.hydrateRoot;
export const createPortal = ReactDOM.createPortal;
export const flushSync = ReactDOM.flushSync;
`;

const server = Bun.serve({
  port: process.env.PORT || 3000,

  development:
    process.env.NODE_ENV !== "production"
      ? {
          hmr: true,
          console: true,
        }
      : false,

  routes: {
    // React shims for import maps
    "/api/shims/react.js": () =>
      new Response(reactShim, {
        headers: { "Content-Type": "application/javascript" },
      }),
    "/api/shims/jsx-runtime.js": () =>
      new Response(jsxRuntimeShim, {
        headers: { "Content-Type": "application/javascript" },
      }),
    "/api/shims/react-dom.js": () =>
      new Response(reactDomShim, {
        headers: { "Content-Type": "application/javascript" },
      }),

    "/api/posts/*": async (req) => {
      const url = new URL(req.url);
      const pathSegments = url.pathname
        .replace("/api/posts/", "")
        .split("/")
        .filter(Boolean);

      const isRaw = url.searchParams.get("raw") === "true";

      console.log(
        `[POST API] Request for: ${pathSegments.join("/")}${
          isRaw ? " (raw)" : ""
        }`
      );

      // Map URL segments to file system paths (handle typo: "architecture" -> "architecure")
      const fsSegments = pathSegments.map((seg) =>
        seg === "architecture" ? "architecure" : seg
      );

      // Use import.meta.dir to get the directory where this file is located
      const baseDir = import.meta.dir; // This is packages/app/src
      const blogBase = path.join(baseDir, "blog");

      const possiblePaths = [
        path.join(blogBase, ...fsSegments, "post.mdx"),
        path.join(blogBase, ...fsSegments, "post.md"),
      ];

      console.log(
        `[POST API] Searching for file in ${possiblePaths.length} possible locations:`
      );
      possiblePaths.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));

      let file: BunFile | null = null;
      let filePath: string | null = null;

      for (const filePath_ of possiblePaths) {
        try {
          const candidate = Bun.file(filePath_);
          const exists = await candidate.exists();
          if (exists) {
            file = candidate;
            filePath = filePath_;
            console.log(`[POST API] ✓ Found file: ${filePath_}`);
            break;
          }
        } catch (e) {
          console.log(`[POST API] ✗ Error checking ${filePath_}:`, e);
          // Continue to next path
        }
      }

      if (!file || !filePath) {
        console.log(
          `[POST API] ✗ File not found for: ${pathSegments.join("/")}`
        );
        return new Response("Post not found", { status: 404 });
      }

      // Return raw source if requested
      if (isRaw) {
        const content = await file.text();
        const ext = filePath.endsWith(".mdx") ? "mdx" : "md";
        return new Response(content, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `inline; filename="${pathSegments.join(
              "-"
            )}.${ext}"`,
            "Cache-Control":
              process.env.NODE_ENV === "production"
                ? "public, max-age=3600"
                : "no-cache",
          },
        });
      }

      // Check file modification time for cache validation
      const stat = await file.stat();
      const mtime = stat.mtime.getTime();

      // Check cache
      const cached = mdxCache.get(filePath);
      if (cached && cached.mtime === mtime) {
        console.log(`[POST API] ✓ Cache hit for: ${filePath}`);
        return new Response(cached.code, {
          headers: {
            "Content-Type": "application/javascript",
            "Cache-Control":
              process.env.NODE_ENV === "production"
                ? "public, max-age=3600"
                : "no-cache",
            "X-Cache": "HIT",
          },
        });
      }

      console.log(
        `[POST API] ${
          cached ? "Cache stale" : "Cache miss"
        }, compiling: ${filePath}`
      );

      try {
        // Bundle MDX with React marked as external
        const result = await Bun.build({
          entrypoints: [filePath],
          target: "browser",
          format: "esm",
          minify: false,
          plugins: [mdxPlugin],
          external: [
            "react",
            "react/jsx-runtime",
            "react/jsx-dev-runtime",
            "react-dom",
            "react-dom/client",
          ],
        });

        if (!result.success) {
          console.error("[POST API] ✗ Bundle failed!");
          console.error("Bundle errors:", result.logs);
          throw new Error("Bundle failed");
        }

        const bundledCode = await result.outputs[0].text();
        console.log(
          `[POST API] ✓ Compiled ${bundledCode.length} chars, caching...`
        );

        // Store in cache
        mdxCache.set(filePath, { code: bundledCode, mtime });

        return new Response(bundledCode, {
          headers: {
            "Content-Type": "application/javascript",
            "Cache-Control":
              process.env.NODE_ENV === "production"
                ? "public, max-age=3600"
                : "no-cache",
            "X-Cache": "MISS",
          },
        });
      } catch (error) {
        console.error(`[POST API] ✗ Error during bundling:`, error);
        return new Response("Internal server error", { status: 500 });
      }
    },

    // Catch-all for SPA routes
    "/*": entry,
  },
});

console.log(`Server is running on ${server.url}`);
