import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeItemTotal, formatMoney, SERVICE_LABELS, type LineItem, type ServiceType } from "@/lib/business";

export function LineItemsEditor({
  items,
  onChange,
  currency = "INR",
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency?: string;
}) {
  const update = (idx: number, patch: Partial<LineItem>) => {
    const next = items.map((it, i) => {
      if (i !== idx) return it;
      const merged = { ...it, ...patch };
      merged.total = computeItemTotal(merged);
      return merged;
    });
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const add = () =>
    onChange([
      ...items,
      { service_type: "flight", description: "", quantity: 1, unit_price: 0, discount: 0, total: 0 },
    ]);

  return (
    <div className="space-y-3">
      <div className="hidden md:grid grid-cols-[140px_1fr_80px_120px_100px_120px_36px] gap-2 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Service</span><span>Description</span><span>Qty</span><span>Unit price</span><span>Discount</span><span className="text-right">Total</span><span></span>
      </div>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-2 md:grid-cols-[140px_1fr_80px_120px_100px_120px_36px] gap-2 items-center">
          <Select value={it.service_type} onValueChange={(v) => update(i, { service_type: v as ServiceType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(SERVICE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input placeholder="Description" value={it.description} onChange={(e) => update(i, { description: e.target.value })} className="col-span-2 md:col-span-1" />
          <Input type="number" min={0} step="0.01" value={it.quantity} onChange={(e) => update(i, { quantity: Number(e.target.value) })} />
          <Input type="number" min={0} step="0.01" value={it.unit_price} onChange={(e) => update(i, { unit_price: Number(e.target.value) })} />
          <Input type="number" min={0} step="0.01" value={it.discount} onChange={(e) => update(i, { discount: Number(e.target.value) })} />
          <p className="text-sm font-medium text-right tabular-nums pr-1">{formatMoney(it.total, currency)}</p>
          <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}><Plus className="h-4 w-4" /> Add item</Button>
    </div>
  );
}