declare module "*.post.md" {
  import type { Post } from "@/lib/post";
  const data: Post;
  export default data;
}

declare module "*.md" {
  import type { MarkdownFile } from "@/lib/markdown";
  const data: MarkdownFile;
  export default data;
}
