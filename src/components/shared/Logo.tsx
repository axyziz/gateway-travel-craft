import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
        <Plane className="h-4 w-4" strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="font-display font-semibold text-lg tracking-tight">
          Gateway<span className="text-muted-foreground font-normal">Travels</span>
        </span>
      )}
    </Link>
  );
}