import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

export interface Puzzle {
  id: string;
  train: Array<{ input: number[][]; output: number[][] }>;
  test: Array<{ input: number[][]; output: number[][] }>;
}

interface PuzzleListState {
  puzzleIds: string[];
  hasMore: boolean;
  totalCount: number;
}

interface PuzzleContextValue {
  // List state
  puzzleIds: string[];
  hasMore: boolean;
  totalCount: number;
  listLoading: boolean;
  listError: string | null;
  loadMore: () => Promise<void>;

  // Selected puzzle state
  selectedPuzzle: Puzzle | null;
  puzzleLoading: boolean;
  puzzleError: string | null;
  selectPuzzle: (id: string) => Promise<void>;
}

const PuzzleContext = createContext<PuzzleContextValue | null>(null);

const PAGE_SIZE = 50;

export function PuzzleProvider({ children }: { children: ReactNode }) {
  // List state
  const [listState, setListState] = useState<PuzzleListState>({
    puzzleIds: [],
    hasMore: true,
    totalCount: 0,
  });
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Use refs to prevent race conditions
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  // Selected puzzle state
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [puzzleLoading, setPuzzleLoading] = useState(false);
  const [puzzleError, setPuzzleError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    // Use refs to check loading state to avoid stale closures
    if (loadingRef.current) return;

    loadingRef.current = true;
    setListLoading(true);
    setListError(null);

    try {
      const nextPage = pageRef.current + 1;
      const res = await fetch(
        `/api/puzzles?page=${nextPage}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();

      pageRef.current = nextPage;

      setListState((prev) => {
        // Deduplicate by using a Set
        const existingIds = new Set(prev.puzzleIds);
        const newIds = (data.puzzles as string[]).filter(
          (id) => !existingIds.has(id)
        );
        return {
          puzzleIds: [...prev.puzzleIds, ...newIds],
          hasMore: data.pagination.hasNext,
          totalCount: data.pagination.totalCount,
        };
      });
    } catch (err) {
      setListError(
        err instanceof Error ? err.message : "Failed to load puzzles"
      );
    } finally {
      loadingRef.current = false;
      setListLoading(false);
    }
  }, []);

  const selectPuzzle = useCallback(async (id: string) => {
    setPuzzleLoading(true);
    setPuzzleError(null);

    try {
      const res = await fetch(`/api/puzzles/${id}`);
      const data = await res.json();
      setSelectedPuzzle(data);
    } catch (err) {
      setPuzzleError(err instanceof Error ? err.message : "Failed to load puzzle");
    } finally {
      setPuzzleLoading(false);
    }
  }, []);

  return (
    <PuzzleContext.Provider
      value={{
        puzzleIds: listState.puzzleIds,
        hasMore: listState.hasMore,
        totalCount: listState.totalCount,
        listLoading,
        listError,
        loadMore,
        selectedPuzzle,
        puzzleLoading,
        puzzleError,
        selectPuzzle,
      }}
    >
      {children}
    </PuzzleContext.Provider>
  );
}

export function usePuzzles() {
  const ctx = useContext(PuzzleContext);
  if (!ctx) {
    throw new Error("usePuzzles must be used within a PuzzleProvider");
  }
  return ctx;
}

