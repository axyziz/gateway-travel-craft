import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";

type Hit = { id: string; label: string; sub: string; to: string };

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) { setQ(""); setHits([]); }
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits([]); return; }
    let alive = true;
    (async () => {
      const like = `%${term}%`;
      const [cust, enq, quo, book, inv] = await Promise.all([
        supabase.from("customers").select("id, name, email, phone").or(`name.ilike.${like},email.ilike.${like},phone.ilike.${like}`).limit(5),
        supabase.from("enquiries").select("id, reference, customer_name").or(`reference.ilike.${like},customer_name.ilike.${like}`).limit(5),
        supabase.from("quotations").select("id, reference, customer_name").or(`reference.ilike.${like},customer_name.ilike.${like}`).limit(5),
        supabase.from("bookings").select("id, reference, customer_name, pnr").or(`reference.ilike.${like},customer_name.ilike.${like},pnr.ilike.${like}`).limit(5),
        supabase.from("invoices").select("id, reference, customer_name").or(`reference.ilike.${like},customer_name.ilike.${like}`).limit(5),
      ]);
      if (!alive) return;
      const out: Hit[] = [];
      (cust.data ?? []).forEach((c) => out.push({ id: `c-${c.id}`, label: c.name, sub: `Customer · ${c.email ?? c.phone ?? ""}`, to: `/admin/customers/${c.id}` }));
      (enq.data ?? []).forEach((e) => out.push({ id: `e-${e.id}`, label: e.reference, sub: `Enquiry · ${e.customer_name}`, to: `/admin/enquiries/${e.id}` }));
      (quo.data ?? []).forEach((e) => out.push({ id: `q-${e.id}`, label: e.reference, sub: `Quotation · ${e.customer_name}`, to: `/admin/quotations/${e.id}` }));
      (book.data ?? []).forEach((e) => out.push({ id: `b-${e.id}`, label: e.reference, sub: `Booking · ${e.customer_name}${e.pnr ? ` · PNR ${e.pnr}` : ""}`, to: `/admin/bookings/${e.id}` }));
      (inv.data ?? []).forEach((e) => out.push({ id: `i-${e.id}`, label: e.reference, sub: `Invoice · ${e.customer_name}`, to: `/admin/invoices/${e.id}` }));
      setHits(out);
    })();
    return () => { alive = false; };
  }, [q]);

  const go = (to: string) => { onOpenChange(false); navigate({ to }); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search customers, quotations, invoices, bookings, phone…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>{q.length < 2 ? "Type to search…" : "No results."}</CommandEmpty>
        {hits.length > 0 && (
          <CommandGroup heading="Results">
            {hits.map((h) => (
              <CommandItem key={h.id} value={`${h.label} ${h.sub}`} onSelect={() => go(h.to)}>
                <div className="flex flex-col"><span className="font-medium">{h.label}</span><span className="text-xs text-muted-foreground">{h.sub}</span></div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}