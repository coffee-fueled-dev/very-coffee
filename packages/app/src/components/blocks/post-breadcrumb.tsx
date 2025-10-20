import { Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { blog } from "@/blog";
import type { RegisteredPost } from "@/lib/post";

interface BreadcrumbCrumb {
  title: string;
  segments: string[];
}

/**
 * Build breadcrumb trail by traversing the blog post tree
 */
function buildBreadcrumbPath(segments: string[]): BreadcrumbCrumb[] {
  const crumbs: BreadcrumbCrumb[] = [{ title: "Topics", segments: [] }];

  let currentPost: RegisteredPost | undefined = blog;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!currentPost?.posts || !(segment in currentPost.posts)) {
      break;
    }

    currentPost = currentPost.posts[segment];

    crumbs.push({
      title: currentPost.title,
      segments: segments.slice(0, i + 1),
    });
  }

  return crumbs;
}

/**
 * Convert path segments to a blog URL
 */
function segmentsToPath(segments: string[]): string {
  if (segments.length === 0) return "/blog";
  return `/blog/${segments.join("/")}`;
}

export function PostBreadcrumb({ segments }: { segments: string[] }) {
  const crumbs = buildBreadcrumbPath(segments);

  // Don't show breadcrumb if we're at the root
  if (crumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const path = segmentsToPath(crumb.segments);

          return (
            <div key={path} className="contents">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{crumb.title}</Link>
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
