import { blog } from "../blog";
import type { ComponentType } from "react";

const TOPICS = blog?.posts;

export type Tag = (typeof TAGS)[number];
export const TAGS = [
  "machine learning",
  "tokenization",
  "compression",
] as const;

export function asTag(tag: string) {
  if (!TAGS.includes(tag as Tag)) throw new Error("String is not a tag");
  return tag as Tag;
}

export function asTopicKey(topic: string) {
  if (!(topic in TOPICS)) throw new Error("Topic not found");
  return topic as keyof typeof TOPICS;
}

export function asPostKey(topic: keyof typeof TOPICS, post: string) {
  const selectedTopic = TOPICS[topic];
  if (!(post in selectedTopic["posts"])) throw new Error("Post not found");
  return post as keyof (typeof selectedTopic)["posts"];
}

export interface PostMetadata {
  size: string;
  lastModified: string;
  path?: string | undefined;
}

export interface MDXModule {
  default: ComponentType<any>;
  metadata?: PostMetadata;
}

export interface PostModule {
  __type: "post";
  title: string;
  author: string;
  summary: string;
  tags?: Tag[];
  module?: () => Promise<MDXModule>;
  posts?: Record<string, PostModule>;
}
export type ResolvedPost = Omit<PostModule, "module"> & {
  module: MDXModule | undefined;
};

// TODO: Add schema
export const isPost = (post: Object) =>
  "__type" in post && post.__type === "post";

export const postFromPathSegment = (pathSegment: string[]) =>
  pathSegment.reduce<PostModule | undefined>((acc, key) => {
    if (!acc || !acc.posts || !(key in acc.posts)) return undefined;
    const child = acc.posts[key];
    if (isPost(child)) return child;
    return undefined;
  }, blog);
