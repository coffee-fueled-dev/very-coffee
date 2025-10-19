import { ChevronRightIcon } from "lucide-react";
import {
  Link,
  notFound,
  rootRouteId,
  type LinkComponentProps,
} from "@tanstack/react-router";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "../ui/badge";
import type { PostModule, ResolvedPost } from "@/lib/post";
import { Separator } from "../ui/separator";
import { ExternalLink } from "./external-link";
import { CopyButton } from "./copy-button";
import { isValidElement } from "react";

// Helper to extract text content from React children
const extractTextFromChildren = (children: React.ReactNode): string => {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (isValidElement(children) && children.props) {
    return extractTextFromChildren(
      (children.props as { children?: React.ReactNode }).children
    );
  }
  return "";
};

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

// Custom MDX components
const mdxComponents = {
  // Override default HTML elements
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="scroll-m-20 text-3xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="scroll-m-20 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
    const codeContent = extractTextFromChildren(props.children);
    return (
      <div className="relative">
        <div className="absolute top-2 right-2">
          <CopyButton content={codeContent} label="Copy" />
        </div>
        <pre
          className="mb-4 mt-6 overflow-x-auto rounded-lg bg-muted p-4"
          {...props}
        />
      </div>
    );
  },
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
  ),
  a: ExternalLink,
};

export const Post = (post: ResolvedPost) => {
  const { author, title, tags, summary, module } = post;

  const lastModified = module?.metadata?.lastModified;

  return (
    <section className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          {title}
        </h1>
        <p className="text-center text-muted-foreground text-lg">{summary}</p>
        <div className="flex gap-1 items-center justify-center flex-wrap">
          <Badge variant="default">{author}</Badge>
          {lastModified && <Badge variant="outline">{lastModified}</Badge>}
          <TagCloud tags={tags} />
        </div>
      </div>
      {module?.default && (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <module.default components={mdxComponents} />
        </div>
      )}
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
  const { module, ...rest } = post;
  const postData = await module();
  if (!postData) throw notFound({ routeId: rootRouteId });

  return { ...rest, module: postData };
};
