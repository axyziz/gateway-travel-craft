import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Plane,
  Hotel,
  Sparkles,
  Globe2,
  Car,
  Bus,
  ShieldCheck,
  Zap,
  Layers,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: Home });

const SERVICES = [
  { icon: Plane, title: "Flight Quotes", to: "/flight-quote", desc: "Custom fares across global carriers." },
  { icon: Sparkles, title: "Holiday Packages", to: "/holiday-packages", desc: "Curated getaways, end-to-end." },
  { icon: Hotel, title: "Hotel Requests", to: "/hotel-requests", desc: "Negotiated rates worldwide." },
  { icon: Globe2, title: "Visa Assistance", to: "/visa", desc: "Guided documentation and filing." },
  { icon: Car, title: "Vehicle Rental", to: "/vehicle-rental", desc: "Ground transport, on demand." },
  { icon: Bus, title: "Bus Booking", to: "/bus-booking", desc: "Intercity routes and charters." },
];

const FEATURES = [
  { icon: Zap, title: "Built for speed", desc: "Quotes, itineraries, and confirmations in minutes — not days." },
  { icon: ShieldCheck, title: "Enterprise-grade", desc: "SSO, role-based access, and audit trails baked in." },
  { icon: Layers, title: "Modular by design", desc: "A composable CRM that adapts to how your team operates." },
];

function Home() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Gateway Travels"
        title={
          <>
            Travel operations, <span className="text-gradient">reimagined</span>.
          </>
        }
        description="A modern Travel CRM and premium service layer for high-touch travel businesses. One workspace for flights, stays, visas, and everything in between."
      >
        <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95">
          <Link to="/contact">
            Talk to us <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/services">Explore services</Link>
        </Button>
      </PageHero>

      <section className="container-page py-20">
        <SectionHeading
          eyebrow="Services"
          title="Everything travel, in one place."
          description="From a single flight quote to end-to-end holiday planning, Gateway coordinates it."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link to={s.to} className="block h-full group">
                <Card className="h-full p-6 border-border/60 hover:border-primary/40 hover:shadow-elegant transition-all duration-300">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-accent text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                    Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-gradient-subtle">
        <div className="container-page py-20 grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Why Gateway"
            title="Serious infrastructure for travel teams."
            description="We built the operational backbone we always wanted — precise, fast, and quietly powerful."
          />
          <div className="grid gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-5 flex gap-4 border-border/60 bg-background">
                <span className="grid place-items-center h-10 w-10 rounded-lg bg-gradient-primary text-primary-foreground shrink-0">
                  <f.icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold tracking-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-24">
        <Card className="p-10 sm:p-14 border-border/60 shadow-elegant bg-gradient-primary text-primary-foreground text-center overflow-hidden relative">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ready when you are.</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            Start a conversation — we'll tailor a plan to your operation.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Contact Gateway</Link>
            </Button>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}