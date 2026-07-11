import { createFileRoute } from "@tanstack/react-router";
import { Bus } from "lucide-react";
import { ServiceLandingPage } from "@/components/public/ServiceLandingPage";

export const Route = createFileRoute("/bus-booking")({
  head: () => ({
    meta: [
      { title: "Bus Booking — Gateway Travels" },
      { name: "description", content: "Intercity routes and private charters on trusted operators." },
    ],
  }),
  component: () => (
    <ServiceLandingPage
      service="bus"
      eyebrow="Bus"
      title={<>Intercity, <span className="text-gradient">on your terms</span>.</>}
      description="Seat-level bookings on trusted operators, plus full charters for groups and corporate travel."
      icon={<Bus className="h-3 w-3" />}
      bullets={[
        "Verified operators with real seat maps",
        "Group and school charters, any size",
        "Refund and reschedule support",
        "Consolidated billing for teams",
      ]}
    />
  ),
});