import { Button } from "./ui/button";

export const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: string;
}) => (
  <a target="_blank" rel="noopener noreferrer" href={href}>
    <Button variant="link" size="sm" className="px-0">
      {children}
    </Button>
  </a>
);
