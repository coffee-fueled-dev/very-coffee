import {
  type LucideIcon,
  FileText,
  FileImage,
  FileVideo,
  FileSpreadsheet,
  File,
  FileCode,
  FolderArchive,
  FileJson,
} from "lucide-react";
import type { Mime } from "./mime-types";

export const mimeToIcon = (mimeType: Mime): LucideIcon => {
  if (mimeType === "application/json") {
    return FileJson;
  }

  // Documents
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/pdf" ||
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/rtf" ||
    mimeType === "application/vnd.oasis.opendocument.text"
  ) {
    return FileText;
  }

  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.oasis.opendocument.spreadsheet"
  ) {
    return FileSpreadsheet;
  }
  if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mimeType === "application/vnd.oasis.opendocument.presentation"
  ) {
    return FileVideo;
  }

  // Images
  if (mimeType.startsWith("image/")) {
    return FileImage;
  }

  // Archives
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-tar" ||
    mimeType === "application/gzip" ||
    mimeType === "application/x-7z-compressed"
  ) {
    return FolderArchive;
  }

  // Code files
  if (
    mimeType === "application/javascript" ||
    mimeType === "text/javascript" ||
    mimeType === "application/typescript" ||
    mimeType === "application/x-python" ||
    mimeType === "text/x-python" ||
    mimeType === "application/x-java" ||
    mimeType === "text/x-java" ||
    mimeType === "application/x-c" ||
    mimeType === "text/x-c" ||
    mimeType === "application/x-c++" ||
    mimeType === "text/x-c++" ||
    mimeType === "application/x-csharp" ||
    mimeType === "text/x-csharp" ||
    mimeType === "application/x-php" ||
    mimeType === "text/x-php" ||
    mimeType === "application/x-ruby" ||
    mimeType === "text/x-ruby" ||
    mimeType === "application/x-go" ||
    mimeType === "text/x-go" ||
    mimeType === "application/x-rust" ||
    mimeType === "text/x-rust" ||
    mimeType === "application/x-swift" ||
    mimeType === "text/x-swift" ||
    mimeType === "application/x-kotlin" ||
    mimeType === "text/x-kotlin" ||
    mimeType === "application/x-scala" ||
    mimeType === "text/x-scala" ||
    mimeType === "application/x-shell" ||
    mimeType === "text/x-shell" ||
    mimeType === "application/x-yaml" ||
    mimeType === "text/x-yaml" ||
    mimeType === "application/toml" ||
    mimeType === "text/x-toml" ||
    mimeType === "application/xml" ||
    mimeType === "text/xml"
  ) {
    return FileCode;
  }

  // Default fallback
  return File;
};
