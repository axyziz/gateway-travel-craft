import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHero } from "@/components/shared/PageHero";
import { PlaceholderSection } from "@/components/shared/PlaceholderSection";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Gateway Travels" },
      { name: "description", content: "Terms governing use of Gateway Travels services." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <PageHero eyebrow="Legal" title={<>Terms & Conditions</>} description="Last updated: soon." />
      <PlaceholderSection
        title="Full terms coming soon."
        description="Final terms are being reviewed. Contact us for interim questions."
      />
    </PublicLayout>
  ),
});