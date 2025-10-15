import {
  getMarkdownFileFileData,
  MarkdownFileModel,
  parseMarkdownFile,
  type MarkdownFile,
  type MarkdownFileFrontmatter,
} from "@/lib/markdown";

export default {
  name: "markdown",
  setup(build) {
    build.onLoad({ filter: /\.md$/, namespace: "file" }, async (args) => {
      const file = Bun.file(args.path);
      const raw = await file.text();

      let frontmatter: MarkdownFileFrontmatter = {};
      let content = raw;

      try {
        const result = parseMarkdownFile(
          raw,
          MarkdownFileModel.shape.frontmatter
        );
        frontmatter = result.frontmatter;
        content = result.content;
      } catch {
        content = raw;
      }

      const fileData = await getMarkdownFileFileData(file);

      const markdownFile = MarkdownFileModel.parse({
        frontmatter,
        content,
        fileData,
      } satisfies MarkdownFile);

      return {
        contents: `export default ${JSON.stringify(markdownFile)};`,
        loader: "js",
      };
    });
  },
} satisfies Bun.BunPlugin;
