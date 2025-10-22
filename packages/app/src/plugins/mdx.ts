import { compile } from "@mdx-js/mdx";
import rehypeStarryNight from "rehype-starry-night";
import rehypeMermaid from "rehype-mermaid";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default {
  name: "mdx",
  setup(build) {
    build.onLoad({ filter: /\.mdx$/, namespace: "file" }, async (args) => {
      const file = Bun.file(args.path);
      const raw = await file.text();
      const stat = await file.stat();

      // Extract file metadata
      const metadata = {
        size: formatSize(stat.size),
        lastModified: new Date(stat.mtime).toLocaleDateString(),
        path: file.name,
      };

      const compiled = await compile(raw, {
        jsxImportSource: "react",
        rehypePlugins: [rehypeKatex, rehypeMermaid, rehypeStarryNight],
        remarkPlugins: [remarkMath],
      });

      const withMetadata = `
${compiled.value}

export const metadata = ${JSON.stringify(metadata)};
`;

      return {
        contents: withMetadata,
        loader: "jsx",
      };
    });
  },
} satisfies Bun.BunPlugin;
