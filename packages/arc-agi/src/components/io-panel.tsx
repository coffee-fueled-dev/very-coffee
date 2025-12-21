import { useRef, useState } from "react";
import { DenseMatrix } from "./matrix";
import {
  Lattice,
  type LatticeColorMode,
  type LatticeHandle,
  type CameraPreset,
} from "./lattice";
import { ResizablePanel } from "./ui/resizable";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "./ui/button";

const SNAP_BUTTONS: Array<{ preset: CameraPreset; label: string }> = [
  { preset: "isometric", label: "Iso" },
  { preset: "top", label: "Top" },
  { preset: "front", label: "Front" },
  { preset: "right", label: "Right" },
];

export const IOPanel = ({
  data,
  viewMode,
  label = "Input",
  colorMode = "rgb",
  obfuscate = false,
}: {
  data: number[][];
  viewMode: "matrix" | "lattice";
  label?: string;
  colorMode?: LatticeColorMode;
  obfuscate?: boolean;
}) => {
  const latticeRef = useRef<LatticeHandle>(null);
  const [revealed, setRevealed] = useState(false);

  const isBlurred = obfuscate && !revealed;

  return (
    <ResizablePanel
      defaultSize={50}
      minSize={20}
      className="overflow-y-auto relative"
    >
      {/* Reveal hint overlay */}
      {isBlurred && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="rounded-full p-4">
            <EyeIcon className="w-8 h-8" />
          </div>
        </div>
      )}
      <div
        className="h-full flex flex-col p-2"
        onClick={() => obfuscate && !revealed && setRevealed(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">{label}</p>
          {(viewMode === "lattice" || obfuscate) && (
            <div className="flex gap-1">
              {obfuscate && (
                <Button
                  onClick={() => setRevealed(!revealed)}
                  variant="secondary"
                  size="sm"
                >
                  {revealed ? (
                    <>
                      <EyeOffIcon className="w-4 h-4" /> Hide
                    </>
                  ) : (
                    <>
                      <EyeIcon className="w-4 h-4" /> Show
                    </>
                  )}
                </Button>
              )}
              {viewMode === "lattice" &&
                SNAP_BUTTONS.map(({ preset, label: btnLabel }) => (
                  <Button
                    key={preset}
                    onClick={() => latticeRef.current?.snapTo(preset)}
                    variant="secondary"
                    size="sm"
                  >
                    {btnLabel}
                  </Button>
                ))}
            </div>
          )}
        </div>

        <div className="flex-1 rounded-lg overflow-hidden relative">
          <div
            className="h-full"
            style={{
              filter: isBlurred ? "blur(3rem)" : "none",
              transition: "filter 0.2s ease-out",
              maskImage: isBlurred
                ? "radial-gradient(ellipse 88% 88% at center, black 55%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.1) 92%, transparent 100%)"
                : "none",
              WebkitMaskImage: isBlurred
                ? "radial-gradient(ellipse 88% 88% at center, black 55%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.1) 92%, transparent 100%)"
                : "none",
            }}
          >
            {viewMode === "matrix" ? (
              <div
                className="flex items-center justify-center overflow-hidden min-h-0 min-w-0 rounded-lg bg-card h-full"
                style={{ containerType: "size" }}
              >
                <div
                  className="p-4"
                  style={{
                    // Use container queries for true "contain" fit
                    // Pick the smaller of: full width, or height-based width
                    width: `min(100cqw, 100cqh * ${(data[0]?.length ?? 1) / data.length})`,
                    height: `min(100cqh, 100cqw * ${data.length / (data[0]?.length ?? 1)})`,
                  }}
                >
                  <DenseMatrix
                    data={data}
                    fillContainer
                    gap={2}
                    className="w-full h-full"
                  />
                </div>
              </div>
            ) : (
              <Lattice
                ref={latticeRef}
                data={data}
                className="w-full h-full rounded-lg bg-card"
                colorMode={colorMode}
              />
            )}
          </div>
          {/* Soft edge overlay */}
          {isBlurred && (
            <div
              className="absolute inset-0 pointer-events-none rounded-lg"
              style={{
                background:
                  "radial-gradient(ellipse 88% 88% at center, transparent 55%, rgba(0,0,0,0.05) 80%, rgba(0,0,0,0.15) 92%, rgba(0,0,0,0.3) 100%)",
              }}
            />
          )}
        </div>
      </div>
    </ResizablePanel>
  );
};
