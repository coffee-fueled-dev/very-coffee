import { COLOR_PALETTE } from "./lattice";

function mapColor(value: number): string {
  return COLOR_PALETTE[Math.max(0, Math.min(9, value))] ?? COLOR_PALETTE[0];
}

export const DenseMatrix = ({
  data,
  cellSize,
  gap = 2,
  className,
  fillContainer = false,
}: {
  data: number[][];
  cellSize?: number;
  gap?: number;
  className?: string;
  fillContainer?: boolean;
}) => {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  // If fillContainer, use CSS grid with fr units
  if (fillContainer) {
    return (
      <div
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap,
          width: "100%",
          height: "100%",
          minHeight: 100,
          minWidth: 100,
        }}
      >
        {data.flatMap((row, i) =>
          row.map((value, j) => (
            <div
              key={`${i}-${j}`}
              className="rounded-sm aspect-square"
              style={{
                backgroundColor: mapColor(value),
              }}
            />
          ))
        )}
      </div>
    );
  }

  // Fixed size mode
  const size = cellSize ?? 20;
  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap }}
    >
      {data.map((row, i) => (
        <div key={i} style={{ display: "flex", gap }}>
          {row.map((value, j) => (
            <div
              key={j}
              style={{
                width: size,
                height: size,
                backgroundColor: mapColor(value),
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
