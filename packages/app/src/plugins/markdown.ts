import { extractFrontmatter, formatSize, type FileMeta } from "@/lib/markdown";
import path from "node:path";
import z from "zod";

const GenericFrontmatterSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string()), z.unknown()])
);

export default {
  name: "markdown",
  setup(build) {
    build.onLoad({ filter: /\.md$/, namespace: "file" }, async (args) => {
      const file = Bun.file(args.path);
      const raw = await file.text();

      let frontmatter: Record<string, unknown> = {};
      let body = raw;

      try {
        const result = extractFrontmatter(raw, GenericFrontmatterSchema);
        frontmatter = result.frontmatter;
        body = result.body;
      } catch {
        body = raw;
      }

      const meta = {
        ...frontmatter,
        name: path.basename(file.name ?? ""),
        size: formatSize(file.size),
        lastModified: new Date(file.lastModified).toLocaleString(),
        path: file.name,
      };

      return {
        contents: `
          export const content = ${JSON.stringify(body)};
          export const meta = ${JSON.stringify(meta)};
          export default { content, meta };
        `,
        loader: "js",
      };
    });
  },
} satisfies Bun.BunPlugin;
