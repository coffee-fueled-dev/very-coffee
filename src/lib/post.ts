import path from "node:path";
import { z } from "zod";
import { formatSize, extractFrontmatter, type FileMeta } from "./markdown";

// ============================================================================
// Schema & Types
// ============================================================================

export const PostFrontmatterSchema = z.object({
  title: z.string().min(1, "Post title is required"),
  summary: z.string().min(1, "Post summary is required"),
  author: z.string().min(1, "Post author is required"),
  tags: z.array(z.string()).optional(),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export type PostMeta = PostFrontmatter & FileMeta;

export async function parsePostFile(filePath: string): Promise<{
  content: string;
  meta: PostMeta;
}> {
  const file = Bun.file(filePath);
  const fileContent = await file.text();
  const stat = await file.stat();

  const { frontmatter, body } = extractFrontmatter(
    fileContent,
    PostFrontmatterSchema
  );

  const meta: PostMeta = {
    ...frontmatter,
    name: path.basename(filePath),
    size: formatSize(stat.size),
    lastModified: new Date(stat.mtime).toLocaleDateString(),
    path: filePath,
  };

  return {
    content: body,
    meta,
  };
}
