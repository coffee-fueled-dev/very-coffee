import {
  ChevronRightIcon,
  ChevronsUpDown,
  Download,
  FileText,
} from "lucide-react";
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
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Loader } from "./loader";
import {
  useStaticPost,
  useLazyPost,
  type PostPreviewProps,
  collectPostHierarchy,
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
  onNavigate,
}: PostPreviewProps & { onNavigate?: () => void }) => {
  return (
    <Link {...link} onClick={onNavigate}>
      <Item variant="muted" size="sm">
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
      </Item>
    </Link>
  );
};

export const PostPreviews = ({ sectionTitle }: { sectionTitle: string }) => {
  const { childPostPreviews } = useStaticPost();

  const [open, setOpen] = useState(false);

  if (childPostPreviews.length === 0) return null;

  return (
    <Collapsible
      className="w-full flex flex-col gap-2"
      open={open}
      onOpenChange={setOpen}
    >
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
          <PostPreview
            {...postPreview}
            onNavigate={() => {
              setOpen(false);
            }}
          />
        </CollapsibleContent>
      ))}
    </Collapsible>
  );
};

export const PostHeader = () => {
  const { post, segments, breadcrumbs } = useStaticPost();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadHierarchy = useCallback(async () => {
    if (!post) return;

    setIsDownloading(true);
    try {
      // Collect all posts in hierarchy
      const hierarchy = collectPostHierarchy(post as any, segments);

      // Fetch raw content for each post
      const contents: string[] = [];
      for (const { segments: postSegments, post: p } of hierarchy) {
        const apiPath = postSegments.join("/");
        try {
          const res = await fetch(`/api/posts/${apiPath}?raw=true`);
          if (res.ok) {
            const raw = await res.text();
            // Add a header comment with the post title and path
            const header = `<!-- ${
              p.title
            } -->\n<!-- Path: /${postSegments.join("/")} -->\n\n`;
            contents.push(header + raw);
          }
        } catch (e) {
          console.warn(`Failed to fetch ${apiPath}:`, e);
        }
      }

      // Concatenate with separators
      const combined = contents.join("\n\n---\n\n");

      // Create and trigger download
      const blob = new Blob([combined], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${post.title.toLowerCase().replace(/\s+/g, "-")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }, [post, segments]);

  if (!post) return null;
  const { author, title, tags, summary } = post;

  // Show download button for all posts except the root blog index
  const showDownloadButton = breadcrumbs.length > 1;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        {title}
      </h1>
      <p className="text-center text-muted-foreground text-lg">{summary}</p>
      <div className="flex gap-1 items-center justify-center flex-wrap">
        <Badge variant="default">{author}</Badge>
        <TagCloud tags={tags} />
        {showDownloadButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadHierarchy}
            disabled={isDownloading}
          >
            <Download className="size-4" />
            {isDownloading ? "Downloading..." : "Download All"}
          </Button>
        )}
      </div>
    </div>
  );
};

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="scroll-m-20 text-4xl tracking-loose mt-6 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="scroll-m-20 text-2xl tracking-loose mt-6 mb-4" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="scroll-m-20 text-xl tracking-loose mt-6 mb-4" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="scroll-m-20 text-lg tracking-tight mt-6 mb-4" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-7 mb-6" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="my-6 ml-6 list-disc [&>li]:mt-2 [&>li]:leading-7"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="my-6 ml-6 list-decimal [&>li]:mt-2 [&>li]:leading-7"
      {...props}
    />
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
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="border-b border-border" {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="divide-y divide-border" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className="border-b border-border transition-colors hover:bg-muted/50"
      {...props}
    />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-4 py-3 text-left font-semibold text-foreground"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 text-muted-foreground" {...props} />
  ),
};

export const Post = (post: ResolvedPost & { rawUrl?: string }) => {
  const { module, rawUrl } = post;

  // Add alternate link to document head for raw source
  useEffect(() => {
    if (!rawUrl) return;

    const link = document.createElement("link");
    link.rel = "alternate";
    link.type = "text/plain";
    link.href = rawUrl;
    link.title = "Raw Markdown Source";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [rawUrl]);

  return (
    module?.default && (
      <motion.div
        className="prose prose-neutral dark:prose-invert max-w-none"
        key="content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex gap-2 not-prose mb-4 justify-between">
          <CopyButton content={module.raw ?? ""} label="Copy" />
          {rawUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={rawUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="size-4" />
                View Source
              </a>
            </Button>
          )}
        </div>
        <module.default components={mdxComponents} />
      </motion.div>
    )
  );
};

export function PostPageContent() {
  const { post, segments } = useStaticPost();
  const getLazyPost = useLazyPost();
  const LazyPost = useMemo(
    () => getLazyPost(post, segments),
    [getLazyPost, post, segments]
  );

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader task="Loading post" />}>
        <LazyPost />
      </Suspense>
    </AnimatePresence>
  );
}
