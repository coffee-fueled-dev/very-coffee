import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { parsePostFile } from "./post";
import type { PostMeta } from "./post";
import { extractFrontmatter } from "./markdown";

const TOPICS_DIR = join(process.cwd(), "public/topics");

// ============================================================================
// Schema & Types
// ============================================================================

export const TopicFrontmatterSchema = z.object({
  name: z.string().min(1, "Topic name is required"),
  description: z.string().min(1, "Topic description is required"),
});

export type TopicFrontmatter = z.infer<typeof TopicFrontmatterSchema>;

export type TopicMeta = TopicFrontmatter & {
  slug: string;
};

export interface TopicInfo {
  slug: string;
  name: string;
  description: string;
  postCount: number;
}

// ============================================================================
// Utilities
// ============================================================================

export async function getTopic(
  slug: string
): Promise<{ meta: TopicMeta; content: string } | null> {
  try {
    const topicPath = join(TOPICS_DIR, slug);
    const indexPath = join(topicPath, "index.md");
    const file = Bun.file(indexPath);
    const exists = await file.exists();

    if (!exists) {
      return null;
    }

    const text = await file.text();
    const { frontmatter, body } = extractFrontmatter(
      text,
      TopicFrontmatterSchema
    );

    return {
      meta: {
        ...frontmatter,
        slug,
      },
      content: body,
    };
  } catch (error) {
    console.error(`Error reading topic "${slug}":`, error);
    return null;
  }
}

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function getTopics(): Promise<TopicInfo[]> {
  try {
    const entries = readdirSync(TOPICS_DIR);
    const topics: TopicInfo[] = [];

    for (const entry of entries) {
      const topicPath = join(TOPICS_DIR, entry);
      const stat = statSync(topicPath);

      if (stat.isDirectory()) {
        const posts = readdirSync(topicPath).filter((file) =>
          file.endsWith(".post.md")
        );

        const topic = await getTopic(entry);

        topics.push({
          slug: entry,
          name: topic?.meta.name || slugToTitle(entry),
          description:
            topic?.meta.description || `Posts about ${slugToTitle(entry)}`,
          postCount: posts.length,
        });
      }
    }

    return topics;
  } catch (error) {
    console.error("Error reading topics directory:", error);
    return [];
  }
}

export async function getTopicPosts(
  topic: string
): Promise<Array<{ slug: string; topic: string; meta: PostMeta }>> {
  try {
    const topicPath = join(TOPICS_DIR, topic);
    const entries = readdirSync(topicPath);
    const posts: Array<{ slug: string; topic: string; meta: PostMeta }> = [];

    for (const entry of entries) {
      if (entry.endsWith(".post.md")) {
        const slug = entry.replace(".post.md", "");
        const postPath = join(topicPath, entry);

        try {
          const { meta } = await parsePostFile(postPath);
          posts.push({
            slug,
            topic,
            meta,
          });
        } catch (err) {
          if (err instanceof Error) {
            console.error(`Error reading post ${topic}/${slug}:`, err.message);
          } else {
            console.error(`Error reading post ${topic}/${slug}:`, err);
          }
        }
      }
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

export async function getPost(
  topic: string,
  slug: string
): Promise<{ content: string; meta: PostMeta } | null> {
  try {
    const topicPath = join(TOPICS_DIR, topic);
    const postPath = join(topicPath, `${slug}.post.md`);

    try {
      statSync(postPath);
    } catch {
      return null;
    }

    return parsePostFile(postPath);
  } catch (error) {
    console.error(`Error reading post "${topic}/${slug}":`, error);
    return null;
  }
}
