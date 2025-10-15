import { z } from "zod";
import {
  getFrontmatter,
  getMarkdownFileFileData,
  parseMarkdownFile,
} from "./markdown";

export const PostModel = z.object({
  frontmatter: z.object({
    title: z.string().min(1, "Post title is required"),
    summary: z.string().min(1, "Post summary is required"),
    author: z.string().min(1, "Post author is required"),
    tags: z.array(z.string()).optional(),
  }),
  fileData: z.object({
    name: z.string(),
    size: z.string(),
    lastModified: z.string(),
    path: z.string().optional(),
  }),
  content: z.string(),
});

export type Post = z.infer<typeof PostModel>;
export type PostFileData = z.infer<typeof PostModel.shape.fileData>;
export type PostFrontmatter = z.infer<typeof PostModel.shape.frontmatter>;

export async function getPost(filePath: string): Promise<Post> {
  const file = Bun.file(filePath);
  const fileContent = await file.text();

  const { frontmatter, content } = parseMarkdownFile(
    fileContent,
    PostModel.shape.frontmatter
  );

  const fileData = await getMarkdownFileFileData(file);

  return PostModel.parse({
    frontmatter,
    fileData,
    content,
  } satisfies Post);
}

export async function getPostFrontmatter(
  file: Bun.BunFile
): Promise<PostFrontmatter> {
  return getFrontmatter(file, PostModel.shape.frontmatter);
}
