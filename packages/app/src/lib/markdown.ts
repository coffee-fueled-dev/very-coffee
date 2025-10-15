import { z } from "zod";

export interface FileMeta {
  name: string;
  size: string;
  lastModified: string;
  path?: string | undefined;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function parseYaml(yaml: string): Record<string, unknown> {
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

export function extractFrontmatter<T>(
  text: string,
  schema: z.ZodSchema<T>
): {
  frontmatter: T;
  body: string;
} {
  const match = text.match(/^---\n([\s\S]+?)\n---/);

  if (!match) {
    throw new Error("Document must have front matter");
  }

  const yaml = match[1];
  const body = text.slice(match[0].length).trimStart();
  const parsed = parseYaml(yaml);

  try {
    const frontmatter = schema.parse(parsed);
    return { frontmatter, body };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join(", ");
      throw new Error(`Invalid frontmatter: ${issues}`);
    }
    throw error;
  }
}
