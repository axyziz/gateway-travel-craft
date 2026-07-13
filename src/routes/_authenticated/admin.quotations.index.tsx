import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { QUOTATION_STATUS, formatMoney, statusTone, type QuotationStatus } from "@/lib/business";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/quotations/")({ component: QuotationsList });

function QuotationsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | QuotationStatus>("all");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["quotations", search, status],
    queryFn: async () => {
      let q = supabase.from("quotations").select("*").order("created_at", { ascending: false }).limit(200);
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
      const { data, error } = await supabase.from("quotations").insert({
        customer_name: "New customer",
        status: "draft",
      }).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => navigate({ to: "/admin/quotations/$id", params: { id: row.id } }),
    onError: () => toast.error("Could not create quotation"),
  });

  return (
    <>
      <AdminPageHeader
        title="Quotations"
        description="Draft, send and track quotations across all services."
        actions={<Button onClick={() => create.mutate()} disabled={create.isPending}><Plus className="h-4 w-4" /> New quotation</Button>}
      />
      <Card className="p-4 border-border/60 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reference, customer, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | QuotationStatus)}>
          <SelectTrigger className="w-full md:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(QUOTATION_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : (data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={5}>
                <div className="py-12 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No quotations yet.</p>
                </div>
              </TableCell></TableRow>
            ) : data!.map((q) => (
              <TableRow key={q.id}>
                <TableCell><Link to="/admin/quotations/$id" params={{ id: q.id }} className="font-mono text-xs font-medium hover:text-primary">{q.reference}</Link></TableCell>
                <TableCell><p className="text-sm font-medium">{q.customer_name}</p><p className="text-xs text-muted-foreground">{q.customer_email ?? q.customer_phone ?? ""}</p></TableCell>
                <TableCell><Badge variant="outline" className={`border ${statusTone(q.status)}`}>{QUOTATION_STATUS[q.status]}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{format(new Date(q.issue_date), "PP")}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatMoney(q.total, q.currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}