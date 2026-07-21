import { createFileRoute } from "@tanstack/react-router";
import { Globe2, FileCheck2, CalendarClock, Send, Stamp } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageHero } from "@/components/shared/PageHero";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/visa")({
  head: () => ({
    meta: [
      { title: "Visa Assistance — Gateway Travels" },
      { name: "description", content: "End-to-end visa documentation, filing and tracking for tourist, business and student visas." },
      { property: "og:title", content: "Visa Assistance — Gateway Travels" },
      { property: "og:description", content: "End-to-end visa documentation, filing and tracking." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Visa,
});

const STEPS = [
  { icon: FileCheck2, title: "Documentation", desc: "Country-specific checklist prepared and reviewed by a specialist." },
  { icon: Send, title: "Application", desc: "Forms filled and reviewed for accuracy before submission." },
  { icon: CalendarClock, title: "Appointment", desc: "Biometrics and interview slots booked where required." },
  { icon: Stamp, title: "Stamping & Delivery", desc: "Tracked until your passport is back in hand." },
];

function Visa() {
  return (
    <PublicLayout>
      <div className="container-page pt-8"><Breadcrumbs items={[{ label: "Services", to: "/services" }, { label: "Visa Assistance" }]} /></div>
      <PageHero
        eyebrow="Visa"
        title={<>Paperwork, <span className="text-gradient">handled</span>.</>}
        description="From checklists to appointment slots, our specialists guide your visa filing end to end so nothing gets returned."
      />
      <section className="container-page py-16">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">A calm, four-step process.</h2>
        <div className="relative mt-10 grid gap-4 md:grid-cols-4">
          <div className="hidden md:block absolute left-0 right-0 top-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          {STEPS.map((s, i) => (
            <Card key={s.title} className="relative p-6 border-border/60">
              <span className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {i + 1}</p>
              <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="container-page pb-20 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Globe2 className="h-3 w-3 text-emerald" /> Any destination
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Start your visa application.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-lg">Tell us your destination and travel dates. A specialist will respond with the exact checklist and next steps within one business day.</p>
        </div>
        <EnquiryForm service="visa" />
      </section>
    </PublicLayout>
  );
}