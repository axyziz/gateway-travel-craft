import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { PAYMENT_METHOD, PAYMENT_STATUS, formatMoney, statusTone, type PaymentStatus } from "@/lib/business";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/payments/")({ component: PaymentsList });

function PaymentsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["payments", search, status],
    queryFn: async () => {
      let q = supabase.from("payments").select("*, invoices(reference, customer_name)").order("payment_date", { ascending: false }).limit(200);
      if (status !== "all") q = q.eq("status", status);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`reference.ilike.${s},external_reference.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <AdminPageHeader title="Payments" description="All recorded payments across invoices." />
      <Card className="p-4 border-border/60 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reference…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | PaymentStatus)}>
          <SelectTrigger className="w-full md:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(PAYMENT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>
      <Card className="border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            )) : (data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={6}>
                <div className="py-12 text-center"><Wallet className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No payments yet.</p></div>
              </TableCell></TableRow>
            ) : data!.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{format(new Date(p.payment_date), "PP")}</TableCell>
                <TableCell className="text-xs">{p.invoice_id && p.invoices ? <Link to="/admin/invoices/$id" params={{ id: p.invoice_id }} className="hover:text-primary font-mono">{p.invoices.reference}</Link> : "—"}</TableCell>
                <TableCell className="text-xs">{PAYMENT_METHOD[p.method]}</TableCell>
                <TableCell><Badge variant="outline" className={`border ${statusTone(p.status)}`}>{PAYMENT_STATUS[p.status]}</Badge></TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatMoney(p.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}