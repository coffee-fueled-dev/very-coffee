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
import colors from "tailwindcss/colors";
import { convert } from "colorizr";

// Convert Tailwind colors to hex (handles both hex and OKLCH formats)
const toHex = (color: string): string => {
  try {
    return convert(color, "hex");
  } catch {
    return color; // Fallback to original if conversion fails
  }
};

export const COLOR_PALETTE = [
  toHex(colors.gray[800]),
  toHex(colors.blue[400]),
  toHex(colors.rose[400]),
  toHex(colors.emerald[500]),
  toHex(colors.violet[500]),
  toHex(colors.orange[500]),
  toHex(colors.sky[300]),
  toHex(colors.amber[300]),
  toHex(colors.lime[500]),
  toHex(colors.purple[500]),
] as const;

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
const MUTED_SPHERE_COLOR = toHex(colors.gray[900]);

export type LatticeColorMode = "rgb" | "gradient" | "layer";

// Camera preset angles (azimuth, polar) in radians
export const CAMERA_PRESETS = {
  isometric: { azimuth: Math.PI / 4, polar: Math.atan(1 / Math.sqrt(2)) },
  top: { azimuth: 0, polar: 0.001 }, // Nearly straight down
  front: { azimuth: 0, polar: Math.PI / 2 },
  right: { azimuth: Math.PI / 2, polar: Math.PI / 2 },
} as const;

export type CameraPreset = keyof typeof CAMERA_PRESETS;

export interface LatticeHandle {
  snapTo: (preset: CameraPreset) => void;
}

function getOccupiedColor(
  cell: LatticeCell,
  colorMode: LatticeColorMode
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
      return COLOR_PALETTE[cell.z] ?? COLOR_PALETTE[0] ?? "#000000";
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
  colorMode: LatticeColorMode;
}) {
  const radius = cell.occupied ? OCCUPIED_RADIUS : UNOCCUPIED_RADIUS;
  const color = cell.occupied
    ? getOccupiedColor(cell, colorMode)
    : MUTED_SPHERE_COLOR;

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

function LatticeScene({
  data,
  colorMode,
}: {
  data: number[][];
  colorMode: LatticeColorMode;
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
  maxExtent,
  onSnapReady,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  distance: number;
  maxExtent: number;
  onSnapReady: (fn: (preset: CameraPreset) => void) => void;
}) {
  const { camera, size } = useThree();

  // Adjust zoom to fit the scene in the viewport
  useEffect(() => {
    const minDimension = Math.min(size.width, size.height);
    // Scale zoom based on viewport size and scene extent
    const zoom = minDimension / (maxExtent * 1.5);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }, [size.width, size.height, maxExtent, camera]);

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

export const Lattice = forwardRef<
  LatticeHandle,
  {
    data: number[][];
    className?: string;
    colorMode?: LatticeColorMode;
    style?: React.CSSProperties;
  }
>(({ data, className, colorMode = "rgb", style }, ref) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const snapFnRef = useRef<((preset: CameraPreset) => void) | null>(null);

  const gridWidth = data[0]?.length ?? 0;
  const gridHeight = data.length;
  const depth = 9;

  const maxExtent = Math.max(gridWidth, gridHeight, depth);

  // Front view camera position (looking along z-axis)
  const distance = maxExtent * 2;

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
    <div
      className={className}
      style={{ minHeight: 200, minWidth: 200, ...style }}
    >
      <Canvas
        orthographic
        camera={{
          position: [0, 0, distance], // Front view: looking along z-axis
          zoom: 1, // Initial value, CameraController will set correct zoom based on viewport
          near: -1000,
          far: 1000,
        }}
        style={{ width: "100%", height: "100%" }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 50 } }}
      >
        <LatticeScene data={data} colorMode={colorMode} />
        <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.1} />
        <CameraController
          controlsRef={controlsRef}
          distance={distance}
          maxExtent={maxExtent}
          onSnapReady={handleSnapReady}
        />
      </Canvas>
    </div>
  );
});
