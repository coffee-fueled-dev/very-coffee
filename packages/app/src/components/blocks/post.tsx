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
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "../ui/badge";
import type { RegisteredPost, ResolvedPost } from "@/lib/post";
import { Separator } from "../ui/separator";
import { ExternalLink } from "./external-link";
import { CopyButton } from "./copy-button";
import { PostBreadcrumb } from "./post-breadcrumb";
import { isValidElement } from "react";
import { useStaticPost } from "@/contexts/post-context";

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
  const postCount = posts
    ? Object.values(posts).reduce(
        (acc, { published }) => (published ? acc + 1 : acc),
        0
      )
    : undefined;

  return (
    postCount && (
      <Badge>
        {postCount} {postCount === 1 ? "post" : "posts"}
      </Badge>
    )
  );
};

const TagCloud = ({ tags }: { tags: PostPreviewProps["tags"] }) =>
  tags && (
    <div className="flex flex-wrap gap-1 items-center">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );

const PostPreview = ({
  link,
  title,
  tags,
  posts,
  summary,
}: PostPreviewProps) => {
  return (
    <Item variant="outline" size="sm" asChild>
      <Link {...link}>
        <ItemContent>
          <span className="flex gap-2">
            <ItemTitle className="text-lg font-medium">{title}</ItemTitle>
            <TagCloud tags={tags} />
          </span>
          <ItemDescription>{summary}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon className="size-4" />
        </ItemActions>
        <ItemFooter className="space-x-4">
          <PostCountBadge posts={posts} />
        </ItemFooter>
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
    <section className="space-y-6">
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
    </section>
  );

export const PostHeader = () => {
  const { post } = useStaticPost();
  if (!post) return null;
  const { author, title, tags, summary } = post;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {title}
      </h1>
      <p className="text-center text-muted-foreground text-lg">{summary}</p>
      <div className="flex gap-1 items-center justify-center flex-wrap">
        <Badge variant="default">{author}</Badge>
        <TagCloud tags={tags} />
      </div>
    </div>
  );
};

// Custom MDX components
const mdxComponents = {
  // Override default HTML elements
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="scroll-m-20 text-4xl font-bold tracking-tight mt-6 mb-4"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="scroll-m-20 text-3xl font-semibold tracking-tight mt-6 mb-4"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="scroll-m-20 text-2xl font-semibold tracking-tight mt-6 mb-4"
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
  const { module } = post;

  return (
    <section className="space-y-6">
      <PostBreadcrumb />
      <PostHeader />
      {module?.default && (
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <module.default components={mdxComponents} />
        </div>
      )}
    </section>
  );
};

export function getChildPostPreviews(
  segments: string[],
  post: ResolvedPost
): PostPreviewProps[] | undefined {
  if (!post.posts) return;

  const allChildPosts = Object.entries(post.posts);
  const publishedChildren: PostPreviewProps[] = [];

  for (let i = 0; i < allChildPosts.length; i++) {
    const [postKey, post] = allChildPosts[i];
    if (!post.published) continue;

    const childSegments = [...segments, postKey];
    publishedChildren.push({
      ...post,
      link: {
        to: "/blog/$",
        params: { _splat: childSegments.join("/") },
      },
    });
  }

  return publishedChildren;
}

export const resolvePost = async (
  post: RegisteredPost | undefined
): Promise<ResolvedPost> => {
  if (!post || !post.module || !post.published)
    throw notFound({ routeId: rootRouteId });
  const { module, ...rest } = post;
  const postData = await module();
  if (!postData) throw notFound({ routeId: rootRouteId });

  return { ...rest, module: postData };
};
