import entry from "../public/index.html";

Bun.serve({
  port: 3000,

  development:
    process.env.NODE_ENV !== "production"
      ? {
          hmr: true,
          console: true,
        }
      : false,

  routes: {
    "/*": entry,
  },
});
