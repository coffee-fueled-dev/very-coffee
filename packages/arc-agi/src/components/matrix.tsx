import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useEffect,
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/**
 * Muted color palette for ARC-AGI values 0-9
 * 0 = background (dark), 1-9 = distinct muted colors
 */
const COLOR_PALETTE = [
  "#353B3C", // 0: Gunmetal
  "#3772FF", // 1: Crayola Blue
  "#FFCF9C", // 2: Apricot Cream
  "#06B178", // 3: Jungle Green
  "#EF3054", // 4: Watermelon
  "#BAA5FF", // 5: Mauve
  "#73FBD3", // 6: Aquamarine
  "#09725F", // 7: Blue Spruce
  "#A12B6A", // 8: Berry Blush
  "#5C7299", // 9: Glaucous
] as const;

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
              style={{
                backgroundColor: mapColor(value),
                borderRadius: 2,
                aspectRatio: "1",
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

interface LatticeCell {
  x: number;
  y: number;
  z: number;
  occupied: boolean;
  color: [number, number, number]; // RGB normalized by position
}

/**
 * Build a full 3D lattice (width × height × 9)
 * Each cell is marked as occupied if data[y][x] === z
 * Color is interpolated by axis position: R=x, G=y, B=z
 */
function buildLattice(data: number[][]): {
  cells: LatticeCell[];
  width: number;
  height: number;
  depth: number;
} {
  const cells: LatticeCell[] = [];
  const gridHeight = data.length;
  const gridWidth = data[0]?.length ?? 0;
  const depth = 9; // Color values 1-9

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const cellValue = data[y]?.[x] ?? 0;

      // Create a sphere for each depth layer (1-9)
      for (let z = 1; z <= depth; z++) {
        const occupied = cellValue === z;

        // Normalize positions to 0-1 for color interpolation
        const r = gridWidth > 1 ? x / (gridWidth - 1) : 0.5;
        const g = gridHeight > 1 ? y / (gridHeight - 1) : 0.5;
        const b = z / depth;

        cells.push({
          x,
          y,
          z,
          occupied,
          color: [r, g, b],
        });
      }
    }
  }

  return { cells, width: gridWidth, height: gridHeight, depth };
}

const OCCUPIED_RADIUS = 0.3;
const UNOCCUPIED_RADIUS = 0.12;
const MUTED_SPHERE_COLOR = "#494A45";

export type ManifoldColorMode = "rgb" | "gradient" | "layer";

// Camera preset angles (azimuth, polar) in radians
export const CAMERA_PRESETS = {
  isometric: { azimuth: Math.PI / 4, polar: Math.atan(1 / Math.sqrt(2)) },
  top: { azimuth: 0, polar: 0.01 }, // Slightly off to avoid gimbal lock
  front: { azimuth: 0, polar: Math.PI / 2 },
  right: { azimuth: Math.PI / 2, polar: Math.PI / 2 },
} as const;

export type CameraPreset = keyof typeof CAMERA_PRESETS;

export interface ManifoldHandle {
  snapTo: (preset: CameraPreset) => void;
}

function getOccupiedColor(
  cell: LatticeCell,
  colorMode: ManifoldColorMode
): string {
  switch (colorMode) {
    case "gradient":
      // Use the center color for this layer (x=0.5, y=0.5 in normalized coordinates)
      // This locks all cells in the same z-layer to the same color
      const centerR = 0.5;
      const centerG = 0.5;
      const b = cell.color[2]; // z is already normalized (z/depth)
      return `rgb(${Math.round(centerR * 255)}, ${Math.round(centerG * 255)}, ${Math.round(b * 255)})`;
    case "layer":
      return COLOR_PALETTE[cell.z] ?? COLOR_PALETTE[0];
    case "rgb":
      return `rgb(${Math.round(cell.color[0] * 255)}, ${Math.round(cell.color[1] * 255)}, ${Math.round(cell.color[2] * 255)})`;
    default:
      return COLOR_PALETTE[0];
  }
}

