import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ServiceLandingPage } from "@/components/public/ServiceLandingPage";

export const Route = createFileRoute("/holiday-packages")({
  head: () => ({
    meta: [
      { title: "Holiday Packages — Gateway Travels" },
      { name: "description", content: "Curated multi-city itineraries and getaways, planned end-to-end." },
    ],
  }),
  component: () => (
    <ServiceLandingPage
      service="holiday"
      eyebrow="Holidays"
      title={<>Trips worth the <span className="text-gradient">anticipation</span>.</>}
      description="Every itinerary is designed around what you actually enjoy, then coordinated so nothing surprises you at the airport."
      icon={<Sparkles className="h-3 w-3" />}
      bullets={[
        "Custom itineraries — never a rigid template",
        "Curated stays, transfers and experiences",
        "24/7 support while you're on the road",
        "Transparent pricing with no markup surprises",
      ]}
    />
  ),
});