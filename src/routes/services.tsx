import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane, Hotel, Sparkles, Globe2, Car, Bus, ArrowRight } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Card } from "@/components/ui/card";

const SERVICES = [
  { icon: Plane, title: "Flight Quote Request", to: "/flight-quote", desc: "Bespoke fare research across global carriers." },
  { icon: Sparkles, title: "Holiday Packages", to: "/holiday-packages", desc: "Curated multi-city itineraries and getaways." },
  { icon: Hotel, title: "Hotel Requests", to: "/hotel-requests", desc: "Negotiated stays with your preferences priced in." },
  { icon: Globe2, title: "Visa Assistance", to: "/visa", desc: "Documentation, checklists, and filing support." },
  { icon: Car, title: "Vehicle Rental", to: "/vehicle-rental", desc: "Airport transfers and multi-day ground transport." },
  { icon: Bus, title: "Bus Booking", to: "/bus-booking", desc: "Intercity routes and private charters." },
];

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Gateway Travels" },
      { name: "description", content: "Flights, holidays, hotels, visas, transport — coordinated by Gateway Travels." },
    ],
  }),
  component: Services,
});

function Services() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Services"
        title={<>Everything travel, one team.</>}
        description="Choose a single service or hand us the whole trip. Either way, you get one point of contact and one clean bill."
      />
      <section className="container-page py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link key={s.to} to={s.to} className="group block">
              <Card className="h-full p-6 border-border/60 hover:border-primary/40 hover:shadow-elegant transition-all">
                <span className="grid place-items-center h-11 w-11 rounded-xl bg-accent text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                  Request now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}