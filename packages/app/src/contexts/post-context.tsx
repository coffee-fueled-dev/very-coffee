import { createContext, useContext, useMemo, useCallback, lazy } from "react";
import {
  postFromPathSegment,
  type RegisteredPost,
  type ResolvedPost,
} from "@/lib/post";
import { useBlog } from "./blog-context";
import {
  notFound,
  rootRouteId,
  type LinkComponentProps,
} from "@tanstack/react-router";
import { Post } from "@/components/blocks/post";

const MAX_POST_DEPTH = 10;

interface BreadcrumbCrumb {
  title: string;
  segments: string[];
  path: string;
}

interface PostContextValue {
  post: Omit<RegisteredPost, "module"> | undefined;
  segments: string[];
  breadcrumbs: BreadcrumbCrumb[];
  childPostPreviews: PostPreviewProps[];
  isValid: boolean;
  path: string;
}

const PostContext = createContext<PostContextValue | undefined>(undefined);

/**
 * Build breadcrumb trail by traversing the blog post tree
 */
function buildBreadcrumbPath(
  rootPost: RegisteredPost,
  baseRoute: string,
  segments: string[]
): BreadcrumbCrumb[] {
  const crumbs: BreadcrumbCrumb[] = [
    {
      title: rootPost.title,
      segments: [],
      path: `/${baseRoute}`,
    },
  ];

  let currentPost: RegisteredPost | undefined = rootPost;

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (!currentPost?.posts || !(segment in currentPost.posts)) {
      break;
    }

    currentPost = currentPost.posts[segment];
    const crumbSegments = segments.slice(0, i + 1);

    crumbs.push({
      title: currentPost.title,
      segments: crumbSegments,
      path: segmentsToPath(baseRoute, crumbSegments),
    });
  }

  return crumbs;
}

/**
 * Convert path segments to a blog URL
 */
function segmentsToPath(baseRoute: string, segments: string[]): string {
  if (segments.length === 0) return `/${baseRoute}`;
  return `/${baseRoute}/${segments.join("/")}`;
}

export interface PostPreviewProps extends Omit<RegisteredPost, "module"> {
  link: Omit<LinkComponentProps, "children">;
  /**
   * Total number of published posts in this post's subtree (excluding itself).
   */
  childPostCount: number;
}

const countChildPosts = (post: RegisteredPost): number =>
  post.posts
    ? Object.values(post.posts).reduce((acc, child) => {
        if (!child.published) return acc;
        return acc + 1 + countChildPosts(child);
      }, 0)
    : 0;

/**
 * Recursively collect all posts in a hierarchy (depth-first).
 * Returns array of { segments, post } for each published post.
 */
export function collectPostHierarchy(
  post: RegisteredPost,
  baseSegments: string[] = []
): { segments: string[]; post: RegisteredPost }[] {
  const result: { segments: string[]; post: RegisteredPost }[] = [];

  // Add the current post first
  if (post.published) {
    result.push({ segments: baseSegments, post });
  }

  // Recursively add children
  if (post.posts) {
    for (const [key, child] of Object.entries(post.posts)) {
      if (child.published) {
        const childSegments = [...baseSegments, key];
        result.push(...collectPostHierarchy(child, childSegments));
      }
    }
  }

  return result;
}

export function getChildPostPreviews(
  segments: string[],
  post: RegisteredPost
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
      childPostCount: countChildPosts(post),
      link: {
        to: "/blog/$",
        params: { _splat: childSegments.join("/") },
      },
    });
  }

  return publishedChildren;
}

interface PostProviderProps {
  splat: string | undefined;
  children: React.ReactNode;
}

export function PostProvider({ splat, children }: PostProviderProps) {
  const { rootPost, baseRoute } = useBlog();

  const value = useMemo(() => {
    // Parse splat into segments
    const segments = splat?.split("/").filter(Boolean) ?? [];

    // Validate depth
    if (segments.length > MAX_POST_DEPTH) {
      return {
        post: undefined,
        segments: segments,
        breadcrumbs: [],
        childPostPreviews: [],
        isValid: false,
        path: "",
      };
    }

    // Get post from segments
    const post = postFromPathSegment(segments);

    // Build breadcrumbs
    const breadcrumbs = buildBreadcrumbPath(rootPost, baseRoute, segments);

    // Get child post previews
    const childPostPreviews = post
      ? getChildPostPreviews(segments, post) ?? []
      : [];

    return {
      post,
      segments,
      breadcrumbs,
      childPostPreviews,
      isValid: post !== undefined,
      path: segmentsToPath(baseRoute, segments),
    };
  }, [splat, rootPost, baseRoute]);

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function useStaticPost(): PostContextValue {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
}

const resolvePost = async (
  post: RegisteredPost | undefined,
  segments: string[]
): Promise<ResolvedPost> => {
  if (!post || !post.published) throw notFound({ routeId: rootRouteId });

  const apiPath = segments.join("/");
  const rawUrl = `/api/posts/${apiPath}?raw=true`;

  // If module is provided (for root/legacy posts), use it
  if (post.module) {
    const { module, ...rest } = post;
    const postData = await module();
    if (!postData) throw notFound({ routeId: rootRouteId });
    return { ...rest, module: postData, rawUrl };
  }

  // Otherwise, fetch from API on-demand
  // Import directly from the API URL (not blob URL) so import maps work
  // Import maps allow the browser to resolve 'react' imports to our shims
  const moduleUrl = `/api/posts/${apiPath}`;

  try {
    // Dynamic import from real URL - browser uses import maps to resolve React
    const postData = await import(/* @vite-ignore */ moduleUrl);

    const { module: _, ...rest } = post;
    return { ...rest, module: postData, rawUrl };
  } catch (error) {
    console.error("Failed to load post module:", error);
    throw notFound({ routeId: rootRouteId });
  }
};

export function useLazyPost() {
  const { rootPost } = useBlog();

  return useCallback(
    (post: RegisteredPost | undefined, segments: string[]) => {
      const postToResolve = post ?? rootPost;
      return lazy(async () => {
        const resolvedPost = await resolvePost(postToResolve, segments);
        return { default: () => <Post {...resolvedPost} /> };
      });
    },
    [rootPost]
  );
}
