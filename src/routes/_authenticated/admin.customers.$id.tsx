import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/enquiries";
import { format, formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QUOTATION_STATUS, BOOKING_STATUS, INVOICE_STATUS, PAYMENT_METHOD, PAYMENT_STATUS,
  formatMoney, statusTone,
} from "@/lib/business";

export const Route = createFileRoute("/_authenticated/admin/customers/$id")({
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", notes: "" });

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        whatsapp: customer.whatsapp ?? "",
        notes: customer.notes ?? "",
      });
    }
  }, [customer]);

  const { data: enquiries } = useQuery({
    queryKey: ["customer-enquiries", id],
    queryFn: async () => {
      const { data } = await supabase.from("enquiries").select("id, reference, service_type, status, created_at, travel_date")
        .eq("customer_id", id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["customer-logs", id],
    queryFn: async () => {
      const { data } = await supabase.from("activity_logs").select("*").eq("customer_id", id).order("created_at", { ascending: false }).limit(30);
      return data ?? [];
    },
  });

  const { data: quotations } = useQuery({
    queryKey: ["customer-quotations", id],
    queryFn: async () => (await supabase.from("quotations")
      .select("id, reference, status, issue_date, total, currency")
      .eq("customer_id", id).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: bookings } = useQuery({
    queryKey: ["customer-bookings", id],
    queryFn: async () => (await supabase.from("bookings")
      .select("id, reference, status, service_type, travel_date, amount")
      .eq("customer_id", id).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: invoices } = useQuery({
    queryKey: ["customer-invoices", id],
    queryFn: async () => (await supabase.from("invoices")
      .select("id, reference, status, issue_date, total, amount_paid, currency")
      .eq("customer_id", id).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: payments } = useQuery({
    queryKey: ["customer-payments", id],
    queryFn: async () => (await supabase.from("payments")
      .select("id, reference, amount, method, status, payment_date, invoice_id, invoices!inner(customer_id, reference)")
      .eq("invoices.customer_id", id).order("payment_date", { ascending: false })).data ?? [],
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("customers").update({
        name: form.name, email: form.email || null, phone: form.phone || null,
        whatsapp: form.whatsapp || null, notes: form.notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Customer updated"); qc.invalidateQueries({ queryKey: ["customer", id] }); },
    onError: () => toast.error("Could not save changes"),
  });

  if (isLoading || !customer) return <Skeleton className="h-64 w-full" />;

  const outstanding = (invoices ?? []).reduce(
    (s, i) => s + Math.max(0, Number(i.total ?? 0) - Number(i.amount_paid ?? 0)), 0);
  const lifetimeValue = (payments ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0);

  return (
    <>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm"><Link to="/admin/customers"><ArrowLeft className="h-4 w-4" /> Back to customers</Link></Button>
      </div>
      <AdminPageHeader
        title={customer.name}
        description={`Customer since ${format(new Date(customer.created_at), "PP")}`}
        actions={<Badge variant="secondary">{customer.enquiry_count} enquiries</Badge>}
      />
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enquiries">Enquiries ({enquiries?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="quotations">Quotations ({quotations?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card className="p-6 border-border/60">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5"><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label className="text-xs">Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label className="text-xs">WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
              </div>
              <div className="mt-4"><Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="h-4 w-4" /> Save changes</Button></div>
            </Card>
            <div className="space-y-4">
              <Card className="p-5 border-border/60">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Lifetime value</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{formatMoney(lifetimeValue)}</p>
              </Card>
              <Card className="p-5 border-border/60">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Outstanding</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatMoney(outstanding)}</p>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="enquiries" className="mt-4">
          <Card className="p-6 border-border/60 divide-y divide-border/60">
            {(enquiries ?? []).length === 0 ? <p className="py-6 text-sm text-muted-foreground">No enquiries.</p> :
              enquiries!.map((e) => (
                <Link key={e.id} to="/admin/enquiries/$id" params={{ id: e.id }} className="flex items-center gap-3 py-3 hover:bg-accent/40 -mx-2 px-2 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{e.reference}</span>
                      <Badge variant="outline" className="text-xs">{SERVICE_LABELS[e.service_type as keyof typeof SERVICE_LABELS]}</Badge>
                      <Badge variant="outline" className={`text-xs border ${STATUS_COLORS[e.status] ?? ""}`}>{STATUS_LABELS[e.status] ?? e.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Travel: {e.travel_date ?? "—"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</p>
                </Link>
              ))}
          </Card>
        </TabsContent>

        <TabsContent value="quotations" className="mt-4">
          <Card className="p-6 border-border/60 divide-y divide-border/60">
            {(quotations ?? []).length === 0 ? <p className="py-6 text-sm text-muted-foreground">No quotations.</p> :
              quotations!.map((q) => (
                <Link key={q.id} to="/admin/quotations/$id" params={{ id: q.id }} className="flex items-center gap-3 py-3 hover:bg-accent/40 -mx-2 px-2 rounded-lg">
                  <span className="font-mono text-xs text-muted-foreground w-32">{q.reference}</span>
                  <Badge variant="outline" className={`border text-xs ${statusTone(q.status)}`}>{QUOTATION_STATUS[q.status]}</Badge>
                  <span className="flex-1 text-xs text-muted-foreground">{format(new Date(q.issue_date), "PP")}</span>
                  <span className="tabular-nums text-sm font-medium">{formatMoney(q.total, q.currency)}</span>
                </Link>
              ))}
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-4">
          <Card className="p-6 border-border/60 divide-y divide-border/60">
            {(bookings ?? []).length === 0 ? <p className="py-6 text-sm text-muted-foreground">No bookings.</p> :
              bookings!.map((b) => (
                <Link key={b.id} to="/admin/bookings/$id" params={{ id: b.id }} className="flex items-center gap-3 py-3 hover:bg-accent/40 -mx-2 px-2 rounded-lg">
                  <span className="font-mono text-xs text-muted-foreground w-32">{b.reference}</span>
                  <Badge variant="outline" className={`border text-xs ${statusTone(b.status)}`}>{BOOKING_STATUS[b.status]}</Badge>
                  <span className="flex-1 text-xs text-muted-foreground">{b.service_type ? SERVICE_LABELS[b.service_type as keyof typeof SERVICE_LABELS] : "—"} · {b.travel_date ?? "—"}</span>
                  <span className="tabular-nums text-sm font-medium">{formatMoney(b.amount)}</span>
                </Link>
              ))}
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card className="p-6 border-border/60 divide-y divide-border/60">
            {(invoices ?? []).length === 0 ? <p className="py-6 text-sm text-muted-foreground">No invoices.</p> :
              invoices!.map((i) => (
                <Link key={i.id} to="/admin/invoices/$id" params={{ id: i.id }} className="flex items-center gap-3 py-3 hover:bg-accent/40 -mx-2 px-2 rounded-lg">
                  <span className="font-mono text-xs text-muted-foreground w-32">{i.reference}</span>
                  <Badge variant="outline" className={`border text-xs ${statusTone(i.status)}`}>{INVOICE_STATUS[i.status]}</Badge>
                  <span className="flex-1 text-xs text-muted-foreground">{format(new Date(i.issue_date), "PP")}</span>
                  <span className="tabular-nums text-sm">{formatMoney(i.amount_paid, i.currency)} <span className="text-muted-foreground">/ {formatMoney(i.total, i.currency)}</span></span>
                </Link>
              ))}
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card className="p-6 border-border/60 divide-y divide-border/60">
            {(payments ?? []).length === 0 ? <p className="py-6 text-sm text-muted-foreground">No payments.</p> :
              payments!.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <span className="font-mono text-xs text-muted-foreground w-32">{p.reference}</span>
                  <Badge variant="outline" className={`border text-xs ${statusTone(p.status)}`}>{PAYMENT_STATUS[p.status]}</Badge>
                  <span className="flex-1 text-xs text-muted-foreground">{PAYMENT_METHOD[p.method]} · {format(new Date(p.payment_date), "PP")}</span>
                  <span className="tabular-nums text-sm font-medium">{formatMoney(p.amount)}</span>
                </div>
              ))}
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card className="p-6 border-border/60">
            <ol className="relative border-l border-border/60 ml-2 space-y-4">
              {(logs ?? []).map((l) => (
                <li key={l.id} className="pl-4 relative">
                  <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-gradient-primary" />
                  <p className="text-sm font-medium capitalize">{l.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</p>
                </li>
              ))}
              {(logs ?? []).length === 0 && <p className="text-sm text-muted-foreground pl-4">No activity yet.</p>}
            </ol>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card className="p-6 border-border/60">
            <Label className="text-xs">Internal notes</Label>
            <Textarea rows={8} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-2" />
            <div className="mt-4"><Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="h-4 w-4" /> Save notes</Button></div>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}