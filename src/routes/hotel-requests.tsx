import { createFileRoute } from "@tanstack/react-router";
import { Hotel } from "lucide-react";
import { ServiceLandingPage } from "@/components/public/ServiceLandingPage";

export const Route = createFileRoute("/hotel-requests")({
  head: () => ({
    meta: [
      { title: "Hotel Requests — Gateway Travels" },
      { name: "description", content: "Negotiated stays worldwide with your preferences priced in." },
    ],
  }),
  component: () => (
    <ServiceLandingPage
      service="hotel"
      eyebrow="Hotels"
      title={<>Stays, <span className="text-gradient">sorted</span>.</>}
      description="Tell us the city and the vibe. We'll return options that fit — with rates you won't find on public sites."
      icon={<Hotel className="h-3 w-3" />}
      bullets={[
        "Direct-contract and consortia rates worldwide",
        "Room categories matched to your travellers",
        "Late check-out, upgrades and perks where available",
        "One invoice, one point of contact",
      ]}
    />
  ),
});