import {
  FileProvider,
  useUploadedFiles,
} from "@/components/blocks/file-upload";
import { FileUpload } from "@/components/blocks/file-upload/file-upload";
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
import { lazy, memo, Suspense, useState } from "react";
import { TrendingUp } from "lucide-react";
import { InlineDemo } from "@/components/blocks/inline-demo";
import { AnimatePresence, motion } from "motion/react";
import { Loader } from "@/components/blocks/loader";

import tinystories_100 from "./tinystories_100.txt";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/blocks/external-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyButton } from "@/components/blocks/copy-button";

const FILE_LIMIT = 5;
const MAX_FILE_SIZE = 1 * 1024 * 1024;
const SUPPORTED_FILE_TYPES = {
  "text/plain": [".txt"],
  "text/md": [".md"],
  "text/csv": [".csv"],
  "text/xml": [".xml"],
};

const SAMPLE_FILE_GH_LINK =
  "https://github.com/coffee-fueled-dev/very-coffee/blob/main/packages/app/src/blog/tkn/pattern-confidence/demos/tinystories_100.txt?raw=true";

type PatternWithScore = { pattern: string; confidence: number };

export const PatternConfidenceDemo = () => (
  <InlineDemo
    title="TKN Pattern Confidence Demo"
    description="Upload text files to see how the tkn algorithm discovers patterns and their confidence scores."
  >
    <FileProvider>
      <FileForm />
    </FileProvider>
  </InlineDemo>
);

const FileForm = () => {
  const demoFile = new File([tinystories_100], "tinystories_100.txt", {
    type: "text/plain",
  });
  const [demoFiles, setDemoFiles] = useState<File[]>([]);
  const { files } = useUploadedFiles();
  const filesToUse = demoFiles.length > 0 ? demoFiles : files;
  const FileResults = getFileResults(filesToUse);

  const handleUseDemoFile = () => {
    setDemoFiles([demoFile]);
  };

  return (
    <section className="flex flex-col gap-4">
      <FileUpload
        placeholder={`Upload up to ${FILE_LIMIT} text files`}
        supportedFileTypes={SUPPORTED_FILE_TYPES}
        maxFiles={FILE_LIMIT}
        maxFileSize={MAX_FILE_SIZE}
      />
      <span className="flex justify-start items-center gap-2">
        <Button variant="secondary" onClick={handleUseDemoFile}>
          Use sample file (100 tinystories)
        </Button>
        <ExternalLink href={SAMPLE_FILE_GH_LINK}>
          Read sample file on GitHub
        </ExternalLink>
      </span>
      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <Loader
              task="Processing files"
              feature={filesToUse.length.toString()}
            />
          }
        >
          <FileResults />
        </Suspense>
      </AnimatePresence>
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

const FileResults = ({ topTokens }: { topTokens: PatternWithScore[] }) => {
  return (
    topTokens.length > 0 && (
      <motion.div
        key="file-results"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top Patterns by Confidence ({topTokens.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topTokens.length === 0 ? (
              <EmptyPatterns />
            ) : (
              <Patterns topTokens={topTokens} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  );
};

const EmptyPatterns = () => (
  <Empty className="border rounded-lg py-12">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <TrendingUp className="size-10" />
      </EmptyMedia>
      <EmptyTitle>No patterns found</EmptyTitle>
      <EmptyDescription>Upload files to analyze patterns</EmptyDescription>
    </EmptyHeader>
  </Empty>
);

const Patterns = ({ topTokens }: { topTokens: PatternWithScore[] }) => {
  return (
    <Tabs defaultValue="formatted">
      <span className="flex justify-between items-center gap-2">
        <TabsList>
          <TabsTrigger value="formatted">Formatted</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>
        <CopyButton
          content={JSON.stringify(topTokens, null, 2)}
          label="Copy results"
        />
      </span>
      <ScrollArea className="h-[400px]">
        <TabsContent value="formatted">
          <div className="flex flex-col gap-3 p-4">
            {topTokens.map((token, idx) => (
              <ConfidenceBadge
                key={`${token.pattern}-${idx}`}
                token={token.pattern}
                score={token.confidence}
                rank={idx + 1}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="raw">
          <pre>{JSON.stringify(topTokens, null, 2)}</pre>
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

const getFileResults = (files: File[]) =>
  lazy(async () => {
    if (files.length === 0) return { default: () => <></> };
    // Small delay to ensure Suspense fallback renders
    await new Promise((resolve) => setTimeout(resolve, 100));
    const topTokens = await processFiles(files);
    return { default: () => <FileResults topTokens={topTokens} /> };
  });

const processFiles = async (files: File[]): Promise<PatternWithScore[]> => {
  if (files.length === 0) return [];

  const sequencer = createLZSequencer();
  const lattice = new Lattice({
    scorer: new DegreeScorer(),
  });

  // Start piping sequencer output to lattice (runs in background)
  const waitForPatternIngestion = lattice.pipe(sequencer.read());

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

  return sequencer
    .close()
    .then(() => waitForPatternIngestion)
    .then(() => lattice.getTopTokens(50));
};
