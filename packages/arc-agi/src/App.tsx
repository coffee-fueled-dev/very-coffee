import "./index.css";
import { useState, useEffect } from "react";
import type { ManifoldColorMode } from "./components/matrix";
import {
  ResizablePanelGroup,
  ResizableHandle,
} from "./components/ui/resizable";
import { IOPanel } from "./components/io-panel";
import { Sidebar } from "./components/sidebar";
import {
  Header,
  type ViewMode,
  type ExampleType,
  type ExampleTab,
} from "./components/header";

interface Puzzle {
  id: string;
  train: Array<{ input: number[][]; output: number[][] }>;
  test: Array<{ input: number[][]; output: number[][] }>;
}

interface PuzzleListResponse {
  puzzles: string[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function App() {
  const [puzzleList, setPuzzleList] = useState<PuzzleListResponse | null>(null);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [colorMode, setColorMode] = useState<ManifoldColorMode>("rgb");
  const [currentExample, setCurrentExample] = useState<ExampleType>({
    kind: "train",
    index: 0,
  });

  // Fetch puzzle list
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/puzzles?page=${page}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        setPuzzleList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [page]);

  // Fetch selected puzzle
  const loadPuzzle = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/puzzles/${id}`);
      const data = await res.json();
      setSelectedPuzzle(data);
      setCurrentExample({ kind: "train", index: 0 }); // Reset to first training example
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load puzzle");
    }
    setLoading(false);
  };

  // Get current example data
  const getCurrentExample = () => {
    if (!selectedPuzzle) return null;
    if (currentExample.kind === "train") {
      return selectedPuzzle.train[currentExample.index];
    }
    return selectedPuzzle.test[currentExample.index];
  };

  // Build list of all examples for navigation
  const getExampleTabs = (): ExampleTab[] => {
    if (!selectedPuzzle) return [];
    const tabs: ExampleTab[] = [];
    selectedPuzzle.train.forEach((_, i) => {
      tabs.push({ label: `Train ${i + 1}`, type: { kind: "train", index: i } });
    });
    selectedPuzzle.test.forEach((_, i) => {
      tabs.push({ label: `Test ${i + 1}`, type: { kind: "test", index: i } });
    });
    return tabs;
  };

  const example = getCurrentExample();
  const tabs = getExampleTabs();

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex">
      <Sidebar
        puzzleList={puzzleList}
        loading={loading}
        error={error}
        selectedPuzzle={selectedPuzzle}
        onPuzzleSelect={loadPuzzle}
        onPageChange={(delta) => setPage((p) => p + delta)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {!selectedPuzzle ? (
          <div className="h-full flex items-center justify-center text-zinc-500">
            Select a puzzle from the sidebar
          </div>
        ) : (
          <>
            <Header
              puzzleId={selectedPuzzle.id}
              tabs={tabs}
              currentExample={currentExample}
              viewMode={viewMode}
              colorMode={colorMode}
              onExampleSelect={setCurrentExample}
              onViewModeChange={setViewMode}
              onColorModeChange={setColorMode}
            />

            {example && (
              <ResizablePanelGroup
                direction="horizontal"
                className="flex-1 min-h-0"
              >
                <IOPanel
                  data={example.input}
                  viewMode={viewMode}
                  label="Input"
                  colorMode={colorMode}
                />

                <ResizableHandle withHandle />

                <IOPanel
                  data={example.output}
                  viewMode={viewMode}
                  label={
                    currentExample.kind === "test"
                      ? "Expected Output"
                      : "Output"
                  }
                  colorMode={colorMode}
                />
              </ResizablePanelGroup>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
