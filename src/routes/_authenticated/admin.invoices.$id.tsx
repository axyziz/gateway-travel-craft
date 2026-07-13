import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, Trash2, Printer, Plus } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { LineItemsEditor } from "@/components/admin/LineItemsEditor";
import { PrintDocumentDialog } from "@/components/admin/PrintDocument";
import { INVOICE_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, computeTotals, formatMoney, statusTone, type InvoiceStatus, type LineItem, type PaymentMethod, type PaymentStatus } from "@/lib/business";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/invoices/$id")({ component: InvoiceDetail });

function InvoiceDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [items, setItems] = useState<LineItem[]>([]);
  const [meta, setMeta] = useState({ customer_name: "", customer_email: "", customer_phone: "", customer_id: "" as string | null | "", status: "draft" as InvoiceStatus, issue_date: "", due_date: "", discount: 0, tax: 0, currency: "INR", notes: "", terms: "" });
  const [printOpen, setPrintOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [pay, setPay] = useState({ payment_date: new Date().toISOString().slice(0, 10), method: "cash" as PaymentMethod, amount: 0, external_reference: "", status: "paid" as PaymentStatus, notes: "" });

  const { data: inv, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
  const { data: initialItems } = useQuery({
    queryKey: ["invoice-items", id],
    queryFn: async () => (await supabase.from("invoice_items").select("*").eq("invoice_id", id).order("position")).data ?? [],
  });
  const { data: payments } = useQuery({
    queryKey: ["invoice-payments", id],
    queryFn: async () => (await supabase.from("payments").select("*").eq("invoice_id", id).order("payment_date", { ascending: false })).data ?? [],
  });
  const { data: customers } = useQuery({
    queryKey: ["customers-lite"],
    queryFn: async () => (await supabase.from("customers").select("id, name, email, phone").order("name").limit(500)).data ?? [],
  });

  useEffect(() => { if (inv) setMeta({
    customer_name: inv.customer_name, customer_email: inv.customer_email ?? "", customer_phone: inv.customer_phone ?? "",
    customer_id: inv.customer_id ?? "", status: inv.status, issue_date: inv.issue_date, due_date: inv.due_date ?? "",
    discount: Number(inv.discount ?? 0), tax: Number(inv.tax ?? 0), currency: inv.currency, notes: inv.notes ?? "", terms: inv.terms ?? "",
  }); }, [inv]);
  useEffect(() => { if (initialItems) setItems(initialItems.map((r) => ({
    id: r.id, service_type: r.service_type ?? "flight", description: r.description,
    quantity: Number(r.quantity), unit_price: Number(r.unit_price), discount: Number(r.discount), total: Number(r.total),
  }))); }, [initialItems]);
  useEffect(() => { if (inv) setPay((p) => ({ ...p, amount: Math.max(0, Number(inv.total) - Number(inv.amount_paid)) })); }, [inv, payOpen]);

  const totals = computeTotals(items, meta.discount, meta.tax);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("invoices").update({
        customer_id: meta.customer_id || null, customer_name: meta.customer_name,
        customer_email: meta.customer_email || null, customer_phone: meta.customer_phone || null,
        status: meta.status, issue_date: meta.issue_date, due_date: meta.due_date || null,
        discount: meta.discount, tax: meta.tax, subtotal: totals.subtotal, total: totals.total,
        currency: meta.currency, notes: meta.notes || null, terms: meta.terms || null,
      }).eq("id", id);
      if (error) throw error;
      await supabase.from("invoice_items").delete().eq("invoice_id", id);
      if (items.length) {
        await supabase.from("invoice_items").insert(items.map((it, i) => ({
          invoice_id: id, service_type: it.service_type, description: it.description,
          quantity: it.quantity, unit_price: it.unit_price, discount: it.discount, total: it.total, position: i,
        })));
      }
    },
    onSuccess: () => { toast.success("Invoice saved"); qc.invalidateQueries({ queryKey: ["invoice", id] }); qc.invalidateQueries({ queryKey: ["invoice-items", id] }); qc.invalidateQueries({ queryKey: ["invoices"] }); },
    onError: (e: unknown) => toast.error((e as Error)?.message ?? "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("invoices").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted"); navigate({ to: "/admin/invoices" }); },
  });

  const recordPay = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payments").insert({
        invoice_id: id, customer_id: meta.customer_id || null,
        payment_date: pay.payment_date, method: pay.method, amount: pay.amount,
        external_reference: pay.external_reference || null, status: pay.status, notes: pay.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Payment recorded");
      setPayOpen(false);
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      qc.invalidateQueries({ queryKey: ["invoice-payments", id] });
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (e: unknown) => toast.error((e as Error)?.message ?? "Could not record payment"),
  });

  if (isLoading || !inv) return <Skeleton className="h-96 w-full" />;
  const outstanding = Math.max(0, Number(inv.total) - Number(inv.amount_paid));

  return (
    <>
      <div className="mb-4"><Button asChild variant="ghost" size="sm"><Link to="/admin/invoices"><ArrowLeft className="h-4 w-4" /> Back</Link></Button></div>
      <AdminPageHeader title={inv.reference} description="Invoice line items, totals and payments"
        actions={<div className="flex gap-2">
          <Badge variant="outline" className={`border ${statusTone(meta.status)}`}>{INVOICE_STATUS[meta.status]}</Badge>
          <Button variant="outline" size="sm" onClick={() => setPrintOpen(true)}><Printer className="h-4 w-4" /> PDF</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="h-4 w-4" /> Save</Button>
        </div>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 grid gap-1.5">
                <Label className="text-xs">Existing customer</Label>
                <Select value={meta.customer_id || "none"} onValueChange={(v) => {
                  if (v === "none") return setMeta({ ...meta, customer_id: "" });
                  const c = customers?.find((x) => x.id === v);
                  setMeta({ ...meta, customer_id: v, customer_name: c?.name ?? meta.customer_name, customer_email: c?.email ?? "", customer_phone: c?.phone ?? "" });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {(customers ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
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

          <Card className="p-6 border-border/60">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Payments</h3>
              <Button size="sm" variant="outline" onClick={() => setPayOpen(true)}><Plus className="h-4 w-4" /> Record payment</Button>
            </div>
            <div className="mt-4 divide-y divide-border/60">
              {(payments ?? []).length === 0 ? <p className="py-6 text-sm text-muted-foreground">No payments yet.</p> : payments!.map((p) => (
                <div key={p.id} className="flex items-center gap-4 py-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{p.reference}</span>
                      <Badge variant="outline" className={`text-xs border ${statusTone(p.status)}`}>{PAYMENT_STATUS[p.status]}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{PAYMENT_METHOD[p.method]} · {format(new Date(p.payment_date), "PP")}{p.external_reference ? ` · ${p.external_reference}` : ""}</p>
                  </div>
                  <p className="font-medium tabular-nums">{formatMoney(p.amount, meta.currency)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Details</h3>
            <div className="mt-4 space-y-3">
              <div><Label className="text-xs">Status</Label>
                <Select value={meta.status} onValueChange={(v) => setMeta({ ...meta, status: v as InvoiceStatus })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(INVOICE_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Issue date</Label><Input type="date" value={meta.issue_date} onChange={(e) => setMeta({ ...meta, issue_date: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Due date</Label><Input type="date" value={meta.due_date} onChange={(e) => setMeta({ ...meta, due_date: e.target.value })} className="mt-1" /></div>
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
              <div className="flex justify-between text-xs text-muted-foreground"><span>Paid</span><span className="tabular-nums">{formatMoney(inv.amount_paid, meta.currency)}</span></div>
              <div className="flex justify-between font-medium"><span>Outstanding</span><span className="tabular-nums">{formatMoney(outstanding, meta.currency)}</span></div>
            </div>
          </Card>

          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Actions</h3>
            <div className="mt-3 space-y-2">
              {inv.booking_id && <Button asChild variant="ghost" className="w-full"><Link to="/admin/bookings/$id" params={{ id: inv.booking_id }}>View booking</Link></Button>}
              <Button variant="ghost" className="w-full" onClick={() => { if (confirm("Delete invoice?")) remove.mutate(); }}><Trash2 className="h-4 w-4" /> Delete</Button>
            </div>
          </Card>
        </div>
      </div>

      <PrintDocumentDialog open={printOpen} onOpenChange={setPrintOpen} doc={{
        kind: "Invoice", reference: inv.reference, issue_date: meta.issue_date, due_date: meta.due_date || null,
        status: meta.status, customer_name: meta.customer_name, customer_email: meta.customer_email, customer_phone: meta.customer_phone,
        items, subtotal: totals.subtotal, discount: meta.discount, tax: meta.tax, total: totals.total, currency: meta.currency,
        notes: meta.notes, terms: meta.terms,
      }} />

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label className="text-xs">Date</Label><Input type="date" value={pay.payment_date} onChange={(e) => setPay({ ...pay, payment_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">Method</Label>
              <Select value={pay.method} onValueChange={(v) => setPay({ ...pay, method: v as PaymentMethod })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PAYMENT_METHOD).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label className="text-xs">Amount</Label><Input type="number" min={0} step="0.01" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: Number(e.target.value) })} /></div>
            <div className="grid gap-1.5"><Label className="text-xs">Status</Label>
              <Select value={pay.status} onValueChange={(v) => setPay({ ...pay, status: v as PaymentStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(PAYMENT_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 grid gap-1.5"><Label className="text-xs">Reference number</Label><Input value={pay.external_reference} onChange={(e) => setPay({ ...pay, external_reference: e.target.value })} placeholder="UTR / txn ID" /></div>
            <div className="sm:col-span-2 grid gap-1.5"><Label className="text-xs">Notes</Label><Textarea rows={2} value={pay.notes} onChange={(e) => setPay({ ...pay, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button onClick={() => recordPay.mutate()} disabled={recordPay.isPending}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}