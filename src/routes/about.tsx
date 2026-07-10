import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { StubPage } from "@/lib/publicPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Gateway Travels" },
      { name: "description", content: "Who we are, how we work, and what we care about at Gateway Travels." },
    ],
  }),
  component: () => (
    <StubPage
      eyebrow="About"
      title={<>A travel company built like a product team.</>}
      description="Gateway pairs travel expertise with software craft — so operators get the tools they deserve and travelers get the experience they expect."
      icon={<Sparkles className="h-6 w-6" />}
      placeholderTitle="Our story is coming."
      placeholderDescription="We're finalizing the details we want to share. In the meantime, reach out and we'll happily walk you through it."
    />
  ),
});