import { useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { formatMoney, SERVICE_LABELS, type LineItem } from "@/lib/business";
import { format } from "date-fns";

export type PrintDoc = {
  kind: "Quotation" | "Invoice";
  reference: string;
  issue_date: string;
  due_date?: string | null;
  valid_until?: string | null;
  status: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  items: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
};

export function PrintDocumentDialog({ open, onOpenChange, doc }: { open: boolean; onOpenChange: (v: boolean) => void; doc: PrintDoc | null }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const style = document.createElement("style");
    style.id = "print-doc-style";
    style.innerHTML = `@media print { body * { visibility: hidden !important; } #print-doc-area, #print-doc-area * { visibility: visible !important; } #print-doc-area { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; } }`;
    document.head.appendChild(style);
    return () => { document.getElementById("print-doc-style")?.remove(); };
  }, [open]);

  if (!doc) return null;
  const currency = doc.currency ?? "INR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border no-print">
          <p className="text-sm font-medium">{doc.kind} preview</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / Save PDF</Button>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <div id="print-doc-area" ref={ref} className="p-8 bg-white text-slate-900 max-h-[75vh] overflow-y-auto text-sm">
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Gateway Travels</h1>
              <p className="mt-1 text-xs text-slate-500">Premium travel management</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">{doc.kind}</p>
              <p className="mt-1 font-mono text-lg font-semibold">{doc.reference}</p>
              <p className="mt-1 text-xs text-slate-500">Issued {format(new Date(doc.issue_date), "PP")}</p>
              {(doc.valid_until || doc.due_date) && (
                <p className="text-xs text-slate-500">{doc.kind === "Quotation" ? "Valid until" : "Due"} {format(new Date((doc.valid_until || doc.due_date)!), "PP")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Billed to</p>
              <p className="mt-1 font-semibold">{doc.customer_name}</p>
              {doc.customer_email && <p className="text-xs text-slate-600">{doc.customer_email}</p>}
              {doc.customer_phone && <p className="text-xs text-slate-600">{doc.customer_phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">Status</p>
              <p className="mt-1 font-medium capitalize">{doc.status}</p>
            </div>
          </div>

          <table className="w-full mt-8 text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="py-2 pr-2">Service</th>
                <th className="py-2 pr-2">Description</th>
                <th className="py-2 pr-2 text-right">Qty</th>
                <th className="py-2 pr-2 text-right">Unit</th>
                <th className="py-2 pr-2 text-right">Discount</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((it, i) => (
                <tr key={i} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-2">{SERVICE_LABELS[it.service_type]}</td>
                  <td className="py-3 pr-2">{it.description}</td>
                  <td className="py-3 pr-2 text-right tabular-nums">{it.quantity}</td>
                  <td className="py-3 pr-2 text-right tabular-nums">{formatMoney(it.unit_price, currency)}</td>
                  <td className="py-3 pr-2 text-right tabular-nums">{formatMoney(it.discount, currency)}</td>
                  <td className="py-3 text-right tabular-nums">{formatMoney(it.total, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <Row label="Subtotal" value={formatMoney(doc.subtotal, currency)} />
              {doc.discount > 0 && <Row label="Discount" value={`− ${formatMoney(doc.discount, currency)}`} />}
              {doc.tax > 0 && <Row label="Tax" value={formatMoney(doc.tax, currency)} />}
              <div className="flex justify-between border-t border-slate-300 pt-2 mt-2 font-semibold text-base">
                <span>Grand Total</span><span className="tabular-nums">{formatMoney(doc.total, currency)}</span>
              </div>
            </div>
          </div>

          {doc.notes && (<><p className="mt-8 text-xs uppercase tracking-wider text-slate-500">Notes</p><p className="mt-1 whitespace-pre-wrap">{doc.notes}</p></>)}
          {doc.terms && (<><p className="mt-6 text-xs uppercase tracking-wider text-slate-500">Terms & Conditions</p><p className="mt-1 whitespace-pre-wrap text-slate-600">{doc.terms}</p></>)}

          <p className="mt-10 text-center text-xs text-slate-400">Thank you for choosing Gateway Travels.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span className="tabular-nums">{value}</span></div>;
}