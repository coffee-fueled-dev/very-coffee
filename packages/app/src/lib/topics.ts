import { getMarkdownFileFileData, parseMarkdownFile } from "@/lib/markdown";
import { getPostFrontmatter, PostModel } from "@/lib/post";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const TOPICS_DIR = join(process.cwd(), "public/topics");

export const PartialPostDTO = z.object({
  frontmatter: PostModel.shape.frontmatter,
  fileData: PostModel.shape.fileData,
});

export const TopicModel = z.object({
  slug: z.string(),
  name: z.string().min(1, "Topic name is required"),
  description: z.string().min(1, "Topic description is required"),
  content: z.string(),
  posts: z.array(PartialPostDTO),
});

export const TopicFrontmatterDTO = z.object({
  name: TopicModel.shape.name,
  description: TopicModel.shape.description,
});

export const TopicPreviewDTO = z.object({
  slug: TopicModel.shape.slug,
  name: TopicModel.shape.name,
  description: TopicModel.shape.description,
  posts: z.number(),
});

export type Topic = z.infer<typeof TopicModel>;
export type PartialPost = z.infer<typeof PartialPostDTO>;
export type TopicFrontmatter = z.infer<typeof TopicFrontmatterDTO>;
export type TopicPreview = z.infer<typeof TopicPreviewDTO>;

export async function getTopic(slug: string): Promise<Topic | null> {
  try {
    const topicPath = join(TOPICS_DIR, slug);
    const topicFile = join(topicPath, "topic.md");
    const file = Bun.file(topicFile);
    const exists = await file.exists();

    if (!exists) {
      return null;
    }

    const text = await file.text();
    const { frontmatter, content } = parseMarkdownFile(
      text,
      TopicFrontmatterDTO
    );

    const posts = await getPosts(slug);

    return TopicModel.parse({
      ...frontmatter,
      content,
      posts,
      slug,
    } satisfies Topic);
  } catch (error) {
    console.error(`Error reading topic "${slug}":`, error);
    return null;
  }
}

export async function getTopicPreviews(): Promise<TopicPreview[]> {
  try {
    const entries = readdirSync(TOPICS_DIR);
    const topics: TopicPreview[] = [];

    for (const entry of entries) {
      const topicPath = join(TOPICS_DIR, entry);
      const stat = statSync(topicPath);

      if (stat.isDirectory()) {
        const topicFile = Bun.file(join(topicPath, "topic.md"));
        const exists = await topicFile.exists();

        if (!exists) continue;

        const text = await topicFile.text();
        const { frontmatter } = parseMarkdownFile(text, TopicFrontmatterDTO);

        const glob = new Bun.Glob("*.post.md");
        const files = await Array.fromAsync(glob.scan({ cwd: topicPath }));

        topics.push(
          TopicPreviewDTO.parse({
            slug: entry,
            name: frontmatter.name,
            description: frontmatter.description,
            posts: files.length,
          } satisfies TopicPreview)
        );
      }
    }

    return topics;
  } catch (error) {
    console.error("Error reading topics directory:", error);
    return [];
  }
}

async function getPosts(topic: string): Promise<PartialPost[]> {
  try {
    const topicPath = join(TOPICS_DIR, topic);
    const glob = new Bun.Glob("*.post.md");
    const files = await Array.fromAsync(glob.scan({ cwd: topicPath }));

    const posts: PartialPost[] = [];
    for (let i = 0; i < files.length; i++) {
      const filePath = join(topicPath, files[i]);
      const file = Bun.file(filePath);
      const frontmatter = await getPostFrontmatter(file);
      const fileData = await getMarkdownFileFileData(file);
      posts.push(
        PartialPostDTO.parse({ frontmatter, fileData } satisfies PartialPost)
      );
    }

    return posts;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error reading topic "${topic}":`, error.message);
    } else {
      console.error(`Error reading topic "${topic}":`, error);
    }
    return [];
  }
}
