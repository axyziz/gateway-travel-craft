import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/shared/Logo";
import { Instagram, Facebook, Mail, Phone, MessageCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const COLS = [
  {
    title: "Services",
    links: [
      { to: "/flight-quote", label: "Flight Quote" },
      { to: "/holiday-packages", label: "Holiday Packages" },
      { to: "/hotel-requests", label: "Hotel Requests" },
      { to: "/visa", label: "Visa Assistance" },
      { to: "/vehicle-rental", label: "Vehicle Rental" },
      { to: "/bus-booking", label: "Bus Booking" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/services", label: "All services" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms & Conditions" },
    ],
  },
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-gradient-primary text-primary-foreground">
      <div className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-primary-foreground/70 max-w-xs">
              Premium travel, coordinated end to end. Flights, stays, visas and journeys — crafted by Gateway.
            </p>
            <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">Newsletter</p>
              <div className="mt-2 flex gap-2 max-w-xs">
                <Input type="email" placeholder="you@example.com" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50" />
                <Button type="submit" size="icon" className="bg-gradient-gold text-[color:var(--gold-foreground)] hover:opacity-90 shrink-0" aria-label="Subscribe">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <div className="mt-6 flex items-center gap-2">
              <a href="https://wa.me/910000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid place-items-center h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"><MessageCircle className="h-4 w-4" /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid place-items-center h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"><Instagram className="h-4 w-4" /></a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid place-items-center h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"><Facebook className="h-4 w-4" /></a>
              <a href="mailto:hello@gatewaytravels.example" aria-label="Email" className="grid place-items-center h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"><Mail className="h-4 w-4" /></a>
              <a href="tel:+910000000000" aria-label="Phone" className="grid place-items-center h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"><Phone className="h-4 w-4" /></a>
            </div>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} Gateway Travels. All rights reserved.</p>
          <p className="text-xs text-primary-foreground/60">Crafted with precision.</p>
        </div>
      </div>
    </footer>
  );
}