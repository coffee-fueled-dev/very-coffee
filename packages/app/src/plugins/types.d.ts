declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXModule } from "@/lib/post";

  const metadata: MDXModule["metadata"];
  const MDXComponent: MDXModule["default"];
  const raw: MDXModule["raw"];

  export { metadata, raw };
  export default MDXComponent;
}
