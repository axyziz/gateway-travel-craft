import { createFileRoute } from "@tanstack/react-router";
import { Car } from "lucide-react";
import { ServiceLandingPage } from "@/components/public/ServiceLandingPage";

export const Route = createFileRoute("/vehicle-rental")({
  head: () => ({
    meta: [
      { title: "Vehicle Rental — Gateway Travels" },
      { name: "description", content: "Airport transfers and multi-day ground transport with a driver." },
    ],
  }),
  component: () => (
    <ServiceLandingPage
      service="vehicle"
      eyebrow="Ground"
      title={<>Move without <span className="text-gradient">friction</span>.</>}
      description="Sedans, SUVs, tempo travellers — booked with a driver who knows the route and the airport."
      icon={<Car className="h-3 w-3" />}
      bullets={[
        "Vetted drivers with local knowledge",
        "Airport transfers, day-hire and multi-day",
        "Clean vehicles, transparent pricing",
        "Priority support while you're on the move",
      ]}
    />
  ),
});