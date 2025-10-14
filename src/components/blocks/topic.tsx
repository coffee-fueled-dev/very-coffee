import { ChevronRightIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import { Badge } from "../ui/badge";

import { PostList, type Post } from "./post";
import type { TopicMeta } from "@/lib/topics";
import MarkdownPreview from "@uiw/react-markdown-preview";

export interface Topic {
  link: Omit<LinkComponentProps, "children">;
  title: string;
  description: string;
  posts: number;
}

export const TopicList = ({ topics }: { topics: Topic[] }) => (
  <div className="flex flex-col gap-4">
    {topics.map((topic) => (
      <TopicItem {...topic} key={topic.title} />
    ))}
  </div>
);

export const TopicItem = ({ title, description, posts, link }: Topic) => (
  <Item variant="outline" size="sm" asChild>
    <Link {...link}>
      <ItemMedia>
        <Badge variant="secondary">
          {posts} {posts === 1 ? "post" : "posts"}
        </Badge>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Link>
  </Item>
);

export interface TopicDetailProps {
  meta: TopicMeta;
  content: string;
  posts: Post[];
}

export const Topic = ({ meta, content, posts }: TopicDetailProps) => {
  return (
    <section className="flex flex-col gap-6">
      {/* Topic Header */}
      <div className="flex flex-col gap-2">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {meta.name}
        </h1>
        <p className="text-xl text-muted-foreground">{meta.description}</p>
      </div>

      {/* Topic Content */}
      {content && (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MarkdownPreview
            style={{
              backgroundColor: "transparent",
              color: "inherit",
            }}
            source={content}
          />
        </div>
      )}

      {/* Posts List */}
      {posts.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Posts
          </h2>
          <PostList posts={posts} />
        </div>
      )}
    </section>
  );
};
