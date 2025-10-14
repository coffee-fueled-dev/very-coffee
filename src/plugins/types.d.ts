declare module "*.post.md" {
  import type { PostMeta } from "@/lib/post";

  export const content: string;
  export const meta: PostMeta;
  export default { content, meta };
}

declare module "*.md" {
  import type { FileMeta } from "@/lib/markdown";

  export const content: string;
  export const meta: FileMeta & Record<string, unknown>;

  const data: { content: string; meta: FileMeta & Record<string, unknown> };
  export default data;
}
