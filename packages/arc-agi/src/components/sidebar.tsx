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

interface Puzzle {
  id: string;
}

function SidebarHeader({
  puzzleList,
}: {
  puzzleList: PuzzleListResponse | null;
}) {
  return (
    <header className="p-4 border-b border-zinc-800">
      <h1 className="text-lg font-semibold">ARC-AGI</h1>
      {puzzleList && (
        <p className="text-xs text-zinc-500 mt-1">
          {puzzleList.pagination.totalCount} puzzles
        </p>
      )}
    </header>
  );
}

function PuzzleList({
  puzzleList,
  loading,
  error,
  selectedPuzzle,
  onPuzzleSelect,
}: {
  puzzleList: PuzzleListResponse | null;
  loading: boolean;
  error: string | null;
  selectedPuzzle: Puzzle | null;
  onPuzzleSelect: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {loading && !puzzleList && (
        <p className="p-4 text-zinc-500">Loading...</p>
      )}
      {error && <p className="p-4 text-red-400 text-sm">{error}</p>}
      {puzzleList?.puzzles.map((id) => (
        <button
          key={id}
          onClick={() => onPuzzleSelect(id)}
          className={`w-full px-4 py-2 text-left text-sm font-mono hover:bg-zinc-800 transition-colors ${
            selectedPuzzle?.id === id
              ? "bg-zinc-800 text-white"
              : "text-zinc-400"
          }`}
        >
          {id}
        </button>
      ))}
    </div>
  );
}

function Pagination({
  puzzleList,
  onPageChange,
}: {
  puzzleList: PuzzleListResponse | null;
  onPageChange: (delta: number) => void;
}) {
  if (!puzzleList) return null;

  return (
    <footer className="p-3 border-t border-zinc-800 flex items-center justify-between">
      <button
        onClick={() => onPageChange(-1)}
        disabled={!puzzleList.pagination.hasPrev}
        className="px-2 py-1 text-xs bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700"
      >
        ←
      </button>
      <span className="text-xs text-zinc-500">
        {puzzleList.pagination.page}/{puzzleList.pagination.totalPages}
      </span>
      <button
        onClick={() => onPageChange(1)}
        disabled={!puzzleList.pagination.hasNext}
        className="px-2 py-1 text-xs bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700"
      >
        →
      </button>
    </footer>
  );
}

export function Sidebar({
  puzzleList,
  loading,
  error,
  selectedPuzzle,
  onPuzzleSelect,
  onPageChange,
}: {
  puzzleList: PuzzleListResponse | null;
  loading: boolean;
  error: string | null;
  selectedPuzzle: Puzzle | null;
  onPuzzleSelect: (id: string) => void;
  onPageChange: (delta: number) => void;
}) {
  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
      <SidebarHeader puzzleList={puzzleList} />
      <PuzzleList
        puzzleList={puzzleList}
        loading={loading}
        error={error}
        selectedPuzzle={selectedPuzzle}
        onPuzzleSelect={onPuzzleSelect}
      />
      <Pagination puzzleList={puzzleList} onPageChange={onPageChange} />
    </aside>
  );
}
