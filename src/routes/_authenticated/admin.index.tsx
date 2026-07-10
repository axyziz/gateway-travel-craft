import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Users, Plane, Ticket, TrendingUp } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const STATS = [
  { label: "Active clients", value: "—", icon: Users, delta: "Ready to track" },
  { label: "Open bookings", value: "—", icon: Ticket, delta: "Ready to track" },
  { label: "Flights this month", value: "—", icon: Plane, delta: "Ready to track" },
  { label: "Revenue", value: "—", icon: TrendingUp, delta: "Ready to track" },
];

function Dashboard() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0];

  return (
    <>
      <AdminPageHeader
        title={`Welcome${name ? `, ${name}` : ""}`}
        description="Your operational overview. Business modules will populate these cards next."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5 border-border/60 shadow-card">
              <div className="flex items-center justify-between">
                <span className="grid place-items-center h-9 w-9 rounded-lg bg-accent text-primary">
                  <s.icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.delta}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card className="p-6 border-border/60 lg:col-span-2">
          <h2 className="text-base font-semibold tracking-tight">Recent activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Once business modules are added, this feed will surface bookings, quote requests, and client updates.
          </p>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
        <Card className="p-6 border-border/60">
          <h2 className="text-base font-semibold tracking-tight">Pipeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">A place for your funnel view.</p>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </Card>
      </div>
    </>
  );
}