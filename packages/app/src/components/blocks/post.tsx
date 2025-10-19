import { ChevronRightIcon } from "lucide-react";
import {
  Link,
  notFound,
  rootRouteId,
  type LinkComponentProps,
} from "@tanstack/react-router";
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
import type { PostModule, ResolvedPost } from "@/blog/lib";
import { Separator } from "../ui/separator";

interface PostPreviewProps extends Omit<ResolvedPost, "module"> {
  link: Omit<LinkComponentProps, "children">;
}

const PostCountBadge = ({ posts }: { posts: PostPreviewProps["posts"] }) => {
  const postCount = posts ? Object.keys(posts).length : undefined;

  return (
    postCount && (
      <Badge variant="secondary">
        {postCount} {postCount === 1 ? "post" : "posts"}
      </Badge>
    )
  );
};

const TagCloud = ({ tags }: { tags: PostPreviewProps["tags"] }) =>
  tags && (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );

const PostPreview = ({
  link,
  author,
  title,
  tags,
  posts,
  summary,
}: PostPreviewProps) => {
  return (
    <Item variant="outline" size="sm" asChild>
      <Link {...link}>
        <ItemMedia className="flex flex-col items-start gap-2">
          <Badge variant="default">{author}</Badge>
          <PostCountBadge posts={posts} />
        </ItemMedia>
        <ItemContent>
          <span className="flex gap-2">
            <ItemTitle>{title}</ItemTitle>
            <TagCloud tags={tags} />
          </span>
          <ItemDescription>{summary}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon className="size-4" />
        </ItemActions>
      </Link>
    </Item>
  );
};

export const PostPreviews = ({
  postPreviews,
  sectionTitle,
}: {
  postPreviews: PostPreviewProps[] | undefined;
  sectionTitle: string;
}) =>
  postPreviews && (
    <>
      <Separator />
      <div className="w-full space-y-2">
        <h1 className="scroll-m-20 text-2xl font-medium tracking-tight text-balance text-muted-foreground">
          {sectionTitle}
        </h1>
        <div className="flex flex-col gap-4">
          {postPreviews.map((postPreview, i) => (
            <PostPreview {...postPreview} key={i} />
          ))}
        </div>
      </div>
    </>
  );

const PostContent = ({ content }: { content: ResolvedPost["content"] }) =>
  content && (
    <div className="w-full space-y-6">
      <div>
        <CopyButton content={content} label="Copy as markdown" />
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MarkdownPreview
          style={{
            backgroundColor: "transparent",
            color: "inherit",
          }}
          source={content}
        />
      </div>
    </div>
  );

export const Post = (post: ResolvedPost) => {
  const { author, title, tags, summary, fileData, content } = post;
  return (
    <section className="flex flex-col gap-2 p-6">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {title}
      </h1>
      <p className="text-center text-muted-foreground text-lg">{summary}</p>
      <div className="flex gap-1 items-center justify-center flex-wrap">
        <Badge variant="default">{author}</Badge>
        {fileData && <Badge variant="outline">{fileData.lastModified}</Badge>}
        <TagCloud tags={tags} />
      </div>
      <PostContent content={content} />
    </section>
  );
};

export function getChildPostPreviews(
  pathname: string,
  post: ResolvedPost
): PostPreviewProps[] | undefined {
  if (!post.posts) return;
  const basePath = pathname.replace(/^\/blog\/?/, "");
  return Object.entries(post.posts).map(([postKey, { module, ...post }]) => ({
    ...post,
    link: {
      to: "/blog/$",
      params: { _splat: basePath ? `${basePath}/${postKey}` : postKey },
    },
  }));
}

export const resolvePost = async (
  post: PostModule | undefined
): Promise<ResolvedPost> => {
  if (!post || !post.module) throw notFound({ routeId: rootRouteId });

  const { module, ...metadata } = post;

  const postData = await module();

  if (!postData) throw notFound({ routeId: rootRouteId });

  return { ...metadata, ...postData.default };
};
