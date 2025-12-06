import entry from "../public/index.html";
import mdxPlugin from "./plugins/mdx";
import path from "path";
import { LRUCache } from "lru-cache";

// Build a registry mapping post key paths to actual file paths
// by parsing import statements in index.ts files
async function buildPostRegistry(
  dir: string,
  keyPath: string[] = []
): Promise<Map<string, string>> {
  const registry = new Map<string, string>();
  const indexPath = path.join(dir, "index.ts");
  const indexFile = Bun.file(indexPath);

  if (!(await indexFile.exists())) return registry;

  const content = await indexFile.text();

  // Parse import statements: import <key> from "./<folder>"
  const importRegex = /import\s+(\w+)\s+from\s+["']\.\/([^"']+)["']/g;
  const imports = new Map<string, string>();

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const [, key, folder] = match;
    imports.set(key, folder);
  }

  // Check for post.mdx/post.md in current directory
  for (const ext of ["mdx", "md"]) {
    const postPath = path.join(dir, `post.${ext}`);
    if (await Bun.file(postPath).exists()) {
      const pathKey = keyPath.join("/");
      registry.set(pathKey, postPath);
      break;
    }
  }

  // Recursively process subdirectories
  for (const [key, folder] of imports) {
    const subDir = path.join(dir, folder);
    const subRegistry = await buildPostRegistry(subDir, [...keyPath, key]);
    for (const [k, v] of subRegistry) {
      registry.set(k, v);
    }
  }

  return registry;
}

// Post path registry - maps key paths (e.g. "post1") to file paths
let postRegistry: Map<string, string> | null = null;

async function getPostRegistry(): Promise<Map<string, string>> {
  // In development, rebuild registry each request to pick up changes
  if (postRegistry && process.env.NODE_ENV === "production")
    return postRegistry;
  const blogBase = path.join(import.meta.dir, "blog");
  postRegistry = await buildPostRegistry(blogBase);
  if (!postRegistry.size || process.env.NODE_ENV !== "production") {
    console.log("[POST REGISTRY] Built registry:", [...postRegistry.entries()]);
  }
  return postRegistry;
}

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
      const pathKey = pathSegments.join("/");

      // Look up actual file path from registry
      const registry = await getPostRegistry();
      const filePath = registry.get(pathKey);

      if (!filePath) {
        console.log(`[POST API] ✗ No registry entry for: ${pathKey}`);
        return new Response("Post not found", { status: 404 });
      }

      const file = Bun.file(filePath);
      if (!(await file.exists())) {
        console.log(`[POST API] ✗ File not found: ${filePath}`);
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
