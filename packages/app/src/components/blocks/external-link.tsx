import { ExternalLinkIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { AnchorHTMLAttributes, ReactNode } from "react";

export const ExternalLink = ({
  size,
  children,
  variant = "link",
  className,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> & {
  children?: ReactNode;
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  variant?: "link" | "default" | "outline" | "secondary" | "ghost";
}) => {
  const isIcon = size === "icon" || size === "icon-sm" || size === "icon-lg";
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      <Button variant={variant} size={size} className={className}>
        {children}
        {!isIcon && <ExternalLinkIcon />}
      </Button>
    </a>
  );
};

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
