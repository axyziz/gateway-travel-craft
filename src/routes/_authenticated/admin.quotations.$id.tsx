import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2, Copy, ArrowRight, Printer } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { LineItemsEditor } from "@/components/admin/LineItemsEditor";
import { PrintDocumentDialog } from "@/components/admin/PrintDocument";
import { QUOTATION_STATUS, computeTotals, formatMoney, statusTone, type LineItem, type QuotationStatus } from "@/lib/business";

export const Route = createFileRoute("/_authenticated/admin/quotations/$id")({ component: QuotationDetail });

function QuotationDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [items, setItems] = useState<LineItem[]>([]);
  const [meta, setMeta] = useState({ customer_name: "", customer_email: "", customer_phone: "", customer_id: "" as string | null | "", status: "draft" as QuotationStatus, issue_date: "", valid_until: "", discount: 0, tax: 0, currency: "INR", notes: "", terms: "" });
  const [printOpen, setPrintOpen] = useState(false);

  const { data: quo, isLoading } = useQuery({
    queryKey: ["quotation", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotations").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const { data: initialItems } = useQuery({
    queryKey: ["quotation-items", id],
    queryFn: async () => {
      const { data } = await supabase.from("quotation_items").select("*").eq("quotation_id", id).order("position");
      return data ?? [];
    },
  });
  const { data: customers } = useQuery({
    queryKey: ["customers-lite"],
    queryFn: async () => {
      const { data } = await supabase.from("customers").select("id, name, email, phone").order("name").limit(500);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (quo) setMeta({
      customer_name: quo.customer_name, customer_email: quo.customer_email ?? "", customer_phone: quo.customer_phone ?? "",
      customer_id: quo.customer_id ?? "", status: quo.status, issue_date: quo.issue_date, valid_until: quo.valid_until ?? "",
      discount: Number(quo.discount ?? 0), tax: Number(quo.tax ?? 0), currency: quo.currency, notes: quo.notes ?? "", terms: quo.terms ?? "",
    });
  }, [quo]);
  useEffect(() => {
    if (initialItems) setItems(initialItems.map((r) => ({
      id: r.id, service_type: r.service_type, description: r.description,
      quantity: Number(r.quantity), unit_price: Number(r.unit_price), discount: Number(r.discount), total: Number(r.total),
    })));
  }, [initialItems]);

  const totals = computeTotals(items, meta.discount, meta.tax);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("quotations").update({
        customer_id: meta.customer_id || null,
        customer_name: meta.customer_name, customer_email: meta.customer_email || null, customer_phone: meta.customer_phone || null,
        status: meta.status, issue_date: meta.issue_date, valid_until: meta.valid_until || null,
        discount: meta.discount, tax: meta.tax, subtotal: totals.subtotal, total: totals.total,
        currency: meta.currency, notes: meta.notes || null, terms: meta.terms || null,
      }).eq("id", id);
      if (error) throw error;
      await supabase.from("quotation_items").delete().eq("quotation_id", id);
      if (items.length) {
        const rows = items.map((it, i) => ({
          quotation_id: id, service_type: it.service_type, description: it.description,
          quantity: it.quantity, unit_price: it.unit_price, discount: it.discount, total: it.total, position: i,
        }));
        const { error: e2 } = await supabase.from("quotation_items").insert(rows);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast.success("Quotation saved");
      qc.invalidateQueries({ queryKey: ["quotation", id] });
      qc.invalidateQueries({ queryKey: ["quotation-items", id] });
      qc.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (e: unknown) => toast.error((e as Error)?.message ?? "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("quotations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Deleted"); navigate({ to: "/admin/quotations" }); },
  });

  const duplicate = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("quotations").insert({
        customer_id: meta.customer_id || null,
        customer_name: meta.customer_name, customer_email: meta.customer_email || null, customer_phone: meta.customer_phone || null,
        status: "draft", issue_date: new Date().toISOString().slice(0, 10),
        valid_until: meta.valid_until || null,
        discount: meta.discount, tax: meta.tax, subtotal: totals.subtotal, total: totals.total,
        currency: meta.currency, notes: meta.notes || null, terms: meta.terms || null,
      }).select("id").single();
      if (error) throw error;
      if (items.length) {
        await supabase.from("quotation_items").insert(items.map((it, i) => ({
          quotation_id: data.id, service_type: it.service_type, description: it.description,
          quantity: it.quantity, unit_price: it.unit_price, discount: it.discount, total: it.total, position: i,
        })));
      }
      return data;
    },
    onSuccess: (row) => navigate({ to: "/admin/quotations/$id", params: { id: row.id } }),
  });

  const convert = useMutation({
    mutationFn: async () => {
      const first = items[0];
      const { data, error } = await supabase.from("bookings").insert({
        quotation_id: id, customer_id: meta.customer_id || null,
        customer_name: meta.customer_name, service_type: first?.service_type ?? null,
        amount: totals.total, status: "pending",
      }).select("id").single();
      if (error) throw error;
      await supabase.from("quotations").update({ status: "accepted" as QuotationStatus }).eq("id", id);
      return data;
    },
    onSuccess: (row) => { toast.success("Converted to booking"); navigate({ to: "/admin/bookings/$id", params: { id: row.id } }); },
    onError: () => toast.error("Convert failed"),
  });

  if (isLoading || !quo) return <Skeleton className="h-96 w-full" />;

  return (
    <>
      <div className="mb-4"><Button asChild variant="ghost" size="sm"><Link to="/admin/quotations"><ArrowLeft className="h-4 w-4" /> Back</Link></Button></div>
      <AdminPageHeader
        title={quo.reference}
        description="Line items, totals, and status"
        actions={<div className="flex gap-2">
          <Badge variant="outline" className={`border ${statusTone(meta.status)}`}>{QUOTATION_STATUS[meta.status]}</Badge>
          <Button variant="outline" size="sm" onClick={() => setPrintOpen(true)}><Printer className="h-4 w-4" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => duplicate.mutate()}><Copy className="h-4 w-4" /> Duplicate</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="h-4 w-4" /> Save</Button>
        </div>}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 grid gap-1.5">
                <Label className="text-xs">Existing customer</Label>
                <Select value={meta.customer_id || "none"} onValueChange={(v) => {
                  if (v === "none") { setMeta({ ...meta, customer_id: "" }); return; }
                  const c = customers?.find((x) => x.id === v);
                  setMeta({ ...meta, customer_id: v, customer_name: c?.name ?? meta.customer_name, customer_email: c?.email ?? "", customer_phone: c?.phone ?? "" });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No linked customer —</SelectItem>
                    {(customers ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name} {c.email ? `· ${c.email}` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label className="text-xs">Name</Label><Input value={meta.customer_name} onChange={(e) => setMeta({ ...meta, customer_name: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Email</Label><Input value={meta.customer_email} onChange={(e) => setMeta({ ...meta, customer_email: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Phone</Label><Input value={meta.customer_phone} onChange={(e) => setMeta({ ...meta, customer_phone: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Currency</Label><Input value={meta.currency} onChange={(e) => setMeta({ ...meta, currency: e.target.value.toUpperCase() })} /></div>
            </div>
          </Card>

          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Line items</h3>
            <LineItemsEditor items={items} onChange={setItems} currency={meta.currency} />
            <Separator className="my-6" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label className="text-xs">Notes</Label><Textarea rows={3} value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Terms & conditions</Label><Textarea rows={3} value={meta.terms} onChange={(e) => setMeta({ ...meta, terms: e.target.value })} /></div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Details</h3>
            <div className="mt-4 space-y-3">
              <div><Label className="text-xs">Status</Label>
                <Select value={meta.status} onValueChange={(v) => setMeta({ ...meta, status: v as QuotationStatus })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(QUOTATION_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Issue date</Label><Input type="date" value={meta.issue_date} onChange={(e) => setMeta({ ...meta, issue_date: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Valid until</Label><Input type="date" value={meta.valid_until} onChange={(e) => setMeta({ ...meta, valid_until: e.target.value })} className="mt-1" /></div>
            </div>
          </Card>

          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Totals</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatMoney(totals.subtotal, meta.currency)}</span></div>
              <div className="flex justify-between items-center gap-2"><span className="text-muted-foreground">Discount</span>
                <Input type="number" min={0} step="0.01" value={meta.discount} onChange={(e) => setMeta({ ...meta, discount: Number(e.target.value) })} className="h-8 w-28 text-right" /></div>
              <div className="flex justify-between items-center gap-2"><span className="text-muted-foreground">Tax</span>
                <Input type="number" min={0} step="0.01" value={meta.tax} onChange={(e) => setMeta({ ...meta, tax: Number(e.target.value) })} className="h-8 w-28 text-right" /></div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base"><span>Total</span><span className="tabular-nums">{formatMoney(totals.total, meta.currency)}</span></div>
            </div>
          </Card>

          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Actions</h3>
            <div className="mt-3 space-y-2">
              <Button className="w-full" variant="outline" onClick={() => convert.mutate()} disabled={convert.isPending || items.length === 0}><ArrowRight className="h-4 w-4" /> Convert to booking</Button>
              <Button className="w-full" variant="ghost" onClick={() => { if (confirm("Delete quotation?")) remove.mutate(); }}><Trash2 className="h-4 w-4" /> Delete</Button>
            </div>
          </Card>
        </div>
      </div>

      <PrintDocumentDialog open={printOpen} onOpenChange={setPrintOpen} doc={{
        kind: "Quotation", reference: quo.reference, issue_date: meta.issue_date, valid_until: meta.valid_until || null,
        status: meta.status, customer_name: meta.customer_name, customer_email: meta.customer_email, customer_phone: meta.customer_phone,
        items, subtotal: totals.subtotal, discount: meta.discount, tax: meta.tax, total: totals.total, currency: meta.currency,
        notes: meta.notes, terms: meta.terms,
      }} />
    </>
  );
}