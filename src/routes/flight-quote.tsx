import { createFileRoute } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { StubPage } from "@/lib/publicPage";

export const Route = createFileRoute("/flight-quote")({
  head: () => ({
    meta: [
      { title: "Flight Quote Request — Gateway Travels" },
      { name: "description", content: "Tell us where and when — we'll return the sharpest fare options." },
    ],
  }),
  component: () => (
    <StubPage
      eyebrow="Flights"
      title={<>Custom fares, faster.</>}
      description="Skip aggregators. Send your route and dates — our team returns a tailored quote from partner carriers."
      icon={<Plane className="h-6 w-6" />}
      placeholderTitle="Quote request form arriving soon."
      placeholderDescription="Full request workflow with itinerary preferences, cabin class, and multi-city support is on the way."
    />
  ),
});