import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/shared/Logo";

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
    <footer className="border-t border-border/60 bg-gradient-subtle">
      <div className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Enterprise travel operations, delivered as a service. Fly, stay, and move — powered by Gateway.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Gateway Travels. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Crafted with precision.</p>
        </div>
      </div>
    </footer>
  );
}