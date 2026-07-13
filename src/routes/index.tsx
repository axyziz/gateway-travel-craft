import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Plane, Hotel, Sparkles, Globe2, Car, Bus,
  ShieldCheck, Zap, Layers, Clock, Star, Quote,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gateway Travels — Enterprise Travel CRM & Concierge" },
      { name: "description", content: "Premium travel services and an enterprise CRM in one workspace. Flights, hotels, holidays, visas, transport — coordinated end to end." },
      { property: "og:title", content: "Gateway Travels — Enterprise Travel CRM & Concierge" },
      { property: "og:description", content: "Premium travel services and an enterprise CRM in one workspace. Flights, hotels, holidays, visas, transport — coordinated end to end." },
    ],
  }),
  component: Home,
});

const SERVICES = [
  { icon: Plane, title: "Flight Quotes", to: "/flight-quote", desc: "Custom fares across global carriers, answered by a real specialist." },
  { icon: Sparkles, title: "Holiday Packages", to: "/holiday-packages", desc: "Curated getaways, planned and coordinated end-to-end." },
  { icon: Hotel, title: "Hotel Requests", to: "/hotel-requests", desc: "Negotiated rates worldwide with your preferences priced in." },
  { icon: Globe2, title: "Visa Assistance", to: "/visa", desc: "Guided documentation, forms, and appointment scheduling." },
  { icon: Car, title: "Vehicle Rental", to: "/vehicle-rental", desc: "Airport transfers and multi-day ground transport, with a driver." },
  { icon: Bus, title: "Bus Booking", to: "/bus-booking", desc: "Intercity seats and full charters on trusted operators." },
];

const WHY = [
  { icon: Zap, title: "Fast, human replies", desc: "Quotes and confirmations in hours, not days — from a real travel expert." },
  { icon: ShieldCheck, title: "Enterprise-grade CRM", desc: "Every request, customer, and note is captured so nothing slips." },
  { icon: Layers, title: "One workspace", desc: "Flights, hotels, visas and transport — one team, one invoice, one point of contact." },
  { icon: Clock, title: "On-trip support", desc: "Real people on call while you travel, in your timezone." },
];

const DESTINATIONS = [
  { name: "Bali", region: "Indonesia", tone: "from-amber-500/30 to-rose-500/30" },
  { name: "Dubai", region: "United Arab Emirates", tone: "from-sky-500/30 to-indigo-500/30" },
  { name: "Paris", region: "France", tone: "from-fuchsia-500/30 to-purple-500/30" },
  { name: "Tokyo", region: "Japan", tone: "from-rose-500/30 to-orange-500/30" },
  { name: "Maldives", region: "Indian Ocean", tone: "from-cyan-500/30 to-teal-500/30" },
  { name: "Zurich", region: "Switzerland", tone: "from-emerald-500/30 to-lime-500/30" },
];

const TESTIMONIALS = [
  { quote: "Gateway rebooked our entire team overnight when a storm shut the airport. Zero drama.", author: "Anika R.", role: "Head of Operations" },
  { quote: "The itinerary was so well planned we didn't touch a single reservation the whole trip.", author: "Marcus D.", role: "Frequent traveller" },
  { quote: "Their visa desk got three of us approved in a week. I have no idea how.", author: "Priya S.", role: "Founder" },
];

const FAQS = [
  { q: "How quickly will I hear back after submitting an enquiry?", a: "Most enquiries receive a first response within a few business hours. Complex itineraries are usually returned within one business day." },
  { q: "Do you charge to prepare a quote?", a: "No. Preparing your quote is free. You only pay once you confirm a booking, and pricing is disclosed up front." },
  { q: "Can Gateway handle group and corporate travel?", a: "Yes — group bookings, offsites, and corporate travel programs are a large part of what we do. We provide consolidated billing and reporting." },
  { q: "What if something goes wrong on the road?", a: "Our team is reachable while you travel. Rebookings, upgrades and emergency support are handled by real people, not chatbots." },
];

function Home() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Gateway Travels"
        title={<>Travel operations, <span className="text-gradient">reimagined</span>.</>}
        description="A modern Travel CRM and premium concierge in one place. Flights, stays, visas and transport — coordinated by a team that treats every trip like their own."
      >
        <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-95">
          <Link to="/flight-quote">Request a flight quote <ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/holiday-packages">Explore holiday packages</Link>
        </Button>
      </PageHero>

      {/* Why Gateway */}
      <section className="container-page py-20">
        <SectionHeading eyebrow="Why Gateway Travels" title="Serious infrastructure. Quiet expertise." description="We built the operational backbone we always wanted — precise, fast, and consistently pleasant to work with." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: i * 0.05 }}>
              <Card className="p-6 h-full border-border/60 hover:shadow-elegant transition-shadow">
                <span className="grid place-items-center h-10 w-10 rounded-lg bg-gradient-primary text-primary-foreground">
                  <f.icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="mt-5 font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-border/60 bg-gradient-subtle">
        <div className="container-page py-20">
          <SectionHeading eyebrow="Services" title="Everything travel, in one place." description="From a single flight quote to end-to-end holiday planning, Gateway coordinates it." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                <Link to={s.to} className="block h-full group">
                  <Card className="h-full p-6 border-border/60 bg-background hover:border-primary/40 hover:shadow-elegant transition-all duration-300">
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="container-page py-20">
        <SectionHeading eyebrow="Featured Destinations" title="Places our travellers can't stop talking about." />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((d, i) => (
            <motion.div key={d.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to="/holiday-packages" className="block group">
                <Card className="relative overflow-hidden border-border/60 h-56">
                  <div className={`absolute inset-0 bg-gradient-to-br ${d.tone}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{d.region}</p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight">{d.name}</h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                      Plan a trip <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/60 bg-gradient-subtle">
        <div className="container-page py-20">
          <SectionHeading eyebrow="Clients" title="Trusted by travellers and teams." />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.author} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="p-6 h-full border-border/60 bg-background">
                  <Quote className="h-6 w-6 text-primary/40" />
                  <p className="mt-4 text-[15px] leading-relaxed">{t.quote}</p>
                  <div className="mt-6 pt-6 border-t border-border/60 flex items-center gap-3">
                    <span className="grid place-items-center h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground font-semibold">
                      {t.author[0]}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{t.author}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <div className="ml-auto flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page py-20 grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <SectionHeading eyebrow="FAQ" title="Quick answers." description="Anything else? We reply within one business day." />
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="container-page pb-24">
        <Card className="p-10 sm:p-14 border-border/60 shadow-elegant bg-gradient-primary text-primary-foreground text-center overflow-hidden relative">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ready when you are.</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">Start a conversation — we'll tailor a plan to your operation.</p>
          <div className="mt-8 flex justify-center flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary"><Link to="/flight-quote">Get a flight quote</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </div>
        </Card>
      </section>
    </PublicLayout>
  );
}