import type { Accept } from "react-dropzone";
import { ResetButton } from "./buttons";
import { DropZone, type DropZoneProps } from "./drop-zone";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export const FileUpload = (
  props: DropZoneProps & { supportedFileTypes: Accept }
) => {
  const supportedFileTypeList = Object.values(props.supportedFileTypes)
    .flat()
    .join(", ");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          Supporting documents
        </label>
        <Tooltip>
          <TooltipTrigger>
            <Info size={16} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Supported file types: {supportedFileTypeList}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <DropZone {...props}>
        <ResetButton variant="link">Remove documents</ResetButton>
      </DropZone>
    </div>
  );
};
