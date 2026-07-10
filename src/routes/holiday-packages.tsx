import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { StubPage } from "@/lib/publicPage";

export const Route = createFileRoute("/holiday-packages")({
  head: () => ({
    meta: [
      { title: "Holiday Packages — Gateway Travels" },
      { name: "description", content: "Curated multi-city itineraries and getaways, planned end-to-end." },
    ],
  }),
  component: () => (
    <StubPage
      eyebrow="Holidays"
      title={<>Trips worth the anticipation.</>}
      description="Every itinerary is designed around what you actually enjoy, then coordinated so nothing surprises you at the airport."
      icon={<Sparkles className="h-6 w-6" />}
      placeholderTitle="Package catalog coming soon."
      placeholderDescription="Browsing and filtering across curated packages is being built in the next phase."
    />
  ),
});