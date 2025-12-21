import { useEffect, useRef } from "react";
import { usePuzzles } from "../context/puzzles";

function SidebarHeader() {
  const { totalCount, puzzleIds } = usePuzzles();

  return (
    <header className="p-4 border-b border-zinc-800">
      <h1 className="text-lg font-semibold">ARC-AGI</h1>
      <p className="text-xs text-zinc-500 mt-1">
        {puzzleIds.length} / {totalCount || "..."} puzzles
      </p>
    </header>
  );
}

function PuzzleList() {
  const {
    puzzleIds,
    hasMore,
    listLoading,
    listError,
    loadMore,
    selectedPuzzle,
    selectPuzzle,
  } = usePuzzles();

  const loaderRef = useRef<HTMLDivElement>(null);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="flex-1 overflow-y-auto">
      {listError && <p className="p-4 text-red-400 text-sm">{listError}</p>}

      {puzzleIds.map((id) => (
        <button
          key={id}
          onClick={() => selectPuzzle(id)}
          className={`w-full px-4 py-2 text-left text-sm font-mono transition-colors ${
            selectedPuzzle?.id === id
              ? "bg-zinc-800 text-white"
              : "text-zinc-400"
          }`}
        >
          {id}
        </button>
      ))}

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} className="p-2 text-center">
        {listLoading && <span className="text-xs">Loading...</span>}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-56 border-r flex flex-col shrink-0">
      <SidebarHeader />
      <PuzzleList />
    </aside>
  );
}
