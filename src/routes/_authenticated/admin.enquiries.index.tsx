import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Inbox } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/enquiries";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/enquiries/")({
  component: EnquiriesPage,
});

function EnquiriesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [service, setService] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "enquiries", { search, status, service }],
    queryFn: async () => {
      let q = supabase.from("enquiries")
        .select("id, reference, service_type, status, priority, customer_name, customer_email, customer_phone, travel_date, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (status !== "all") q = q.eq("status", status as never);
      if (service !== "all") q = q.eq("service_type", service as never);
      if (search.trim()) {
        const s = `%${search.trim()}%`;
        q = q.or(`customer_name.ilike.${s},customer_email.ilike.${s},customer_phone.ilike.${s},reference.ilike.${s}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <AdminPageHeader title="Enquiries" description="Every request submitted through the public website." />
      <Card className="p-4 border-border/60 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, phone, reference…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {Object.entries(SERVICE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Travel</TableHead>
              <TableHead className="text-right">Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
              ))
            ) : (data ?? []).length === 0 ? (
              <TableRow><TableCell colSpan={6}>
                <div className="py-12 text-center">
                  <Inbox className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No enquiries match your filters yet.</p>
                </div>
              </TableCell></TableRow>
            ) : (
              data!.map((e) => (
                <TableRow key={e.id} className="cursor-pointer">
                  <TableCell><Link to="/admin/enquiries/$id" params={{ id: e.id }} className="font-mono text-xs text-primary hover:underline">{e.reference}</Link></TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{e.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{e.customer_email ?? e.customer_phone}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline">{SERVICE_LABELS[e.service_type as keyof typeof SERVICE_LABELS]}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={`border ${STATUS_COLORS[e.status] ?? ""}`}>{STATUS_LABELS[e.status] ?? e.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.travel_date ?? "—"}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}