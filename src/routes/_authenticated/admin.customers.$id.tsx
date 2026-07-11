import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/enquiries";
import { format, formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/customers/$id")({
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsapp: "", notes: "" });

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        whatsapp: customer.whatsapp ?? "",
        notes: customer.notes ?? "",
      });
    }
  }, [customer]);

  const { data: enquiries } = useQuery({
    queryKey: ["customer-enquiries", id],
    queryFn: async () => {
      const { data } = await supabase.from("enquiries").select("id, reference, service_type, status, created_at, travel_date")
        .eq("customer_id", id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["customer-logs", id],
    queryFn: async () => {
      const { data } = await supabase.from("activity_logs").select("*").eq("customer_id", id).order("created_at", { ascending: false }).limit(30);
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("customers").update({
        name: form.name, email: form.email || null, phone: form.phone || null,
        whatsapp: form.whatsapp || null, notes: form.notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Customer updated"); qc.invalidateQueries({ queryKey: ["customer", id] }); },
    onError: () => toast.error("Could not save changes"),
  });

  if (isLoading || !customer) return <Skeleton className="h-64 w-full" />;

  return (
    <>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm"><Link to="/admin/customers"><ArrowLeft className="h-4 w-4" /> Back to customers</Link></Button>
      </div>
      <AdminPageHeader
        title={customer.name}
        description={`Customer since ${format(new Date(customer.created_at), "PP")}`}
        actions={<Badge variant="secondary">{customer.enquiry_count} enquiries</Badge>}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label className="text-xs">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label className="text-xs">WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
            </div>
            <div className="mt-4 grid gap-1.5"><Label className="text-xs">Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="mt-4"><Button onClick={() => save.mutate()} disabled={save.isPending}><Save className="h-4 w-4" /> Save changes</Button></div>
          </Card>

          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Enquiry history</h3>
            <div className="mt-4 divide-y divide-border/60">
              {(enquiries ?? []).length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">No enquiries.</p>
              ) : enquiries!.map((e) => (
                <Link key={e.id} to="/admin/enquiries/$id" params={{ id: e.id }} className="flex items-center gap-3 py-3 hover:bg-accent/40 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{e.reference}</span>
                      <Badge variant="outline" className="text-xs">{SERVICE_LABELS[e.service_type as keyof typeof SERVICE_LABELS]}</Badge>
                      <Badge variant="outline" className={`text-xs border ${STATUS_COLORS[e.status] ?? ""}`}>{STATUS_LABELS[e.status] ?? e.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Travel: {e.travel_date ?? "—"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6 border-border/60 h-fit">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Timeline</h3>
          <ol className="mt-4 relative border-l border-border/60 ml-2 space-y-4">
            {(logs ?? []).map((l) => (
              <li key={l.id} className="pl-4 relative">
                <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-gradient-primary" />
                <p className="text-sm font-medium capitalize">{l.action.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</p>
              </li>
            ))}
            {(logs ?? []).length === 0 && <p className="text-sm text-muted-foreground pl-4">No activity.</p>}
          </ol>
        </Card>
      </div>
    </>
  );
}