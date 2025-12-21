import "./index.css";
import { useState, useEffect } from "react";
import type { LatticeColorMode } from "./components/lattice";
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
import { PuzzleProvider, usePuzzles } from "./context/puzzles";

function PuzzleViewer() {
  const { selectedPuzzle } = usePuzzles();
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");
  const [colorMode, setColorMode] = useState<LatticeColorMode>("layer");
  const [currentExample, setCurrentExample] = useState<ExampleType>({
    kind: "train",
    index: 0,
  });

  // Reset to first training example when puzzle changes
  useEffect(() => {
    setCurrentExample({ kind: "train", index: 0 });
  }, [selectedPuzzle?.id]);

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

  if (!selectedPuzzle) {
    return (
      <div className="h-full flex items-center justify-center">
        Select a puzzle from the sidebar
      </div>
    );
  }

  return (
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
          className="flex-1 min-h-0 p-2 bg-muted-foreground/10"
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
              currentExample.kind === "test" ? "Expected Output" : "Output"
            }
            colorMode={colorMode}
            obfuscate={currentExample.kind === "test"}
          />
        </ResizablePanelGroup>
      )}
    </>
  );
}

export function App() {
  return (
    <PuzzleProvider>
      <div className="h-screen w-full flex">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <PuzzleViewer />
        </main>
      </div>
    </PuzzleProvider>
  );
}

export default App;
