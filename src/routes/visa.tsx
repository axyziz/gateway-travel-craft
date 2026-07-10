import { createFileRoute } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
import { StubPage } from "@/lib/publicPage";

export const Route = createFileRoute("/visa")({
  head: () => ({
    meta: [
      { title: "Visa Assistance — Gateway Travels" },
      { name: "description", content: "Guided documentation, checklists, and filing support." },
    ],
  }),
  component: () => (
    <StubPage
      eyebrow="Visa"
      title={<>Paperwork without the panic.</>}
      description="From checklists to submission, we track every document and deadline so you don't have to."
      icon={<Globe2 className="h-6 w-6" />}
      placeholderTitle="Application tracker coming soon."
      placeholderDescription="Country-specific requirements, document uploads, and status tracking are being built next."
    />
  ),
});