function LatticeSphere({
  cell,
  offsetX,
  offsetY,
  offsetZ,
  colorMode,
}: {
  cell: LatticeCell;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  colorMode: ManifoldColorMode;
}) {
  const radius = cell.occupied ? OCCUPIED_RADIUS : UNOCCUPIED_RADIUS;
  const color = cell.occupied
    ? getOccupiedColor(cell, colorMode)
    : COLOR_PALETTE[0];

  return (
    <mesh position={[cell.x - offsetX, -(cell.y - offsetY), cell.z - offsetZ]}>
      <sphereGeometry
        args={[radius, cell.occupied ? 8 : 4, cell.occupied ? 8 : 4]}
      />
      {cell.occupied ? (
        <meshStandardMaterial color={color} />
      ) : (
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      )}
    </mesh>
  );
}

function ManifoldScene({
  data,
  colorMode,
}: {
  data: number[][];
  colorMode: ManifoldColorMode;
}) {
  const { cells, width, height, depth } = useMemo(
    () => buildLattice(data),
    [data]
  );

  // Center offsets
  const offsetX = (width - 1) / 2;
  const offsetY = (height - 1) / 2;
  const offsetZ = (depth + 1) / 2; // Center around middle of 1-9

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight position={[15, 15, 15]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={1} />

      {cells.map((cell) => (
        <LatticeSphere
          key={`${cell.x}-${cell.y}-${cell.z}`}
          cell={cell}
          offsetX={offsetX}
          offsetY={offsetY}
          offsetZ={offsetZ}
          colorMode={colorMode}
        />
      ))}
    </>
  );
}

function CameraController({
  controlsRef,
  distance,
  onSnapReady,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  distance: number;
  onSnapReady: (fn: (preset: CameraPreset) => void) => void;
}) {
  const { camera } = useThree();

  const snapTo = useCallback(
    (preset: CameraPreset) => {
      const { azimuth, polar } = CAMERA_PRESETS[preset];

      // Calculate new camera position from spherical coordinates
      const x = distance * Math.sin(polar) * Math.sin(azimuth);
      const y = distance * Math.cos(polar);
      const z = distance * Math.sin(polar) * Math.cos(azimuth);

      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    },
    [camera, distance, controlsRef]
  );

  // Register the snap function with the parent
  useEffect(() => {
    onSnapReady(snapTo);
  }, [snapTo, onSnapReady]);

  return null;
}

export const Manifold = forwardRef<
  ManifoldHandle,
  {
    data: number[][];
    className?: string;
    colorMode?: ManifoldColorMode;
  }
>(({ data, className, colorMode = "rgb" }, ref) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const snapFnRef = useRef<((preset: CameraPreset) => void) | null>(null);

  const gridWidth = data[0]?.length ?? 0;
  const gridHeight = data.length;
  const depth = 9;

  // Calculate zoom to fit the scene (base zoom, will be adjusted by canvas size)
  const maxExtent = Math.max(gridWidth, gridHeight, depth);
  const baseZoom = 400 / (maxExtent * 2.5);

  // Isometric camera position: equal distance on all axes
  const distance = maxExtent * 2;
  const isoAngle = Math.atan(1 / Math.sqrt(2)); // ~35.264°

  // Callback to receive snap function from CameraController
  const handleSnapReady = useCallback((fn: (preset: CameraPreset) => void) => {
    snapFnRef.current = fn;
  }, []);

  // Expose snapTo via ref
  useImperativeHandle(
    ref,
    () => ({
      snapTo: (preset: CameraPreset) => {
        snapFnRef.current?.(preset);
      },
    }),
    []
  );

  return (
    <div className={className} style={{ minHeight: 200, minWidth: 200 }}>
      <Canvas
        orthographic
        camera={{
          position: [distance, distance * Math.tan(isoAngle), distance],
          zoom: baseZoom,
          near: -1000,
          far: 1000,
        }}
        style={{ width: "100%", height: "100%" }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 50 } }}
      >
        <ManifoldScene data={data} colorMode={colorMode} />
        <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.1} />
        <CameraController
          controlsRef={controlsRef}
          distance={distance}
          onSnapReady={handleSnapReady}
        />
      </Canvas>
    </div>
  );
});
