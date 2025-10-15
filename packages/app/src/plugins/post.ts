import { getMarkdownFileFileData, parseMarkdownFile } from "@/lib/markdown";
import { PostModel, type Post } from "@/lib/post";

export default {
  name: "post",
  setup(build) {
    build.onLoad({ filter: /\.post\.md$/ }, async (args) => {
      const file = Bun.file(args.path);
      const fileContent = await file.text();

      const { frontmatter, content } = parseMarkdownFile(
        fileContent,
        PostModel.shape.frontmatter
      );

      const fileData = await getMarkdownFileFileData(file);

      const post = PostModel.parse({
        frontmatter,
        fileData,
        content,
      } satisfies Post);

      return {
        contents: `export default ${JSON.stringify(post)};`,
        loader: "js",
      };
    });
  },
} satisfies Bun.BunPlugin;
