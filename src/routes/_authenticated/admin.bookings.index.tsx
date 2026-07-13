import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, Briefcase } from "lucide-react";
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
import { BOOKING_STATUS, SERVICE_LABELS, formatMoney, statusTone, type BookingStatus } from "@/lib/business";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/bookings/")({ component: BookingsList });

function BookingsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | BookingStatus>("all");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", search, status],
    queryFn: async () => {
      let q = supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(200);
      if (status !== "all") q = q.eq("status", status);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`reference.ilike.${s},customer_name.ilike.${s},pnr.ilike.${s},ticket_number.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("bookings").insert({ customer_name: "New customer", status: "pending" }).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => navigate({ to: "/admin/bookings/$id", params: { id: row.id } }),
    onError: () => toast.error("Could not create booking"),
  });

  return (
    <>
      <AdminPageHeader title="Bookings" description="Confirmed sales — track PNRs, tickets and status."
        actions={<Button onClick={() => create.mutate()}><Plus className="h-4 w-4" /> New booking</Button>} />
      <Card className="p-4 border-border/60 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reference, customer, PNR, ticket…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as "all" | BookingStatus)}>
          <SelectTrigger className="w-full md:w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(BOOKING_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>
      <Card className="border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>PNR / Ticket</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booked</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            )) : (data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={7}>
                <div className="py-12 text-center"><Briefcase className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No bookings yet.</p></div>
              </TableCell></TableRow>
            ) : data!.map((b) => (
              <TableRow key={b.id}>
                <TableCell><Link to="/admin/bookings/$id" params={{ id: b.id }} className="font-mono text-xs font-medium hover:text-primary">{b.reference}</Link></TableCell>
                <TableCell className="text-sm font-medium">{b.customer_name}</TableCell>
                <TableCell className="text-xs">{b.service_type ? SERVICE_LABELS[b.service_type] : "—"}</TableCell>
                <TableCell className="text-xs"><p className="font-mono">{b.pnr ?? "—"}</p><p className="text-muted-foreground">{b.ticket_number ?? ""}</p></TableCell>
                <TableCell><Badge variant="outline" className={`border ${statusTone(b.status)}`}>{BOOKING_STATUS[b.status]}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{format(new Date(b.booking_date), "PP")}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatMoney(b.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}