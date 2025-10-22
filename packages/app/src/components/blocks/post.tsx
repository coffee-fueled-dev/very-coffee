import { ChevronRightIcon, ChevronsUpDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "../ui/badge";
import type { ResolvedPost } from "@/lib/post";
import { Separator } from "../ui/separator";
import { InlineLink } from "./external-link";
import { CopyButton } from "./copy-button";
import { Suspense, useMemo } from "react";
import {
  useStaticPost,
  useLazyPost,
  type PostPreviewProps,
} from "@/contexts/post-context";
import { extractTextFromChildren } from "@/lib/extract-text-from-children";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { AnimatePresence, motion } from "motion/react";

export function PostBreadcrumb() {
  const { breadcrumbs } = useStaticPost();

  // Don't show breadcrumb if we're at the root
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={crumb.path} className="contents">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path}>{crumb.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

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
  childPostCount,
  summary,
}: PostPreviewProps) => {
  return (
    <Item variant="outline" size="sm" asChild>
      <Link {...link}>
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
        {childPostCount > 0 && (
          <>
            <Separator />
            <ItemFooter className="space-x-4">
              <Badge>
                {childPostCount} {childPostCount === 1 ? "post" : "posts"}
              </Badge>
            </ItemFooter>
          </>
        )}
      </Link>
    </Item>
  );
};

export const PostPreviews = ({ sectionTitle }: { sectionTitle: string }) => {
  const { childPostPreviews } = useStaticPost();

  if (childPostPreviews.length === 0) return null;

  return (
    <Collapsible className="w-full flex flex-col gap-4">
      <CollapsibleTrigger asChild>
        <Item variant="outline" className="cursor-pointer" size="sm">
          <ItemContent>
            <ItemTitle>{sectionTitle}</ItemTitle>
          </ItemContent>
          <ItemContent>
            <Badge variant="secondary">{childPostPreviews.length}</Badge>
          </ItemContent>
          <ItemActions>
            <ChevronsUpDown size={16} />
            <span className="sr-only">Toggle</span>
          </ItemActions>
        </Item>
      </CollapsibleTrigger>
      {childPostPreviews.map((postPreview, i) => (
        <CollapsibleContent key={i}>
          <PostPreview {...postPreview} />
        </CollapsibleContent>
      ))}
    </Collapsible>
  );
};

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

const mdxComponents = {
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
    <p className="leading-7 mb-6" {...props} />
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
  a: InlineLink,
};

export const Post = (post: ResolvedPost) => {
  const { module } = post;

  return (
    module?.default && (
      <motion.div
        className="prose prose-neutral dark:prose-invert max-w-none"
        key="content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <module.default components={mdxComponents} />
      </motion.div>
    )
  );
};

export function PostPageContent() {
  const { post } = useStaticPost();
  const getLazyPost = useLazyPost();
  const LazyPost = useMemo(() => getLazyPost(post), [getLazyPost, post]);

  return (
    <AnimatePresence mode="wait">
      <Suspense>
        <LazyPost />
      </Suspense>
    </AnimatePresence>
  );
}
