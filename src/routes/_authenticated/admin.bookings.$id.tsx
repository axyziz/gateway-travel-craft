import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BOOKING_STATUS, SERVICE_LABELS, statusTone, type BookingStatus, type ServiceType } from "@/lib/business";

export const Route = createFileRoute("/_authenticated/admin/bookings/$id")({ component: BookingDetail });

function BookingDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [f, setF] = useState({
    customer_name: "", customer_id: "" as string | null | "", service_type: "" as "" | ServiceType,
    status: "pending" as BookingStatus, booking_date: "", travel_date: "",
    supplier: "", pnr: "", ticket_number: "", airline: "", amount: 0, remarks: "",
  });

  const { data: b, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const { data: customers } = useQuery({
    queryKey: ["customers-lite"],
    queryFn: async () => (await supabase.from("customers").select("id, name, email").order("name").limit(500)).data ?? [],
  });

  useEffect(() => { if (b) setF({
    customer_name: b.customer_name, customer_id: b.customer_id ?? "", service_type: (b.service_type ?? "") as "" | ServiceType,
    status: b.status, booking_date: b.booking_date, travel_date: b.travel_date ?? "",
    supplier: b.supplier ?? "", pnr: b.pnr ?? "", ticket_number: b.ticket_number ?? "", airline: b.airline ?? "",
    amount: Number(b.amount ?? 0), remarks: b.remarks ?? "",
  }); }, [b]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bookings").update({
        customer_id: f.customer_id || null, customer_name: f.customer_name,
        service_type: (f.service_type || null) as ServiceType | null,
        status: f.status, booking_date: f.booking_date, travel_date: f.travel_date || null,
        supplier: f.supplier || null, pnr: f.pnr || null, ticket_number: f.ticket_number || null,
        airline: f.airline || null, amount: f.amount, remarks: f.remarks || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["booking", id] }); qc.invalidateQueries({ queryKey: ["bookings"] }); },
    onError: (e: unknown) => toast.error((e as Error)?.message ?? "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("bookings").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); navigate({ to: "/admin/bookings" }); },
  });

  const invoice = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("invoices").insert({
        booking_id: id, quotation_id: b?.quotation_id ?? null, customer_id: f.customer_id || null,
        customer_name: f.customer_name, status: "pending", subtotal: f.amount, total: f.amount,
      }).select("id").single();
      if (error) throw error;
      if (f.amount > 0) {
        await supabase.from("invoice_items").insert({
          invoice_id: data.id, description: `${f.service_type ? SERVICE_LABELS[f.service_type as ServiceType] : "Booking"} — ${b?.reference}`,
          service_type: (f.service_type || null) as ServiceType | null,
          quantity: 1, unit_price: f.amount, discount: 0, total: f.amount, position: 0,
        });
      }
      return data;
    },
    onSuccess: (row) => { toast.success("Invoice created"); navigate({ to: "/admin/invoices/$id", params: { id: row.id } }); },
    onError: () => toast.error("Could not create invoice"),
  });

  if (isLoading || !b) return <Skeleton className="h-96 w-full" />;

  return (
    <>
      <div className="mb-4"><Button asChild variant="ghost" size="sm"><Link to="/admin/bookings"><ArrowLeft className="h-4 w-4" /> Back</Link></Button></div>
      <AdminPageHeader title={b.reference} description="Booking operational details"
        actions={<div className="flex gap-2">
          <Badge variant="outline" className={`border ${statusTone(f.status)}`}>{BOOKING_STATUS[f.status]}</Badge>
          <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="h-4 w-4" /> Save</Button>
        </div>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="p-6 border-border/60 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer & service</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 grid gap-1.5">
              <Label className="text-xs">Existing customer</Label>
              <Select value={f.customer_id || "none"} onValueChange={(v) => {
                if (v === "none") return setF({ ...f, customer_id: "" });
                const c = customers?.find((x) => x.id === v);
                setF({ ...f, customer_id: v, customer_name: c?.name ?? f.customer_name });
              }}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— None —</SelectItem>
                  {(customers ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label className="text-xs">Customer name</Label><Input value={f.customer_name} onChange={(e) => setF({ ...f, customer_name: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">Service</Label>
              <Select value={f.service_type || "none"} onValueChange={(v) => setF({ ...f, service_type: v === "none" ? "" : v as ServiceType })}>
                <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
                <SelectContent><SelectItem value="none">— None —</SelectItem>{Object.entries(SERVICE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label className="text-xs">Booking date</Label><Input type="date" value={f.booking_date} onChange={(e) => setF({ ...f, booking_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">Travel date</Label><Input type="date" value={f.travel_date} onChange={(e) => setF({ ...f, travel_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">Supplier</Label><Input value={f.supplier} onChange={(e) => setF({ ...f, supplier: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">Airline</Label><Input value={f.airline} onChange={(e) => setF({ ...f, airline: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">PNR</Label><Input value={f.pnr} onChange={(e) => setF({ ...f, pnr: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">Ticket number</Label><Input value={f.ticket_number} onChange={(e) => setF({ ...f, ticket_number: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">Amount</Label><Input type="number" min={0} step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} /></div>
          </div>
          <div className="grid gap-1.5"><Label className="text-xs">Remarks</Label><Textarea rows={3} value={f.remarks} onChange={(e) => setF({ ...f, remarks: e.target.value })} /></div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Status</h3>
            <div className="mt-3"><Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as BookingStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(BOOKING_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select></div>
          </Card>
          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Actions</h3>
            <div className="mt-3 space-y-2">
              <Button variant="outline" className="w-full" onClick={() => invoice.mutate()} disabled={invoice.isPending}><ArrowRight className="h-4 w-4" /> Generate invoice</Button>
              {b.quotation_id && <Button asChild variant="ghost" className="w-full"><Link to="/admin/quotations/$id" params={{ id: b.quotation_id }}>View source quotation</Link></Button>}
              <Button variant="ghost" className="w-full" onClick={() => { if (confirm("Delete booking?")) remove.mutate(); }}><Trash2 className="h-4 w-4" /> Delete</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}