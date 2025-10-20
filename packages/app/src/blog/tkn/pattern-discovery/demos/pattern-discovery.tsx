import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLZSequencer } from "@/hooks/useLZSequencer";
import { memo, useEffect, useRef, useState } from "react";
import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SequencerOutput } from "@very-coffee/tkn";
import { Card, CardContent } from "@/components/ui/card";
import { InlineDemo } from "@/components/blocks/inline-demo";

const PatternBadge = memo(({ pattern }: { pattern: SequencerOutput }) => (
  <Badge variant="secondary">{pattern.key}</Badge>
));
PatternBadge.displayName = "PatternBadge";

export const PatternDiscoveryDemo = () => {
  const { push, flush, startReader, reset, history } = useLZSequencer();
  const [text, setText] = useState("");
  const [isReaderStarted, setIsReaderStarted] = useState(false);
  const previousTextRef = useRef("");

  // Start the reader once on mount
  useEffect(() => {
    if (!isReaderStarted) {
      void startReader();
      setIsReaderStarted(true);
    }
  }, [isReaderStarted, startReader]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      // Push backspace sentinel
      push("<BACKSPACE>"); // ASCII code for backspace
    } else if (e.key === "Delete") {
      // Push delete sentinel
      push("<DELETE>"); // ASCII code for delete
    } else if (e.key === "Enter") {
      // Push enter sentinel
      push("<ENTER>"); // ASCII code for enter
    } else if (e.key === "Tab") {
      // Push tab sentinel
      push("<TAB>"); // ASCII code for tab
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);

    // Find new characters added
    const previousText = previousTextRef.current;
    if (value.length > previousText.length) {
      // Characters were added
      const newChars = value.slice(previousText.length);
      for (const char of newChars) {
        push(char);
      }
    } else if (value.length === 0 && previousText.length > 0) {
      // Text was cleared
      reset(false);
    }

    previousTextRef.current = value;
  };

  const handleClear = () => {
    setText("");
    previousTextRef.current = "";
    reset(false);
  };

  const handleFlush = () => {
    flush();
  };

  return (
    <InlineDemo
      title="TKN Pattern Discovery Demo"
      description="Type in the text area below to see real-time pattern discovery using the tkn algorithm."
    >
      <div className="space-y-6">
        <div className="grid w-full gap-3">
          <Textarea
            placeholder="Type your text here..."
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleFlush} variant="outline" size="sm">
              Flush Buffer
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              disabled={text.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-3">
            Patterns {history.length > 0 && `(${history.length})`}
          </h4>
          {history.length === 0 ? (
            <Empty className="border rounded-lg py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Layers className="size-10" />
                </EmptyMedia>
                <EmptyTitle>No patterns yet</EmptyTitle>
                <EmptyDescription>
                  Start typing to see how the tkn algorithm learns patterns from
                  your input
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Card className="py-0">
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="flex flex-wrap gap-2 p-4 items-center">
                    {history.map((pattern, idx) => (
                      <PatternBadge key={idx} pattern={pattern} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </InlineDemo>
  );
};
