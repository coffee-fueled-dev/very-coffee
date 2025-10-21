import { cn } from "@/lib/utils";
import { Upload, type LucideIcon } from "lucide-react";
import { useUploadedFiles } from "./context";
import { mimeToIcon } from "./mime-to-icon";

export const FileInfoDisplay = ({
  isDragActive,
  statusText,
  maxFiles = 1,
  placeholder,
}: {
  isDragActive: boolean;
  statusText: string;
  maxFiles?: number;
  placeholder?: string;
}) => {
  const { files, error } = useUploadedFiles();

  if (files.length === 0) {
    return (
      <ContextualFileMessage
        isDragActive={isDragActive}
        processed={false}
        icon={Upload}
        secondaryText={
          placeholder ||
          (maxFiles === 1
            ? "Documents, images, text files, and code files"
            : `Documents, images, text files, and code files (up to ${maxFiles} files)`)
        }
      />
    );
  }

  if (maxFiles === 1) {
    const file = files[0];
    const fileIcon = mimeToIcon(
      file.type as keyof typeof import("./mime-types").MIME_TYPES
    );
    const fileSizeText =
      file.size < 102400
        ? `${(file.size / 1024).toFixed(2)} KB`
        : `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    return (
      <ContextualFileMessage
        isDragActive={false}
        processed={!!file}
        error={!!error}
        icon={fileIcon}
        primaryText={file.name}
        secondaryText={`${fileSizeText}${statusText}`}
        truncatePrimary={true}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {files.map((file, index) => {
        const fileIcon = mimeToIcon(
          file.type as keyof typeof import("./mime-types").MIME_TYPES
        );
        const fileSizeText =
          file.size < 102400
            ? `${(file.size / 1024).toFixed(2)} KB`
            : `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        return (
          <ContextualFileMessage
            key={`${file.name}-${index}`}
            isDragActive={false}
            processed={!!file}
            error={!!error}
            icon={fileIcon}
            primaryText={file.name}
            secondaryText={`${fileSizeText}${statusText}`}
            truncatePrimary={true}
          />
        );
      })}
    </div>
  );
};

const ContextualFileMessage = (props: {
  isDragActive: boolean;
  processed: boolean;
  error?: boolean;
  icon: LucideIcon;
  primaryText?: string;
  secondaryText?: string;
  truncatePrimary?: boolean;
}) => {
  const iconColorClass = props.isDragActive
    ? "text-primary"
    : props.error
    ? "text-destructive"
    : props.processed
    ? "text-green-600"
    : "text-muted-foreground";

  const textColorClass = props.error
    ? "text-destructive"
    : props.processed
    ? "text-green-600"
    : "text-muted-foreground";

  const defaultPrimaryText = props.isDragActive
    ? "Drop your file here"
    : "Drop your file here or click to upload";

  const defaultSecondaryText = "Documents, images, text files, and code files";

  return (
    <div className="flex items-start gap-2 w-full">
      <props.icon
        className={cn(
          "w-5 h-5 flex-shrink-0 transition-all duration-500 ease-in-out",
          iconColorClass
        )}
      />
      <div className={props.truncatePrimary ? "flex-1 min-w-0" : ""}>
        <p
          className={cn(
            "font-medium text-sm",
            props.truncatePrimary && "truncate",
            props.primaryText ? "text-[#201547]" : ""
          )}
        >
          {props.primaryText || defaultPrimaryText}
        </p>
        <p
          className={cn(
            "text-xs transition-all duration-500 ease-in-out",
            textColorClass
          )}
        >
          {props.secondaryText || defaultSecondaryText}
        </p>
      </div>
    </div>
  );
};
