import path from "node:path";
import z from "zod";

export const MarkdownFileModel = z.object({
  frontmatter: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  fileData: z.object({
    name: z.string(),
    size: z.string(),
    lastModified: z.string(),
    path: z.string().optional(),
  }),
  content: z.string(),
});

export type MarkdownFile = z.infer<typeof MarkdownFileModel>;
export type MarkdownFileFrontmatter = z.infer<
  typeof MarkdownFileModel.shape.frontmatter
>;
export type MarkdownFileFileData = z.infer<
  typeof MarkdownFileModel.shape.fileData
>;

export async function getMarkdownFileFileData(
  file: Bun.BunFile
): Promise<MarkdownFileFileData> {
  const stat = await file.stat();
  return MarkdownFileModel.shape.fileData.parse({
    name: file.name ? path.basename(file.name) : "",
    size: formatSize(stat.size),
    lastModified: new Date(stat.mtime).toLocaleDateString(),
    path: file.name,
  } satisfies MarkdownFileFileData);
}

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

export async function getFrontmatter<T>(
  file: Bun.BunFile,
  schema: z.ZodSchema<T>
): Promise<T> {
  const textStream = file.stream().pipeThrough(new TextDecoderStream());
  const reader = textStream.getReader();

  let accumulated = "";
  let foundStart = false;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      accumulated += value;

      // Check if we've found the complete frontmatter
      if (!foundStart && accumulated.startsWith("---\n")) {
        foundStart = true;
      }

      if (foundStart) {
        const endIndex = accumulated.indexOf("\n---", 4);
        if (endIndex !== -1) {
          // Found the end of frontmatter, stop reading
          reader.cancel();
          break;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  const match = accumulated.match(/^---\n([\s\S]+?)\n---/);
  if (!match) {
    throw new Error("Document must have front matter");
  }
  return schema.parse(parseYaml(match[1]));
}

export function parseMarkdownFile<T>(
  text: string,
  schema: z.ZodSchema<T>
): {
  frontmatter: T;
  content: string;
} {
  const match = text.match(/^---\n([\s\S]+?)\n---/);

  if (!match) {
    throw new Error("Document must have front matter");
  }

  const yaml = match[1];
  const content = text.slice(match[0].length).trimStart();
  const parsed = parseYaml(yaml);

  try {
    const frontmatter = schema.parse(parsed);
    return { frontmatter, content };
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
