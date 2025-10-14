import type { BunPlugin } from "bun";
import path from "node:path";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Convert snake_case, kebab-case, camelCase, PascalCase → "Capitalized Words"
function formatTitleFromFilename(filename: string): string {
  const name = path.basename(filename, ".md");
  let title = name.replace(/[_-]+/g, " ");
  title = title.replace(/([a-z])([A-Z])/g, "$1 $2");
  title = title.replace(/\s+/g, " ").trim();
  return title
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Extract YAML-style front-matter
function extractFrontMatter(text: string) {
  const match = text.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return { front: {}, body: text };

  const yaml = match[1];
  const body = text.slice(match[0].length).trimStart();
  const front: Record<string, string> = {};

  for (const line of yaml.split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length > 0) front[key.trim()] = rest.join(":").trim();
  }

  return { front, body };
}

// Grab the first Markdown heading (e.g., "# My Title")
function extractHeadingTitle(text: string): string | undefined {
  const match = text.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

export default {
  name: "markdown",
  setup(build) {
    build.onLoad({ filter: /\.md$/ }, async (args) => {
      const file = Bun.file(args.path);
      const raw = await file.text();

      const { front, body } = extractFrontMatter(raw);
      const headingTitle = extractHeadingTitle(body);

      const fallbackTitle = formatTitleFromFilename(file.name ?? "");
      const title = front.title || headingTitle || fallbackTitle;

      const meta: FileMetadata = {
        name: path.basename(file.name ?? ""),
        title,
        size: formatSize(file.size),
        lastModified: new Date(file.lastModified).toLocaleString(),
        path: file.name,
        ...front,
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
