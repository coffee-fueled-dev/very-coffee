import { Clipboard } from "lucide-react";
import { Badge } from "../ui/badge";

export const CopyButton = ({
  content,
  label,
}: {
  content: string;
  label: string;
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error("Failed to copy to clipboard", error);
    }
  };

  return (
    <Badge
      onClick={handleCopy}
      variant="secondary"
      className="flex justify-start gap-1 items-center cursor-pointer"
    >
      <Clipboard size={16} />
      {label}
    </Badge>
  );
};
