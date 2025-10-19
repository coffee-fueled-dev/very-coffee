import { Button } from "../ui/button";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export const ExternalLink = ({
  size,
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  size?: "sm" | "default" | "lg";
}) => (
  <a target="_blank" rel="noopener noreferrer" href={href} {...props}>
    <Button variant="link" size={size} className="px-0">
      {children}
    </Button>
  </a>
);
