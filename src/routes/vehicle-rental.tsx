import { createFileRoute } from "@tanstack/react-router";
import { Car } from "lucide-react";
import { StubPage } from "@/lib/publicPage";

export const Route = createFileRoute("/vehicle-rental")({
  head: () => ({
    meta: [
      { title: "Vehicle Rental — Gateway Travels" },
      { name: "description", content: "Airport transfers and multi-day ground transport." },
    ],
  }),
  component: () => (
    <StubPage
      eyebrow="Ground"
      title={<>Move without friction.</>}
      description="Sedans, SUVs, tempo travellers — booked with a driver who knows the route."
      icon={<Car className="h-6 w-6" />}
      placeholderTitle="Rental catalog coming soon."
      placeholderDescription="Vehicle types, live availability, and per-day pricing are on the roadmap."
    />
  ),
});