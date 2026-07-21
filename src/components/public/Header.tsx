import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight, MessageCircle } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/holiday-packages", label: "Holidays" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="container-page flex items-center justify-between h-16">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
        <a
          href="https://wa.me/910000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald text-emerald-foreground hover:opacity-90 transition-opacity"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
        </a>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95">
          <Link to="/flight-quote">
            Request a Quote <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <button
          className="md:hidden p-2 -mr-2 rounded-md hover:bg-accent"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div
        className={cn(
          "md:hidden overflow-hidden border-t border-border/60 transition-[max-height]",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <nav className="container-page py-4 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-sm rounded-md hover:bg-accent"
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="px-3 py-2 text-sm rounded-md hover:bg-accent mt-2 border-t border-border/60 pt-4"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}