import entry from "../public/index.html";

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
    "/*": entry,
  },
});

console.log(`Server is running on ${server.url}`);
