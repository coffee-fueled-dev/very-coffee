import { ChevronRightIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Link } from "@tanstack/react-router";
import type { FileRouteTypes } from "@/routeTree.gen";
import { Badge } from "../ui/badge";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { CopyButton } from "./copy-button";

export interface Post {
  route: FileRouteTypes["to"];
  meta: FileMetadata;
}

export const PostList = ({ posts }: { posts: Post[] }) => (
  <div className="flex flex-col gap-4">
    {posts.map((post) => (
      <PostItem {...post} key={post.meta.name} />
    ))}
  </div>
);

export const PostItem = ({ route, meta }: Post) => (
  <Item variant="outline" size="sm" asChild>
    <Link to={route}>
      <ItemMedia className="flex flex-col items-start gap-1">
        <Badge variant="default">{meta.author}</Badge>
        <Badge variant="secondary">{meta.lastModified}</Badge>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{meta.title}</ItemTitle>
        {meta.summary && <ItemDescription>{meta.summary}</ItemDescription>}
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" />
      </ItemActions>
    </Link>
  </Item>
);

export const Post = ({
  content,
  title,
  lastModified,
  author,
}: {
  content: string;
  title: string;
  lastModified: string;
  author: string;
}) => {
  return (
    <section className="flex flex-col gap-2 p-6">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {title}
      </h1>
      <span className="flex gap-1 items-center">
        <Badge variant="default">{author}</Badge>
        <Badge variant="secondary">{lastModified}</Badge>
      </span>
      <div>
        <CopyButton content={content} label="Copy as markdown" />
      </div>
      <div>
        <MarkdownPreview
          style={{
            backgroundColor: "transparent",
            color: "inherit",
          }}
          source={content}
        />
      </div>
    </section>
  );
};
