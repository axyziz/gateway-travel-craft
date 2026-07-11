import { createFileRoute } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
import { ServiceLandingPage } from "@/components/public/ServiceLandingPage";

export const Route = createFileRoute("/visa")({
  head: () => ({
    meta: [
      { title: "Visa Assistance — Gateway Travels" },
      { name: "description", content: "Documentation, checklists, and filing support for your destination." },
    ],
  }),
  component: () => (
    <ServiceLandingPage
      service="visa"
      eyebrow="Visa"
      title={<>Paperwork, <span className="text-gradient">handled</span>.</>}
      description="From checklists to appointment slots, our specialists guide your visa filing end to end so nothing gets returned."
      icon={<Globe2 className="h-3 w-3" />}
      bullets={[
        "Country-specific document checklists",
        "Application form filling and review",
        "Appointment scheduling where required",
        "Tracking until your passport is back in hand",
      ]}
    />
  ),
});