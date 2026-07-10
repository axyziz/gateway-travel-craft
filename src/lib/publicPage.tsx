import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { PageHero } from "@/components/shared/PageHero";
import { PlaceholderSection } from "@/components/shared/PlaceholderSection";

export function StubPage({
  eyebrow,
  title,
  description,
  icon,
  placeholderTitle,
  placeholderDescription,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  icon?: ReactNode;
  placeholderTitle: string;
  placeholderDescription: string;
}) {
  return (
    <PublicLayout>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <PlaceholderSection title={placeholderTitle} description={placeholderDescription} icon={icon} />
    </PublicLayout>
  );
}