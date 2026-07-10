import { createFileRoute } from "@tanstack/react-router";
import { Bus } from "lucide-react";
import { StubPage } from "@/lib/publicPage";

export const Route = createFileRoute("/bus-booking")({
  head: () => ({
    meta: [
      { title: "Bus Booking — Gateway Travels" },
      { name: "description", content: "Intercity routes and private charters." },
    ],
  }),
  component: () => (
    <StubPage
      eyebrow="Bus"
      title={<>Intercity, on your terms.</>}
      description="Seat-level bookings on trusted operators, plus full charters for groups."
      icon={<Bus className="h-6 w-6" />}
      placeholderTitle="Seat selection coming soon."
      placeholderDescription="Live seat maps, operator filters, and group booking flows are being built next."
    />
  ),
});