import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
        <Home className="h-3.5 w-3.5" /> Home
      </Link>
      {items.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          {c.to ? (
            <Link to={c.to} className="hover:text-foreground transition-colors">{c.label}</Link>
          ) : (
            <span className="text-foreground font-medium">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}