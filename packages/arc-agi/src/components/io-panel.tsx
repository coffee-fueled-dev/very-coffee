import { useRef } from "react";
import {
  DenseMatrix,
  Manifold,
  type ManifoldColorMode,
  type ManifoldHandle,
  type CameraPreset,
} from "./matrix";
import { AspectRatio } from "./ui/aspect-ratio";
import { ResizablePanel } from "./ui/resizable";

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
}: {
  data: number[][];
  viewMode: "matrix" | "manifold";
  label?: string;
  colorMode?: ManifoldColorMode;
}) => {
  const manifoldRef = useRef<ManifoldHandle>(null);

  return (
    <ResizablePanel defaultSize={50} minSize={20} className="overflow-y-auto">
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-zinc-400">{label}</p>
          {viewMode === "manifold" && (
            <div className="flex gap-1">
              {SNAP_BUTTONS.map(({ preset, label: btnLabel }) => (
                <button
                  key={preset}
                  onClick={() => manifoldRef.current?.snapTo(preset)}
                  className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  {btnLabel}
                </button>
              ))}
            </div>
          )}
        </div>

        {viewMode === "matrix" ? (
          <AspectRatio
            ratio={data.length / (data[0]?.length ?? 1)}
            className="bg-zinc-900 rounded-lg p-4"
          >
            <DenseMatrix
              data={data}
              fillContainer
              gap={2}
              className="max-w-full max-h-full aspect-square"
            />
          </AspectRatio>
        ) : (
          <Manifold
            ref={manifoldRef}
            data={data}
            className="w-full h-full bg-zinc-900 rounded-lg"
            colorMode={colorMode}
          />
        )}
      </div>
    </ResizablePanel>
  );
};
