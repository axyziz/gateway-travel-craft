import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Receipt } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { INVOICE_STATUS, formatMoney, statusTone, type InvoiceStatus } from "@/lib/business";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/invoices/")({ component: InvoicesList });

function InvoicesList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | InvoiceStatus>("all");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", search, status],
    queryFn: async () => {
      let q = supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(200);
      if (status !== "all") q = q.eq("status", status);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`reference.ilike.${s},customer_name.ilike.${s},customer_email.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("invoices").insert({ customer_name: "New customer", status: "draft" }).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => navigate({ to: "/admin/invoices/$id", params: { id: row.id } }),
    onError: () => toast.error("Could not create invoice"),
  });

  return (
    <>
      <AdminPageHeader title="Invoices" description="Bill customers and track payments."
        actions={<Button onClick={() => create.mutate()}><Plus className="h-4 w-4" /> New invoice</Button>} />
      <Card className="p-4 border-border/60 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reference, customer, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | InvoiceStatus)}>
          <SelectTrigger className="w-full md:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(INVOICE_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>
      <Card className="border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Paid / Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            )) : (data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={6}>
                <div className="py-12 text-center"><Receipt className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No invoices yet.</p></div>
              </TableCell></TableRow>
            ) : data!.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell><Link to="/admin/invoices/$id" params={{ id: inv.id }} className="font-mono text-xs font-medium hover:text-primary">{inv.reference}</Link></TableCell>
                <TableCell className="text-sm font-medium">{inv.customer_name}</TableCell>
                <TableCell><Badge variant="outline" className={`border ${statusTone(inv.status)}`}>{INVOICE_STATUS[inv.status]}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{format(new Date(inv.issue_date), "PP")}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{inv.due_date ? format(new Date(inv.due_date), "PP") : "—"}</TableCell>
                <TableCell className="text-right tabular-nums text-sm">{formatMoney(inv.amount_paid, inv.currency)} <span className="text-muted-foreground">/ {formatMoney(inv.total, inv.currency)}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}