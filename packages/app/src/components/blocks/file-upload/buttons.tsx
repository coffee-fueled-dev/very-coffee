import { useUploadedFiles } from "./context";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MouseEvent, ReactNode } from "react";

export const RemoveFileButton = ({
  children,
  handleRemoveFile,
  ...props
}: {
  children: ReactNode;
  handleRemoveFile: (e: MouseEvent) => void;
} & Omit<ButtonProps, "onClick" | "children">) => {
  const { files, loading, error } = useUploadedFiles();

  if (files.length > 0 || loading || error) {
    return null;
  }

  return (
    <Button
      onClick={handleRemoveFile}
      className={cn(
        "text-destructive hover:text-destructive/80 flex-shrink-0",
        props.className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export const RetryButton = ({
  children,
  handleRetry,
  ...props
}: {
  children: ReactNode;
  handleRetry: (e: MouseEvent) => void;
} & Omit<ButtonProps, "onClick" | "children">) => {
  const { error, loading } = useUploadedFiles();

  if (!error) {
    return null;
  }

  return (
    <Button
      onClick={handleRetry}
      disabled={loading}
      variant="secondary"
      size="sm"
      {...props}
    >
      {children}
    </Button>
  );
};

export const ProcessFileButton = ({
  children,
  handleProcessFile,
  ...props
}: {
  children: ReactNode;
  handleProcessFile: (e: MouseEvent) => void;
} & Omit<ButtonProps, "onClick" | "children">) => {
  const { files, error, loading } = useUploadedFiles();

  if (files.length === 0 || error || loading) {
    return null;
  }

  return (
    <Button
      onClick={handleProcessFile}
      disabled={loading}
      className="max-w-[200px]"
      size="sm"
      {...props}
    >
      {children}
    </Button>
  );
};

export const ResetButton = ({
  children,
  ...props
}: {
  children: ReactNode;
} & Omit<ButtonProps, "onClick" | "children">) => {
  const { files, error, loading, reset } = useUploadedFiles();

  if (files.length === 0 && !error) {
    return null;
  }

  const handleReset = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    reset();
  };

  return (
    <Button
      onClick={handleReset}
      disabled={loading}
      variant="outline"
      size="sm"
      {...props}
    >
      {children}
    </Button>
  );
};
