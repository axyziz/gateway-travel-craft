import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function PlaceholderSection({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <section className="container-page py-16">
      <Card className="p-10 sm:p-14 shadow-card border-border/60 bg-gradient-subtle text-center">
        {icon && (
          <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
            {icon}
          </div>
        )}
        <h3 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{description}</p>}
      </Card>
    </section>
  );
}