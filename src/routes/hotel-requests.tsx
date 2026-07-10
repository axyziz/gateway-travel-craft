import { createFileRoute } from "@tanstack/react-router";
import { Hotel } from "lucide-react";
import { StubPage } from "@/lib/publicPage";

export const Route = createFileRoute("/hotel-requests")({
  head: () => ({
    meta: [
      { title: "Hotel Requests — Gateway Travels" },
      { name: "description", content: "Negotiated stays worldwide with your preferences priced in." },
    ],
  }),
  component: () => (
    <StubPage
      eyebrow="Hotels"
      title={<>Stays, sorted.</>}
      description="Tell us the city and the vibe. We'll return options that fit — with rates you won't find on public sites."
      icon={<Hotel className="h-6 w-6" />}
      placeholderTitle="Hotel request workflow coming soon."
      placeholderDescription="Structured requests with preferences, occupancy, and comparison views land in the next phase."
    />
  ),
});