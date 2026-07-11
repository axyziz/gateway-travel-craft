import type { ReactNode } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { motion } from "framer-motion";
import type { ServiceType } from "@/lib/enquiries";
import { Check } from "lucide-react";

export function ServiceLandingPage({
  service,
  eyebrow,
  title,
  description,
  icon,
  bullets,
}: {
  service: ServiceType;
  eyebrow: string;
  title: ReactNode;
  description: string;
  icon: ReactNode;
  bullets: string[];
}) {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-gradient-hero border-b border-border/60">
        <div className="container-page pt-8">
          <Breadcrumbs items={[{ label: "Services", to: "/services" }, { label: eyebrow }]} />
        </div>
        <div className="container-page py-14 sm:py-20 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="grid place-items-center h-5 w-5 rounded-full bg-gradient-primary text-primary-foreground">{icon}</span>
              {eyebrow}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl">{description}</p>
            <ul className="mt-8 space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid place-items-center h-5 w-5 rounded-full bg-accent text-primary shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <EnquiryForm service={service} />
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}