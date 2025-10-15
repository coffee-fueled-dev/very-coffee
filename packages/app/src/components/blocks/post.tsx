import { ChevronRightIcon } from "lucide-react";
import { Link, type LinkComponentProps } from "@tanstack/react-router";
import type {
  Post as PostData,
  PostFrontmatter,
  PostFileData,
} from "@/lib/post";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "../ui/badge";
import { CopyButton } from "./copy-button";

export interface Post {
  link: Omit<LinkComponentProps, "children">;
  frontmatter: PostFrontmatter;
  fileData: PostFileData;
}

export const PostList = ({ posts }: { posts: Post[] }) => (
  <div className="flex flex-col gap-4">
    {posts.map((post) => (
      <PostItem
        {...post}
        key={post.fileData.name + post.fileData.lastModified}
      />
    ))}
  </div>
);

export const PostItem = ({ link, frontmatter, fileData }: Post) => (
  <Item variant="outline" size="sm" asChild>
    <Link {...link}>
      <ItemMedia className="flex flex-col items-start gap-2">
        <Badge variant="default">{frontmatter.author}</Badge>
        <Badge variant="outline">{fileData.lastModified}</Badge>
      </ItemMedia>
      <ItemContent>
        <span className="flex gap-2">
          <ItemTitle>{frontmatter.title}</ItemTitle>
          <span>
            {frontmatter.tags && (
              <div className="flex flex-wrap gap-1">
                {frontmatter.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </span>
        </span>
        {frontmatter.summary && (
          <ItemDescription>{frontmatter.summary}</ItemDescription>
        )}
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Link>
  </Item>
);

export const Post = ({ post }: { post: PostData }) => {
  return (
    <section className="flex flex-col gap-2 p-6">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {post.frontmatter.title}
      </h1>
      {post.frontmatter.summary && (
        <p className="text-center text-muted-foreground text-lg">
          {post.frontmatter.summary}
        </p>
      )}
      <div className="flex gap-1 items-center justify-center flex-wrap">
        <Badge variant="default">{post.frontmatter.author}</Badge>
        <Badge variant="outline">{post.fileData.lastModified}</Badge>
        {post.frontmatter.tags &&
          post.frontmatter.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
      </div>
      <div>
        <CopyButton content={post.content} label="Copy as markdown" />
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MarkdownPreview
          style={{
            backgroundColor: "transparent",
            color: "inherit",
          }}
          source={post.content}
        />
      </div>
    </section>
  );
};
