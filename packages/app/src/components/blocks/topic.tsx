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
import type { Topic as TopicData, TopicPreview } from "@/lib/topics";
import MarkdownPreview from "@uiw/react-markdown-preview";

export interface Topic {
  link: Omit<LinkComponentProps, "children">;
  preview: TopicPreview;
}

export const TopicList = ({ topics }: { topics: Topic[] }) => (
  <div className="flex flex-col gap-4">
    {topics.map((topic) => (
      <TopicItem {...topic} key={topic.preview.slug} />
    ))}
  </div>
);

export const TopicItem = ({ preview, link }: Topic) => (
  <Item variant="outline" size="sm" asChild>
    <Link {...link}>
      <ItemMedia>
        <Badge variant="secondary">
          {preview.posts} {preview.posts === 1 ? "post" : "posts"}
        </Badge>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{preview.name}</ItemTitle>
        <ItemDescription>{preview.description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Link>
  </Item>
);

export interface TopicProps {
  topic: TopicData;
  postLinks: Record<string, Omit<LinkComponentProps, "children">>;
}

export const Topic = ({ topic, postLinks }: TopicProps) => {
  const posts: Post[] = topic.posts.map((post) => ({
    link: postLinks[post.fileData.name] || {},
    frontmatter: post.frontmatter,
    fileData: post.fileData,
  }));

  return (
    <section className="flex flex-col gap-6">
      {/* Topic Header */}
      <div className="flex flex-col gap-2">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {topic.name}
        </h1>
        <p className="text-xl text-muted-foreground">{topic.description}</p>
      </div>

      {/* Topic Content */}
      {topic.content && (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MarkdownPreview
            style={{
              backgroundColor: "transparent",
              color: "inherit",
            }}
            source={topic.content}
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
