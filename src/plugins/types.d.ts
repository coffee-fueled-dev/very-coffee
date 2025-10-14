declare type FileMetadata = {
  name: string;
  title: string;
  lastModified: string;
  size: string;
  path?: string;
} & Record<string, string | undefined>;

declare module "*.md" {
  export const content: string;
  export const meta: FileMetadata;
  export default { content, meta };
}
