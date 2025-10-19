declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXModule } from "@/lib/post";

  const metadata: MDXModule["metadata"];
  const MDXComponent: MDXModule["default"];

  export { metadata };
  export default MDXComponent;
}
