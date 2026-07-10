import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHero } from "@/components/shared/PageHero";
import { PlaceholderSection } from "@/components/shared/PlaceholderSection";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Gateway Travels" },
      { name: "description", content: "How Gateway Travels handles your data." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <PageHero eyebrow="Legal" title={<>Privacy Policy</>} description="Last updated: soon." />
      <PlaceholderSection
        title="Full policy coming soon."
        description="We are finalizing the language of our privacy policy with counsel."
      />
    </PublicLayout>
  ),
});