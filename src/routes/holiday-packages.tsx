import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageHero } from "@/components/shared/PageHero";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/holiday-packages")({
  head: () => ({
    meta: [
      { title: "Holiday Packages — Gateway Travels" },
      { name: "description", content: "Curated domestic and international holiday packages — Goa, Kashmir, Kerala, Dubai, Bali, Maldives and more." },
      { property: "og:title", content: "Holiday Packages — Gateway Travels" },
      { property: "og:description", content: "Curated domestic and international holidays, planned end to end." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HolidayPackages,
});

type Dest = { name: string; from: string; tone: string; tag: string };

const DOMESTIC: Dest[] = [
  { name: "Goa", from: "₹9,999", tag: "Beach", tone: "from-amber-400/40 via-orange-500/30 to-rose-500/40" },
  { name: "Kashmir", from: "₹18,499", tag: "Mountains", tone: "from-sky-400/40 via-indigo-500/30 to-slate-600/40" },
  { name: "Kerala", from: "₹12,499", tag: "Backwaters", tone: "from-emerald-500/40 via-teal-500/30 to-green-700/40" },
  { name: "Andaman", from: "₹22,999", tag: "Islands", tone: "from-cyan-400/40 via-teal-500/30 to-blue-600/40" },
  { name: "Ladakh", from: "₹24,999", tag: "Adventure", tone: "from-slate-400/40 via-blue-500/30 to-indigo-700/40" },
  { name: "Ooty", from: "₹8,999", tag: "Hill Station", tone: "from-lime-500/40 via-emerald-500/30 to-green-700/40" },
  { name: "Manali", from: "₹9,499", tag: "Snow", tone: "from-sky-300/40 via-indigo-400/30 to-blue-600/40" },
  { name: "Shimla", from: "₹8,499", tag: "Hill Station", tone: "from-emerald-400/40 via-teal-500/30 to-slate-600/40" },
  { name: "Jaipur", from: "₹7,499", tag: "Heritage", tone: "from-rose-400/40 via-orange-500/30 to-amber-600/40" },
  { name: "Udaipur", from: "₹10,999", tag: "Lakes", tone: "from-fuchsia-400/40 via-rose-500/30 to-amber-500/40" },
];

const INTERNATIONAL: Dest[] = [
  { name: "Dubai", from: "₹34,999", tag: "Luxury", tone: "from-amber-400/40 via-yellow-500/30 to-orange-600/40" },
  { name: "Singapore", from: "₹42,999", tag: "City", tone: "from-rose-400/40 via-red-500/30 to-orange-600/40" },
  { name: "Thailand", from: "₹28,999", tag: "Beach", tone: "from-emerald-400/40 via-teal-500/30 to-cyan-600/40" },
  { name: "Malaysia", from: "₹31,999", tag: "Nature", tone: "from-lime-500/40 via-green-600/30 to-emerald-700/40" },
  { name: "Bali", from: "₹38,999", tag: "Island", tone: "from-orange-400/40 via-rose-500/30 to-fuchsia-600/40" },
  { name: "Maldives", from: "₹64,999", tag: "Luxury", tone: "from-cyan-400/40 via-sky-500/30 to-teal-600/40" },
  { name: "Turkey", from: "₹54,999", tag: "Heritage", tone: "from-red-400/40 via-rose-500/30 to-orange-600/40" },
  { name: "Azerbaijan", from: "₹39,999", tag: "Emerging", tone: "from-indigo-400/40 via-blue-500/30 to-teal-600/40" },
  { name: "Vietnam", from: "₹32,999", tag: "Culture", tone: "from-emerald-400/40 via-green-500/30 to-teal-700/40" },
  { name: "United Kingdom", from: "₹79,999", tag: "Classic", tone: "from-slate-400/40 via-indigo-500/30 to-blue-700/40" },
];

function DestGrid({ items }: { items: Dest[] }) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((d, i) => (
        <motion.div key={d.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.35, delay: i * 0.03 }}>
          <Card className="relative overflow-hidden border-border/60 h-64 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${d.tone}`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent,oklch(0.2_0.06_260/0.6))]" />
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full glass-card px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
              <MapPin className="h-3 w-3" /> {d.tag}
            </div>
            <div className="absolute top-4 right-4 rounded-full bg-gradient-gold text-[color:var(--gold-foreground)] px-2.5 py-1 text-[11px] font-semibold shadow-soft">
              from {d.from}
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
              <h3 className="text-2xl font-semibold tracking-tight drop-shadow">{d.name}</h3>
              <p className="mt-1 text-xs text-primary-foreground/80">Starting from {d.from} per person</p>
              <Button asChild size="sm" className="mt-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Link to="/holiday-packages" hash={d.name.toLowerCase()}>Explore <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function HolidayPackages() {
  return (
    <PublicLayout>
      <div className="container-page pt-8"><Breadcrumbs items={[{ label: "Services", to: "/services" }, { label: "Holiday Packages" }]} /></div>
      <PageHero
        eyebrow="Holidays"
        title={<>Trips worth the <span className="text-gradient">anticipation</span>.</>}
        description="Curated domestic and international getaways. Every itinerary is authored around what you actually enjoy — then coordinated so nothing surprises you."
      />
      <section className="container-page py-14">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald/10 text-emerald px-3 py-1 text-xs font-semibold uppercase tracking-wider">Domestic</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">Explore India</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">Handpicked stays, private transfers and local experiences across ten iconic destinations.</p>
        </div>
        <DestGrid items={DOMESTIC} />
      </section>
      <section className="border-y border-border/60 bg-gradient-subtle">
        <div className="container-page py-14">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-gold text-[color:var(--gold-foreground)] px-3 py-1 text-xs font-semibold uppercase tracking-wider">International</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">Beyond borders</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">Visa guidance, curated stays and 24/7 on-trip support — from Dubai to the Maldives.</p>
          </div>
          <DestGrid items={INTERNATIONAL} />
        </div>
      </section>
      <section className="container-page py-16 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-gold" /> Plan with a specialist
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Tell us where you dream of going.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg">Share a few details and a Gateway specialist will craft a custom itinerary within one business day — with transparent pricing and zero markup surprises.</p>
        </div>
        <EnquiryForm service="holiday" />
      </section>
    </PublicLayout>
  );
}