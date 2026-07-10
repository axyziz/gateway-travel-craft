import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Gateway Travels" },
      { name: "description", content: "Reach the Gateway Travels team." },
    ],
  }),
  component: Contact,
});

const ITEMS = [
  { icon: Mail, label: "Email", value: "hello@gatewaytravels.example" },
  { icon: Phone, label: "Phone", value: "+00 000 000 0000" },
  { icon: MapPin, label: "Office", value: "By appointment" },
];

function Contact() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Contact"
        title={<>Let's plan something great.</>}
        description="Share a few details and we'll get back within one business day."
      />
      <section className="container-page py-16 grid gap-4 sm:grid-cols-3">
        {ITEMS.map((i) => (
          <Card key={i.label} className="p-6 border-border/60">
            <span className="grid place-items-center h-10 w-10 rounded-lg bg-accent text-primary">
              <i.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{i.label}</p>
            <p className="mt-1 font-medium">{i.value}</p>
          </Card>
        ))}
      </section>
    </PublicLayout>
  );
}