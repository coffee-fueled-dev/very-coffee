import { extractFrontmatter, formatSize } from "@/lib/markdown";
import { PostFrontmatterSchema, type PostMeta } from "@/lib/post";
import path from "node:path";

export default {
  name: "post",
  setup(build) {
    build.onLoad({ filter: /\.post\.md$/ }, async (args) => {
      const file = Bun.file(args.path);
      const raw = await file.text();

      const { frontmatter, body } = extractFrontmatter(
        raw,
        PostFrontmatterSchema
      );

      const meta: PostMeta = {
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
