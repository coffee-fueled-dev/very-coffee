import { createContext, useContext } from "react";
import type { RegisteredPost } from "@/lib/post";
import type { LinkComponentProps } from "@tanstack/react-router";

interface BlogContextValue {
  rootPost: RegisteredPost;
  baseRoute: string;
}

const BlogContext = createContext<BlogContextValue | undefined>(undefined);

interface BlogProviderProps {
  rootPost: RegisteredPost;
  baseRoute: NonNullable<LinkComponentProps["to"]>;
  children: React.ReactNode;
}

export function BlogProvider({
  rootPost,
  baseRoute,
  children,
}: BlogProviderProps) {
  const value = { rootPost, baseRoute };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
}
