declare module "*.md" {
  import type { MarkdownFile } from "@/lib/markdown";
  const data: MarkdownFile;
  export default data;
}
