import type { BunPlugin } from "bun";
import path from "node:path";
import { z } from "zod";

// ============================================================================
// Schema & Types
// ============================================================================

const PostFrontmatterSchema = z.object({
  title: z.string().min(1, "Post title is required"),
  summary: z.string().min(1, "Post summary is required"),
  author: z.string().min(1, "Post author is required"),
  tags: z.array(z.string()).optional(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export type PostMeta = PostFrontmatter & {
  name: string;
  size: string;
  lastModified: string;
  path?: string;
};

// ============================================================================
// Helpers
// ============================================================================

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseYaml(yaml: string): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  const lines = yaml.split("\n");

  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;

    const rawValue = rest.join(":").trim();

    // Parse arrays: "tags: [a, b, c]" or "tags: a, b, c"
    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      meta[key.trim()] = rawValue
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim());
    } else if (key.trim() === "tags") {
      meta[key.trim()] = rawValue.split(",").map((v) => v.trim());
    } else {
      meta[key.trim()] = rawValue;
    }
  }

  return meta;
}

function extractFrontMatter(text: string): {
  frontmatter: PostFrontmatter;
  body: string;
} {
  const match = text.match(/^---\n([\s\S]+?)\n---/);

  if (!match) {
    throw new Error(
      "Post must have front matter with required fields: title, summary, author"
    );
  }

  const yaml = match[1];
  const body = text.slice(match[0].length).trimStart();
  const parsed = parseYaml(yaml);

  try {
    const frontmatter = PostFrontmatterSchema.parse(parsed);
    return { frontmatter, body };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      throw new Error(`Invalid post metadata: ${issues}`);
    }
    throw error;
  }
}

// ============================================================================
// Plugin
// ============================================================================

export default {
  name: "post",
  setup(build) {
    build.onLoad({ filter: /\.post\.md$/ }, async (args) => {
      const file = Bun.file(args.path);
      const raw = await file.text();

      const { frontmatter, body } = extractFrontMatter(raw);

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
} satisfies BunPlugin;
