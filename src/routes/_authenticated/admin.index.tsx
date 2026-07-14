import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Users, Inbox, Clock, CheckCircle2, FileText, Briefcase, Receipt, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SERVICE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/enquiries";
import { formatMoney, PAYMENT_METHOD } from "@/lib/business";
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
      const [customers, today, pending, completed, quoTotal, quoPending, bookConf, invPending, todayPayments] = await Promise.all([
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["new", "in_progress", "quoted"]),
        supabase.from("enquiries").select("id", { count: "exact", head: true }).in("status", ["completed", "confirmed"]),
        supabase.from("quotations").select("id", { count: "exact", head: true }),
        supabase.from("quotations").select("id", { count: "exact", head: true }).in("status", ["draft", "sent"]),
        supabase.from("bookings").select("id", { count: "exact", head: true }).in("status", ["confirmed", "issued"]),
        supabase.from("invoices").select("id", { count: "exact", head: true }).in("status", ["draft", "pending"]),
        supabase.from("payments").select("amount").gte("payment_date", startOfDay.toISOString().slice(0, 10)),
      ]);
      const { data: outstandingRows } = await supabase.from("invoices")
        .select("total, amount_paid").in("status", ["draft", "pending"]);
      const outstanding = (outstandingRows ?? []).reduce(
        (s, r) => s + Math.max(0, Number(r.total ?? 0) - Number(r.amount_paid ?? 0)), 0);
      return {
        customers: customers.count ?? 0,
        today: today.count ?? 0,
        pending: pending.count ?? 0,
        completed: completed.count ?? 0,
        quoTotal: quoTotal.count ?? 0,
        quoPending: quoPending.count ?? 0,
        bookConf: bookConf.count ?? 0,
        invPending: invPending.count ?? 0,
        todayRevenue: (todayPayments.data ?? []).reduce((s, p) => s + Number(p.amount), 0),
        outstanding,
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

  const { data: recentPayments } = useQuery({
    queryKey: ["admin", "recent-payments"],
    queryFn: async () => (await supabase.from("payments")
      .select("id, reference, amount, method, payment_date, invoices(reference, customer_name)")
      .order("payment_date", { ascending: false }).limit(6)).data ?? [],
  });

  const cards = [
    { label: "Total customers", value: stats?.customers, icon: Users },
    { label: "Today's enquiries", value: stats?.today, icon: Inbox },
    { label: "Pending enquiries", value: stats?.pending, icon: Clock },
    { label: "Completed enquiries", value: stats?.completed, icon: CheckCircle2 },
    { label: "Total quotations", value: stats?.quoTotal, icon: FileText },
    { label: "Pending quotations", value: stats?.quoPending, icon: FileText },
    { label: "Confirmed bookings", value: stats?.bookConf, icon: Briefcase },
    { label: "Invoices pending", value: stats?.invPending, icon: Receipt },
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

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Today's revenue</h2>
              <p className="mt-1 text-sm text-muted-foreground">Payments recorded today.</p>
            </div>
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-accent text-primary"><Wallet className="h-4 w-4" /></span>
          </div>
          <p className="mt-6 text-4xl font-semibold tracking-tight tabular-nums">
            {isLoading ? <Skeleton className="h-10 w-40" /> : formatMoney(stats?.todayRevenue ?? 0)}
          </p>
          <div className="mt-6 pt-6 border-t border-border/60">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Outstanding payments</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {isLoading ? <Skeleton className="h-7 w-32" /> : formatMoney(stats?.outstanding ?? 0)}
            </p>
          </div>
        </Card>
        <Card className="p-6 border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Recent payments</h2>
            </div>
            <Link to="/admin/payments" className="text-sm text-primary font-medium hover:underline">View all →</Link>
          </div>
          <div className="mt-4 divide-y divide-border/60">
            {(recentPayments ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : recentPayments!.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.invoices?.customer_name ?? p.reference}</p>
                  <p className="text-xs text-muted-foreground">{PAYMENT_METHOD[p.method]} · {formatDistanceToNow(new Date(p.payment_date), { addSuffix: true })}</p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatMoney(p.amount)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}