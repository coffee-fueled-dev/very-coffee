import { blog } from "../blog";
import type { ComponentType } from "react";

const TOPICS = blog?.posts as Record<string, RegisteredPost> | undefined;

export type Tag = (typeof TAGS)[number];
export const TAGS = [
  "machine learning",
  "tokenization",
  "compression",
  "security",
  "graphs",
  "ai",
  "agents",
  "state spaces",
  "formal methods",
  "agency",
  "learning",
  "llm",
  "lattice theory",
  "differential geometry",
  "category theory",
] as const;

export function asTag(tag: string) {
  if (!TAGS.includes(tag as Tag)) throw new Error("String is not a tag");
  return tag as Tag;
}

export function asTopicKey(topic: string) {
  if (!TOPICS || !(topic in TOPICS)) throw new Error("Topic not found");
  return topic;
}

export function asPostKey(topic: string, post: string) {
  if (!TOPICS || !(topic in TOPICS)) throw new Error("Topic not found");
  const selectedTopic = TOPICS[topic];
  if (!selectedTopic.posts || !(post in selectedTopic.posts))
    throw new Error("Post not found");
  return post;
}

export interface PostMetadata {
  size: string;
  lastModified: string;
  path?: string | undefined;
}

export interface MDXModule {
  default: ComponentType<any>;
  raw?: string;
  metadata?: PostMetadata;
}

export interface RegisteredPost {
  __type: "post";
  published: boolean;
  title: string;
  author: string;
  summary: string;
  tags?: Tag[];
  module?: () => Promise<MDXModule>;
  posts?: Record<string, RegisteredPost>;
}
export type ResolvedPost = Omit<RegisteredPost, "module"> & {
  module: MDXModule | undefined;
  rawUrl?: string;
};

// TODO: Add schema
export const isPost = (post: Object) =>
  "__type" in post && post.__type === "post";

export const postFromPathSegment = (pathSegment: string[]) =>
  pathSegment.reduce<RegisteredPost | undefined>((acc, key) => {
    if (!acc || !acc.posts || !(key in acc.posts)) return undefined;
    const child = acc.posts[key];
    if (isPost(child)) return child;
    return undefined;
  }, blog);
