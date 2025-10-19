import { Clipboard } from "lucide-react";
import { Button } from "../ui/button";

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
    <Button size="xs" onClick={handleCopy} variant="outline">
      <Clipboard />
      {label}
    </Button>
  );
};
