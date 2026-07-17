import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, TrendingUp, IndianRupee, FileText, Briefcase, Receipt, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney, exportCsv, SERVICE_LABELS } from "@/lib/business";
import { format, subDays, startOfDay } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: Reports,
});

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
] as const;

function Reports() {
  const [range, setRange] = useState<string>("30");
  const days = Number(range);
  const from = useMemo(() => startOfDay(subDays(new Date(), days - 1)), [days]);
  const fromIso = from.toISOString();
  const fromDate = from.toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", range],
    queryFn: async () => {
      const [enqR, quoR, bookR, invR, payR] = await Promise.all([
        supabase.from("enquiries").select("id, service_type, status, created_at").gte("created_at", fromIso),
        supabase.from("quotations").select("id, status, total, created_at").gte("created_at", fromIso),
        supabase.from("bookings").select("id, status, created_at").gte("created_at", fromIso),
        supabase.from("invoices").select("id, status, total, amount_paid, created_at").gte("created_at", fromIso),
        supabase.from("payments").select("id, amount, method, payment_date").gte("payment_date", fromDate),
      ]);
      const enq = enqR.data ?? [];
      const quo = quoR.data ?? [];
      const book = bookR.data ?? [];
      const inv = invR.data ?? [];
      const pay = payR.data ?? [];

      const enqByService: Record<string, number> = {};
      enq.forEach((e) => { enqByService[e.service_type] = (enqByService[e.service_type] ?? 0) + 1; });

      const revenue = pay.reduce((s, p) => s + Number(p.amount), 0);
      const invoiceTotal = inv.reduce((s, i) => s + Number(i.total), 0);
      const outstanding = inv.reduce((s, i) => s + Math.max(0, Number(i.total) - Number(i.amount_paid)), 0);
      const quoValue = quo.reduce((s, q) => s + Number(q.total), 0);

      const dailyRevenue: Record<string, number> = {};
      for (let i = 0; i < days; i++) dailyRevenue[format(subDays(new Date(), i), "MMM dd")] = 0;
      pay.forEach((p) => {
        const k = format(new Date(p.payment_date), "MMM dd");
        if (k in dailyRevenue) dailyRevenue[k] += Number(p.amount);
      });
      const revenueSeries = Object.entries(dailyRevenue).reverse();

      const payMethod: Record<string, number> = {};
      pay.forEach((p) => { payMethod[p.method] = (payMethod[p.method] ?? 0) + Number(p.amount); });

      return {
        enqCount: enq.length,
        enqByService,
        quoCount: quo.length,
        quoValue,
        quoAccepted: quo.filter((q) => q.status === "accepted").length,
        bookCount: book.length,
        invCount: inv.length,
        invoiceTotal,
        revenue,
        outstanding,
        revenueSeries,
        payMethod,
      };
    },
  });

  const maxRev = Math.max(1, ...(data?.revenueSeries.map(([, v]) => v) ?? [1]));

  const exportAll = async () => {
    const [enq, quo, book, inv, pay, cust] = await Promise.all([
      supabase.from("enquiries").select("reference, customer_name, customer_email, customer_phone, service_type, status, created_at").gte("created_at", fromIso).order("created_at"),
      supabase.from("quotations").select("reference, customer_name, status, subtotal, tax, discount, total, valid_until, created_at").gte("created_at", fromIso).order("created_at"),
      supabase.from("bookings").select("reference, customer_name, status, pnr, ticket_number, supplier, created_at").gte("created_at", fromIso).order("created_at"),
      supabase.from("invoices").select("reference, customer_name, status, subtotal, tax, discount, total, amount_paid, due_date, created_at").gte("created_at", fromIso).order("created_at"),
      supabase.from("payments").select("reference, amount, method, status, payment_date, notes").gte("payment_date", fromDate).order("payment_date"),
      supabase.from("customers").select("name, email, phone, enquiry_count, last_enquiry_at, created_at"),
    ]);
    const stamp = format(new Date(), "yyyy-MM-dd");
    if (enq.data?.length) exportCsv(`enquiries-${stamp}`, enq.data, [
      { key: "reference", label: "Reference" }, { key: "customer_name", label: "Customer" },
      { key: "customer_email", label: "Email" }, { key: "customer_phone", label: "Phone" },
      { key: "service_type", label: "Service" }, { key: "status", label: "Status" },
      { key: "created_at", label: "Created" },
    ]);
    if (quo.data?.length) exportCsv(`quotations-${stamp}`, quo.data, [
      { key: "reference", label: "Reference" }, { key: "customer_name", label: "Customer" },
      { key: "status", label: "Status" }, { key: "subtotal", label: "Subtotal" },
      { key: "tax", label: "Tax" }, { key: "discount", label: "Discount" },
      { key: "total", label: "Total" }, { key: "valid_until", label: "Valid Until" },
      { key: "created_at", label: "Created" },
    ]);
    if (book.data?.length) exportCsv(`bookings-${stamp}`, book.data, [
      { key: "reference", label: "Reference" }, { key: "customer_name", label: "Customer" },
      { key: "status", label: "Status" }, { key: "pnr", label: "PNR" },
      { key: "ticket_number", label: "Ticket #" }, { key: "supplier", label: "Supplier" },
      { key: "created_at", label: "Created" },
    ]);
    if (inv.data?.length) exportCsv(`invoices-${stamp}`, inv.data, [
      { key: "reference", label: "Reference" }, { key: "customer_name", label: "Customer" },
      { key: "status", label: "Status" }, { key: "subtotal", label: "Subtotal" },
      { key: "tax", label: "Tax" }, { key: "discount", label: "Discount" },
      { key: "total", label: "Total" }, { key: "amount_paid", label: "Paid" },
      { key: "due_date", label: "Due" }, { key: "created_at", label: "Created" },
    ]);
    if (pay.data?.length) exportCsv(`payments-${stamp}`, pay.data, [
      { key: "reference", label: "Reference" }, { key: "amount", label: "Amount" },
      { key: "method", label: "Method" }, { key: "status", label: "Status" },
      { key: "payment_date", label: "Date" }, { key: "notes", label: "Notes" },
    ]);
    if (cust.data?.length) exportCsv(`customers-${stamp}`, cust.data, [
      { key: "name", label: "Name" }, { key: "email", label: "Email" },
      { key: "phone", label: "Phone" }, { key: "enquiry_count", label: "Enquiries" },
      { key: "last_enquiry_at", label: "Last Enquiry" }, { key: "created_at", label: "Since" },
    ]);
  };

  const cards = [
    { label: "Revenue", value: formatMoney(data?.revenue ?? 0), icon: IndianRupee, tone: "text-emerald-600 dark:text-emerald-400" },
    { label: "Outstanding", value: formatMoney(data?.outstanding ?? 0), icon: Wallet, tone: "text-amber-600 dark:text-amber-400" },
    { label: "Invoiced", value: formatMoney(data?.invoiceTotal ?? 0), icon: Receipt },
    { label: "Quoted", value: formatMoney(data?.quoValue ?? 0), icon: FileText },
    { label: "Enquiries", value: data?.enqCount ?? 0, icon: TrendingUp },
    { label: "Quotations", value: data?.quoCount ?? 0, icon: FileText },
    { label: "Bookings", value: data?.bookCount ?? 0, icon: Briefcase },
    { label: "Invoices", value: data?.invCount ?? 0, icon: Receipt },
  ];

  return (
    <>
      <AdminPageHeader
        title="Reports"
        description="Performance analytics and business insights."
        actions={
          <>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={exportAll} variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 border-border/60">
            <div className="flex items-center justify-between">
              <span className="grid place-items-center h-9 w-9 rounded-lg bg-accent text-primary">
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${c.tone ?? ""}`}>
              {isLoading ? <Skeleton className="h-8 w-24" /> : c.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-6 border-border/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold tracking-tight">Revenue trend</h2>
            <Badge variant="outline" className="text-xs">{RANGES.find((r) => r.value === range)?.label}</Badge>
          </div>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="h-48 flex items-end gap-1">
              {data?.revenueSeries.map(([label, v]) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                  <div className="w-full rounded-t bg-gradient-to-t from-primary/60 to-primary/20 hover:from-primary hover:to-primary/40 transition-colors relative"
                       style={{ height: `${(v / maxRev) * 100}%`, minHeight: v > 0 ? "4px" : "1px" }}>
                    {v > 0 && (
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium tabular-nums bg-foreground text-background px-1.5 py-0.5 rounded whitespace-nowrap">
                        {formatMoney(v)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground text-center">Daily payments received</p>
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="text-base font-semibold tracking-tight mb-4">Enquiries by service</h2>
          <div className="space-y-3">
            {Object.entries(SERVICE_LABELS).map(([key, label]) => {
              const n = data?.enqByService[key] ?? 0;
              const pct = data?.enqCount ? (n / data.enqCount) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="tabular-nums text-muted-foreground">{n}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6 border-border/60">
          <h2 className="text-base font-semibold tracking-tight mb-4">Payments by method</h2>
          {data && Object.keys(data.payMethod).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.payMethod).map(([m, v]) => {
                const pct = (v / data.revenue) * 100;
                return (
                  <div key={m}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{m.replace("_", " ")}</span>
                      <span className="tabular-nums font-medium">{formatMoney(v)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-muted-foreground py-8 text-center">No payments in this period.</p>}
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="text-base font-semibold tracking-tight mb-4">Conversion funnel</h2>
          <div className="space-y-4">
            {[
              { label: "Enquiries", n: data?.enqCount ?? 0 },
              { label: "Quotations sent", n: data?.quoCount ?? 0 },
              { label: "Quotes accepted", n: data?.quoAccepted ?? 0 },
              { label: "Bookings", n: data?.bookCount ?? 0 },
              { label: "Invoices", n: data?.invCount ?? 0 },
            ].map((row, i, arr) => {
              const max = arr[0].n || 1;
              const pct = (row.n / max) * 100;
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-sm w-32 shrink-0">{row.label}</span>
                  <div className="flex-1 h-8 rounded-md bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all flex items-center justify-end pr-2"
                         style={{ width: `${Math.max(pct, 4)}%` }}>
                      <span className="text-xs font-medium text-primary-foreground tabular-nums">{row.n}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}