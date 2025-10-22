import {
  FileProvider,
  useUploadedFiles,
} from "@/components/blocks/file-upload";
import { FileUpload } from "@/components/blocks/file-upload/file-upload";
import { FullscreenSpinner } from "@/components/blocks/fullscreen-spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { createLZSequencer, Unicode } from "@very-coffee/tkn";
import { Lattice, DegreeScorer } from "@very-coffee/tkn";
import { lazy, Suspense, memo } from "react";
import { TrendingUp } from "lucide-react";

const FILE_LIMIT = 5;
const MAX_FILE_SIZE = 1 * 1024 * 1024;
const SUPPORTED_FILE_TYPES = {
  "text/plain": [".txt"],
  "text/md": [".md"],
  "text/csv": [".csv"],
  "text/xml": [".xml"],
};

export const PatternConfidenceDemo = () => (
  <FileProvider>
    <FileForm />
  </FileProvider>
);

const FileForm = () => {
  const { files } = useUploadedFiles();
  const FileResults = getFileResults(files);
  return (
    <section className="flex flex-col gap-4">
      <FileUpload
        placeholder={`Upload up to ${FILE_LIMIT} text files`}
        supportedFileTypes={SUPPORTED_FILE_TYPES}
        maxFiles={FILE_LIMIT}
        maxFileSize={MAX_FILE_SIZE}
      />
      <Suspense
        fallback={
          <FullscreenSpinner
            task="Processing files"
            feature={files.length.toString()}
          />
        }
      >
        <FileResults />
      </Suspense>
    </section>
  );
};

const ConfidenceBadge = memo(
  ({ token, score, rank }: { token: string; score: number; rank: number }) => {
    const displayToken = token
      .replace(/ /g, "·")
      .replace(/\n/g, "↵")
      .replace(/\t/g, "→");

    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-sm">
          {rank}
        </Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="font-mono cursor-help">
              {displayToken}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <div>Raw: {JSON.stringify(token)}</div>
              <div>Length: {token.length}</div>
            </div>
          </TooltipContent>
        </Tooltip>
        <span className="text-sm text-muted-foreground">
          {score.toFixed(3)}
        </span>
      </div>
    );
  }
);
ConfidenceBadge.displayName = "ConfidenceBadge";

const FileResults = ({ topPatterns }: { topPatterns: PatternWithScore[] }) => {
  if (topPatterns.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Top Patterns by Confidence ({topPatterns.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topPatterns.length === 0 ? (
          <Empty className="border rounded-lg py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TrendingUp className="size-10" />
              </EmptyMedia>
              <EmptyTitle>No patterns found</EmptyTitle>
              <EmptyDescription>
                Upload files to analyze patterns
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="flex flex-col gap-3 p-4">
              {topPatterns.map((pattern, idx) => (
                <ConfidenceBadge
                  key={`${pattern.token}-${idx}`}
                  token={pattern.token}
                  score={pattern.hubScore}
                  rank={idx + 1}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

type PatternWithScore = { token: string; hubScore: number };

const getFileResults = (files: File[]) =>
  lazy(async () => {
    // Small delay to ensure Suspense fallback renders
    await new Promise((resolve) => setTimeout(resolve, 100));
    const topPatterns = await processFiles(files);
    return { default: () => <FileResults topPatterns={topPatterns} /> };
  });

const processFiles = async (files: File[]): Promise<PatternWithScore[]> => {
  if (files.length === 0) return [];

  // Create sequencer and lattice with degree-based scoring (fast, non-blocking)
  const sequencer = createLZSequencer();
  const lattice = new Lattice({
    scorer: new DegreeScorer(),
  });

  // Start piping sequencer output to lattice (runs in background)
  const pipePromise = lattice.pipe(sequencer.read());

  // Stream each file through the sequencer
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Push a file sentinel if this is the end of a file
    if (i > 0) {
      sequencer.push("<FILE_SEPARATOR>");
    }

    for await (const char of Unicode.streamFile(file)) {
      sequencer.push(char);
    }
  }

  // Close the sequencer (flushes and signals readers that no more data is coming)
  await sequencer.close();

  // Wait for pipe to complete processing all sequences
  await pipePromise;

  // Get top patterns by hub score
  return lattice.getTopTokens(50);
};
