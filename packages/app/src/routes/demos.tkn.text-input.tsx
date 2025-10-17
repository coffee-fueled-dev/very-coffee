import { TknTextInputDemo } from "@/demos/tkn/text-input/demo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demos/tkn/text-input")({
  component: TknTextInputDemo,
});
