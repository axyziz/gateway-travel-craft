import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Users, Inbox, Clock, CheckCircle2 } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SERVICE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/enquiries";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split("@")[0];

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: async () => {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const [customers, today, pending, completed] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["new", "in_progress", "quoted"]),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["completed", "confirmed"]),
      ]);
      return {
        customers: customers.count ?? 0,
        today: today.count ?? 0,
        pending: pending.count ?? 0,
        completed: completed.count ?? 0,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin", "recent-enquiries"],
    queryFn: async () => {
      const { data } = await supabase.from("enquiries")
        .select("id, reference, service_type, status, customer_name, created_at")
        .order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const cards = [
    { label: "Total customers", value: stats?.customers, icon: Users },
    { label: "Today's enquiries", value: stats?.today, icon: Inbox },
    { label: "Pending enquiries", value: stats?.pending, icon: Clock },
    { label: "Completed enquiries", value: stats?.completed, icon: CheckCircle2 },
  ];

  return (
    <>
      <AdminPageHeader
        title={`Welcome${name ? `, ${name}` : ""}`}
        description="Your operational overview — live from the CRM."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 border-border/60 shadow-card">
              <div className="flex items-center justify-between">
                <span className="grid place-items-center h-9 w-9 rounded-lg bg-accent text-primary">
                  <s.icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {isLoading ? <Skeleton className="h-8 w-16" /> : s.value ?? 0}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Recent enquiries</h2>
              <p className="mt-1 text-sm text-muted-foreground">Latest submissions across all services.</p>
            </div>
            <Link to="/admin/enquiries" className="text-sm text-primary font-medium hover:underline">View all →</Link>
          </div>
          <div className="mt-6 divide-y divide-border/60">
            {(recent ?? []).length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No enquiries yet. Submissions from the public website will appear here.</p>
            ) : (
              recent!.map((e) => (
                <Link key={e.id} to="/admin/enquiries/$id" params={{ id: e.id }} className="flex items-center gap-4 py-3 -mx-2 px-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{e.reference}</span>
                      <Badge variant="outline" className="text-xs">{SERVICE_LABELS[e.service_type as keyof typeof SERVICE_LABELS]}</Badge>
                      <Badge className={`text-xs border ${STATUS_COLORS[e.status] ?? ""}`} variant="outline">{STATUS_LABELS[e.status] ?? e.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium truncate">{e.customer_name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</p>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}