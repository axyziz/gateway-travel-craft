import { createFileRoute } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { ServiceLandingPage } from "@/components/public/ServiceLandingPage";

export const Route = createFileRoute("/flight-quote")({
  head: () => ({
    meta: [
      { title: "Flight Quote Request — Gateway Travels" },
      { name: "description", content: "Custom fare research from partner carriers, replied by a real specialist." },
    ],
  }),
  component: () => (
    <ServiceLandingPage
      service="flight"
      eyebrow="Flights"
      title={<>Custom fares, <span className="text-gradient">faster</span>.</>}
      description="Skip aggregators. Send your route and dates and our team returns a tailored quote from partner carriers, usually within a few hours."
      icon={<Plane className="h-3 w-3" />}
      bullets={[
        "Access to negotiated corporate and consolidator fares",
        "One-way, round trip, and multi-city itineraries",
        "Cabin, airline and layover preferences honoured",
        "Human replies — no bots, no hidden upsells",
      ]}
    />
  ),
});