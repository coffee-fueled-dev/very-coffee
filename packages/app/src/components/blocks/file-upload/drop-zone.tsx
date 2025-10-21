import { useState, useCallback, useEffect, type FC } from "react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";
import { cn } from "@/lib/utils";
import { useUploadedFiles } from "./context";
import { FileInfoDisplay } from "./file-info";
import { MIME_TYPES } from "./mime-types";
import { toast } from "sonner";

export interface DropZoneProps {
  children?: React.ReactNode;
  maxFiles?: number;
  maxFileSize?: number;
  placeholder?: string;
  accept?: Accept;
}

export const DropZone: FC<DropZoneProps> = ({
  children,
  maxFiles = 1,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  placeholder,
  accept = MIME_TYPES,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const { files, setFiles, loading, error } = useUploadedFiles();

  // Reset drag active state when files are cleared
  useEffect(() => {
    if (files.length === 0) {
      setIsDragActive(false);
    }
  }, [files]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        if (maxFiles === 1) {
          setFiles([acceptedFiles[0]]);
        } else {
          const newFiles = [...files, ...acceptedFiles];
          if (newFiles.length <= maxFiles) {
            setFiles(newFiles);
          } else {
            setFiles(newFiles.slice(0, maxFiles));
          }
        }
      }
      // Reset drag active state after drop
      setIsDragActive(false);
    },
    [setFiles, files, maxFiles]
  );

  const handleDragEnter = useCallback(() => {
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      fileRejections.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            toast.error(
              `File "${file.name}" is too large. Maximum size is ${(
                maxFileSize /
                1024 /
                1024
              ).toFixed(2)} MB.`
            );
          } else if (error.code === "file-invalid-type") {
            toast.error(
              `File "${file.name}" has an invalid type. Please upload a supported file format.`
            );
          } else if (error.code === "too-many-files") {
            toast.error(`Too many files. Maximum allowed is ${maxFiles}.`);
          } else {
            toast.error(`Error uploading "${file.name}": ${error.message}`);
          }
        });
      });
      setIsDragActive(false);
    },
    [maxFileSize, maxFiles]
  );

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxFiles: maxFiles,
    maxSize: maxFileSize,
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    disabled:
      loading ||
      (maxFiles === 1 && files.length > 0) ||
      files.length >= maxFiles,
    noClick: maxFiles === 1 && files.length > 0,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-row items-start w-full transition-[color,box-shadow]",
        "border border-input rounded-md p-6 cursor-pointer gap-3 relative bg-transparent shadow-xs outline-none",
        "hover:border-ring/50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        isDragActive ? "border-ring ring-ring/50 ring-[3px] bg-primary/10" : "",
        isDragReject &&
          "border-destructive ring-destructive/20 ring-[3px] bg-destructive/5",
        loading && "opacity-50 cursor-not-allowed",
        files.length > 0 && "justify-between"
      )}
    >
      <input {...getInputProps()} />

      <FileInfoDisplay
        isDragActive={isDragActive}
        statusText={
          loading ? " • Processing..." : error ? " • ✗ Processing failed" : ""
        }
        maxFiles={maxFiles}
        placeholder={placeholder}
      />

      {files.length > 0 && (
        <div className="flex flex-row justify-end gap-2">{children}</div>
      )}
    </div>
  );
};
