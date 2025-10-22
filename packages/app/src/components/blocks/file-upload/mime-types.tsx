import type { Accept } from "react-dropzone";
export type Mime = keyof typeof MIME_TYPES;
// Default accepted file types
export const MIME_TYPES = {
  // Text files
  "text/plain": [".txt"],
  "text/markdown": [".md", ".markdown"],
  "text/csv": [".csv"],
  "text/tab-separated-values": [".tsv"],
  "text/html": [".html", ".htm"],
  "text/css": [".css"],
  "application/json": [".json"],
  "application/javascript": [".js"],
  "text/javascript": [".js"],
  "application/typescript": [".ts"],
  "application/xml": [".xml"],
  "text/xml": [".xml"],

  // Documents
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
  "application/rtf": [".rtf"],
  "application/vnd.oasis.opendocument.text": [".odt"],
  "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
  "application/vnd.oasis.opendocument.presentation": [".odp"],

  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],
  "image/bmp": [".bmp"],
  "image/tiff": [".tiff", ".tif"],

  // Archives
  "application/zip": [".zip"],
  "application/x-tar": [".tar"],
  "application/gzip": [".gz"],
  "application/x-7z-compressed": [".7z"],

  // Code files
  "application/x-python": [".py"],
  "text/x-python": [".py"],
  "application/x-java": [".java"],
  "text/x-java": [".java"],
  "application/x-c": [".c"],
  "text/x-c": [".c"],
  "application/x-c++": [".cpp", ".cc", ".cxx"],
  "text/x-c++": [".cpp", ".cc", ".cxx"],
  "application/x-csharp": [".cs"],
  "text/x-csharp": [".cs"],
  "application/x-php": [".php"],
  "text/x-php": [".php"],
  "application/x-ruby": [".rb"],
  "text/x-ruby": [".rb"],
  "application/x-go": [".go"],
  "text/x-go": [".go"],
  "application/x-rust": [".rs"],
  "text/x-rust": [".rs"],
  "application/x-swift": [".swift"],
  "text/x-swift": [".swift"],
  "application/x-kotlin": [".kt"],
  "text/x-kotlin": [".kt"],
  "application/x-scala": [".scala"],
  "text/x-scala": [".scala"],
  "application/x-shell": [".sh", ".bash"],
  "text/x-shell": [".sh", ".bash"],
  "application/x-yaml": [".yml", ".yaml"],
  "text/x-yaml": [".yml", ".yaml"],
  "application/toml": [".toml"],
  "text/x-toml": [".toml"],
} as const satisfies Accept;
