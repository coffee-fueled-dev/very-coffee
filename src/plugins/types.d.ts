declare module "*.post.md" {
  import type { PostMeta } from "./post";

  export const content: string;
  export const meta: PostMeta;
  export default { content, meta };
}
