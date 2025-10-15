import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import type {
  TooltipContentProps,
  TooltipProps,
} from "@radix-ui/react-tooltip";

export const TooltipButton: React.FC<
  {
    children?: React.ReactNode;
    tooltip: string;
    side?: TooltipContentProps["side"];
  } & TooltipProps
> = ({ children, tooltip, side, ...props }) => (
  <TooltipProvider>
    <Tooltip {...props}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
