import type { LatticeColorMode } from "./lattice";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type ViewMode = "matrix" | "lattice";
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

function exampleToValue(example: ExampleType): string {
  return `${example.kind}-${example.index}`;
}

function valueToExample(value: string): ExampleType {
  const [kind, indexStr] = value.split("-");
  return {
    kind: kind as "train" | "test",
    index: parseInt(indexStr ?? "0", 10),
  };
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
    <ToggleGroup
      type="single"
      value={exampleToValue(currentExample)}
      onValueChange={(value) => value && onExampleSelect(valueToExample(value))}
      variant="outline"
      size="sm"
    >
      {tabs.map((tab) => (
        <ToggleGroupItem
          key={exampleToValue(tab.type)}
          value={exampleToValue(tab.type)}
        >
          {tab.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function ColorModeToggle({
  colorMode,
  onColorModeChange,
}: {
  colorMode: LatticeColorMode;
  onColorModeChange: (mode: LatticeColorMode) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={colorMode}
      onValueChange={(value) =>
        value && onColorModeChange(value as LatticeColorMode)
      }
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="rgb">RGB</ToggleGroupItem>
      <ToggleGroupItem value="layer">Layer</ToggleGroupItem>
    </ToggleGroup>
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
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="matrix">Matrix</ToggleGroupItem>
      <ToggleGroupItem value="lattice">Lattice</ToggleGroupItem>
    </ToggleGroup>
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
  colorMode: LatticeColorMode;
  onExampleSelect: (example: ExampleType) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onColorModeChange: (mode: LatticeColorMode) => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 border-b shrink-0 h-[81px]">
      <div className="flex items-center gap-4">
        <PuzzleHeader puzzleId={puzzleId} />
        <ExampleTabs
          tabs={tabs}
          currentExample={currentExample}
          onExampleSelect={onExampleSelect}
        />
      </div>
      <div className="flex items-center gap-3">
        {viewMode === "lattice" && (
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
