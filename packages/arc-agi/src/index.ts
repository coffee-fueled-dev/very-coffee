import { serve } from "bun";
import index from "./index.html";

const ARC_REPO_BASE =
  "https://api.github.com/repos/arcprize/ARC-AGI-2/contents/data";
const ARC_RAW_BASE =
  "https://raw.githubusercontent.com/arcprize/ARC-AGI-2/main/data";

// Cache for file list to avoid hitting GitHub API rate limits
let puzzleListCache: { files: string[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ArcPuzzle {
  train: Array<{ input: number[][]; output: number[][] }>;
  test: Array<{ input: number[][]; output: number[][] }>;
}

async function fetchPuzzleList(
  dataset: "training" | "evaluation" = "training"
): Promise<string[]> {
  // Check cache
  if (puzzleListCache && Date.now() - puzzleListCache.timestamp < CACHE_TTL) {
    return puzzleListCache.files;
  }

  const response = await fetch(`${ARC_REPO_BASE}/${dataset}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "arc-agi-viewer",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const contents = (await response.json()) as Array<{
    name: string;
    type: string;
  }>;
  const files = contents
    .filter((item) => item.type === "file" && item.name.endsWith(".json"))
    .map((item) => item.name.replace(".json", ""));

  // Update cache
  puzzleListCache = { files, timestamp: Date.now() };

  return files;
}

async function fetchPuzzle(
  id: string,
  dataset: "training" | "evaluation" = "training"
): Promise<ArcPuzzle> {
  const response = await fetch(`${ARC_RAW_BASE}/${dataset}/${id}.json`);

  if (!response.ok) {
    throw new Error(`Puzzle not found: ${id}`);
  }

  return response.json() as Promise<ArcPuzzle>;
}

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // List puzzles with pagination
    "/api/puzzles": {
      async GET(req) {
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") ?? "1", 10);
        const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
        const dataset = (url.searchParams.get("dataset") ?? "training") as
          | "training"
          | "evaluation";

        try {
          const allFiles = await fetchPuzzleList(dataset);
          const totalCount = allFiles.length;
          const totalPages = Math.ceil(totalCount / limit);
          const offset = (page - 1) * limit;
          const files = allFiles.slice(offset, offset + limit);

          return Response.json({
            puzzles: files,
            pagination: {
              page,
              limit,
              totalCount,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1,
            },
          });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
          );
        }
      },
    },

    // Get a specific puzzle by ID
    "/api/puzzles/:id": async (req) => {
      const { id } = req.params;
      const url = new URL(req.url);
      const dataset = (url.searchParams.get("dataset") ?? "training") as
        | "training"
        | "evaluation";

      try {
        const puzzle = await fetchPuzzle(id, dataset);

        return Response.json({
          id,
          dataset,
          trainCount: puzzle.train.length,
          testCount: puzzle.test.length,
          train: puzzle.train,
          test: puzzle.test,
        });
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : "Unknown error" },
          { status: 404 }
        );
      }
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
