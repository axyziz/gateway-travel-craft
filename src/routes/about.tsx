import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Compass, HeartHandshake, Lightbulb, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHero } from "@/components/shared/PageHero";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

const VALUES = [
  { icon: HeartHandshake, title: "Client-first, always", desc: "We measure success in repeat trips, not one-off bookings." },
  { icon: ShieldCheck, title: "Quiet reliability", desc: "Airports, weather, visas — we anticipate and absorb the chaos." },
  { icon: Lightbulb, title: "Craft over templates", desc: "Every itinerary is authored. No copy-paste, no filler days." },
  { icon: Compass, title: "Curious operators", desc: "We travel, we learn, and we bring what we find back to you." },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Gateway Travels" },
      { name: "description", content: "Who we are, how we work, and what we care about at Gateway Travels." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicLayout>
      <div className="container-page pt-8"><Breadcrumbs items={[{ label: "About" }]} /></div>
      <PageHero
        eyebrow="About Gateway"
        title={<>A travel company built like a <span className="text-gradient">product team</span>.</>}
        description="Gateway pairs travel expertise with software craft — so operators get the tools they deserve and travellers get the experience they expect."
      />
      <section className="container-page py-20 grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionHeading eyebrow="Our story" title="Founded by travellers, refined by operators." />
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>Gateway Travels began as a small desk that answered the phone at unreasonable hours. Word spread — because the answers were good.</p>
            <p>Today we're a growing team that plans thousands of trips a year and builds our own software to run them. Every quote, every itinerary, every follow-up flows through one workspace we've built for ourselves.</p>
            <p>The result: our clients get consistent, thoughtful service — and our team gets to focus on the parts of travel that actually need a human.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 h-full border-border/60 hover:shadow-elegant transition-shadow">
                <span className="grid place-items-center h-10 w-10 rounded-lg bg-accent text-primary">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="border-y border-border/60 bg-gradient-subtle">
        <div className="container-page py-16 grid gap-6 sm:grid-cols-3 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-semibold tracking-tight text-gradient">10k+</p>
            <p className="mt-2 text-sm text-muted-foreground">Trips coordinated</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-semibold tracking-tight text-gradient">60+</p>
            <p className="mt-2 text-sm text-muted-foreground">Countries covered</p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-semibold tracking-tight text-gradient">98%</p>
            <p className="mt-2 text-sm text-muted-foreground">Client retention</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}