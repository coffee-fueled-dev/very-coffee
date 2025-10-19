declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { MDXModule } from "@/blog/lib";

  const metadata: MDXModule["metadata"];
  const MDXComponent: MDXModule["default"];

  export { metadata };
  export default MDXComponent;
}
