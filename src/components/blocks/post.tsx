import { ChevronRightIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { FileRouteTypes } from "@/routeTree.gen";
import type { PostMeta } from "@/plugins/post";
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
  route: FileRouteTypes["to"];
  meta: PostMeta;
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
        {meta.tags && (
          <div className="flex flex-wrap gap-1">
            {meta.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
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
  meta,
}: {
  content: string;
  meta: PostMeta;
}) => {
  return (
    <section className="flex flex-col gap-2 p-6">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {meta.title}
      </h1>
      {meta.summary && (
        <p className="text-center text-muted-foreground text-lg">
          {meta.summary}
        </p>
      )}
      <div className="flex gap-1 items-center justify-center flex-wrap">
        <Badge variant="default">{meta.author}</Badge>
        <Badge variant="secondary">{meta.lastModified}</Badge>
        {meta.tags &&
          meta.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
      </div>
      <div>
        <CopyButton content={content} label="Copy as markdown" />
      </div>
      <div>
        <MarkdownPreview
          style={{
            backgroundColor: "white",
            color: "inherit",
          }}
          source={content}
        />
      </div>
    </section>
  );
};
