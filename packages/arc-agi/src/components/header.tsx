import type { ManifoldColorMode } from "./matrix";

type ViewMode = "matrix" | "manifold";
type ExampleType =
  | { kind: "train"; index: number }
  | { kind: "test"; index: number };

interface ExampleTab {
  label: string;
  type: ExampleType;
}

function PuzzleHeader({ puzzleId }: { puzzleId: string }) {
  return <h2 className="text-lg font-semibold font-mono">{puzzleId}</h2>;
}

function ExampleTabs({
  tabs,
  currentExample,
  onExampleSelect,
}: {
  tabs: ExampleTab[];
  currentExample: ExampleType;
  onExampleSelect: (example: ExampleType) => void;
}) {
  return (
    <nav className="flex gap-1">
      {tabs.map((tab, i) => {
        const isActive =
          currentExample.kind === tab.type.kind &&
          currentExample.index === tab.type.index;
        const isTest = tab.type.kind === "test";
        return (
          <button
            key={i}
            onClick={() => onExampleSelect(tab.type)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              isActive
                ? isTest
                  ? "bg-amber-600 text-white"
                  : "bg-blue-600 text-white"
                : isTest
                  ? "bg-zinc-800 text-amber-400 hover:bg-zinc-700"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function ColorModeToggle({
  colorMode,
  onColorModeChange,
}: {
  colorMode: ManifoldColorMode;
  onColorModeChange: (mode: ManifoldColorMode) => void;
}) {
  return (
    <div className="flex gap-1 bg-zinc-800 p-1 rounded-lg">
      <button
        onClick={() => onColorModeChange("rgb")}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          colorMode === "rgb"
            ? "bg-zinc-600 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        RGB
      </button>
      <button
        onClick={() => onColorModeChange("layer")}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          colorMode === "layer"
            ? "bg-zinc-600 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Layer
      </button>
    </div>
  );
}

function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex gap-1 bg-zinc-800 p-1 rounded-lg">
      <button
        onClick={() => onViewModeChange("matrix")}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          viewMode === "matrix"
            ? "bg-zinc-600 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Matrix
      </button>
      <button
        onClick={() => onViewModeChange("manifold")}
        className={`px-3 py-1 text-sm rounded transition-colors ${
          viewMode === "manifold"
            ? "bg-zinc-600 text-white"
            : "text-zinc-400 hover:text-white"
        }`}
      >
        Manifold
      </button>
    </div>
  );
}

export function Header({
  puzzleId,
  tabs,
  currentExample,
  viewMode,
  colorMode,
  onExampleSelect,
  onViewModeChange,
  onColorModeChange,
}: {
  puzzleId: string;
  tabs: ExampleTab[];
  currentExample: ExampleType;
  viewMode: ViewMode;
  colorMode: ManifoldColorMode;
  onExampleSelect: (example: ExampleType) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onColorModeChange: (mode: ManifoldColorMode) => void;
}) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
      <div className="flex items-center gap-4">
        <PuzzleHeader puzzleId={puzzleId} />
        <ExampleTabs
          tabs={tabs}
          currentExample={currentExample}
          onExampleSelect={onExampleSelect}
        />
      </div>
      <div className="flex items-center gap-3">
        {viewMode === "manifold" && (
          <ColorModeToggle
            colorMode={colorMode}
            onColorModeChange={onColorModeChange}
          />
        )}
        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      </div>
    </header>
  );
}

export type { ExampleTab, ExampleType, ViewMode };
