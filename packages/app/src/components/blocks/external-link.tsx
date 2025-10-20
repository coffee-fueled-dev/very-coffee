import { Button } from "../ui/button";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export const ExternalLink = ({
  size,
  children,
  variant = "link",
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> & {
  children?: ReactNode;
  size?: "sm" | "default" | "lg";
  variant?: "link" | "default" | "outline" | "secondary" | "ghost";
}) => (
  <a target="_blank" rel="noopener noreferrer" {...props}>
    <Button variant={variant} size={size}>
      {children}
    </Button>
  </a>
);

export const InlineLink = ({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) => (
  <ExternalLink href={href} size="sm" className="px-0">
    {children}
  </ExternalLink>
);
