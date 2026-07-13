import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ArrowLeft, User, Mail, Phone, MessageSquare, Calendar, Users2, FileText } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/enquiries";
import { format, formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/enquiries/$id")({
  component: EnquiryDetail,
});

function EnquiryDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: enquiry, isLoading } = useQuery({
    queryKey: ["enquiry", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("enquiries").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["enquiry-logs", id],
    queryFn: async () => {
      const { data } = await supabase.from("activity_logs").select("*").eq("enquiry_id", id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: agents } = useQuery({
    queryKey: ["profiles-list"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email");
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("enquiries").update({ status: status as never }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["enquiry", id] });
      qc.invalidateQueries({ queryKey: ["enquiry-logs", id] });
    },
    onError: () => toast.error("Could not update status"),
  });

  const assign = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("enquiries").update({ assigned_to: userId === "unassigned" ? null : userId }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agent assigned");
      qc.invalidateQueries({ queryKey: ["enquiry", id] });
      qc.invalidateQueries({ queryKey: ["enquiry-logs", id] });
    },
    onError: () => toast.error("Could not assign"),
  });

  const convertToQuotation = useMutation({
    mutationFn: async () => {
      if (!enquiry) throw new Error("no enquiry");
      const { data, error } = await supabase.from("quotations").insert({
        enquiry_id: enquiry.id,
        customer_id: enquiry.customer_id,
        customer_name: enquiry.customer_name,
        customer_email: enquiry.customer_email,
        customer_phone: enquiry.customer_phone,
        status: "draft",
      }).select("id").single();
      if (error) throw error;
      await supabase.from("quotation_items").insert({
        quotation_id: data.id,
        service_type: enquiry.service_type,
        description: `${SERVICE_LABELS[enquiry.service_type as keyof typeof SERVICE_LABELS]}${enquiry.travel_date ? ` — travel ${enquiry.travel_date}` : ""}`,
        quantity: 1, unit_price: 0, discount: 0, total: 0, position: 0,
      });
      await supabase.from("enquiries").update({ status: "quoted" as never }).eq("id", id);
      return data;
    },
    onSuccess: (row) => { toast.success("Quotation created"); navigate({ to: "/admin/quotations/$id", params: { id: row.id } }); },
    onError: () => toast.error("Convert failed"),
  });

  if (isLoading || !enquiry) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  }

  const details = (enquiry.details as Record<string, unknown>) ?? {};

  return (
    <>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm"><Link to="/admin/enquiries"><ArrowLeft className="h-4 w-4" /> Back to enquiries</Link></Button>
      </div>
      <AdminPageHeader
        title={enquiry.reference}
        description={`${SERVICE_LABELS[enquiry.service_type as keyof typeof SERVICE_LABELS]} enquiry from ${enquiry.customer_name}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`border ${STATUS_COLORS[enquiry.status] ?? ""}`}>{STATUS_LABELS[enquiry.status] ?? enquiry.status}</Badge>
            <Button size="sm" onClick={() => convertToQuotation.mutate()} disabled={convertToQuotation.isPending}><FileText className="h-4 w-4" /> Convert to quotation</Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info icon={User} label="Name" value={enquiry.customer_name} />
              <Info icon={Mail} label="Email" value={enquiry.customer_email ?? "—"} />
              <Info icon={Phone} label="Phone" value={enquiry.customer_phone ?? "—"} />
              <Info icon={MessageSquare} label="WhatsApp" value={enquiry.customer_whatsapp ?? "—"} />
            </div>
            {enquiry.customer_id && (
              <div className="mt-4"><Button asChild variant="outline" size="sm"><Link to="/admin/customers/$id" params={{ id: enquiry.customer_id }}>View customer profile</Link></Button></div>
            )}
          </Card>

          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trip</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Info icon={Calendar} label="Travel date" value={enquiry.travel_date ?? "—"} />
              <Info icon={Users2} label="Adults" value={String(enquiry.adults ?? 0)} />
              <Info icon={Users2} label="Children / Infants" value={`${enquiry.children ?? 0} / ${enquiry.infants ?? 0}`} />
            </div>

            <Separator className="my-5" />

            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service details</h4>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(details).map(([k, v]) => (
                v == null || v === "" ? null : (
                  <div key={k} className="text-sm">
                    <dt className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</dt>
                    <dd className="font-medium mt-0.5">{String(v)}</dd>
                  </div>
                )
              ))}
            </dl>

            {enquiry.message && (<>
              <Separator className="my-5" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</h4>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
            </>)}
          </Card>

          <Card className="p-6 border-border/60">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activity</h3>
            <ol className="mt-4 relative border-l border-border/60 ml-2 space-y-4">
              {(logs ?? []).map((l) => (
                <li key={l.id} className="pl-4 relative">
                  <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-gradient-primary" />
                  <p className="text-sm font-medium">{formatAction(l.action, l.meta as Record<string, unknown>)}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</p>
                </li>
              ))}
              {(logs ?? []).length === 0 && <p className="text-sm text-muted-foreground pl-4">No activity yet.</p>}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Manage</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <Select value={enquiry.status} onValueChange={(v) => updateStatus.mutate(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Assigned to</label>
                <Select value={enquiry.assigned_to ?? "unassigned"} onValueChange={(v) => assign.mutate(v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {(agents ?? []).map((a) => <SelectItem key={a.id} value={a.id}>{a.full_name ?? a.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
          <Card className="p-5 border-border/60">
            <h3 className="text-sm font-semibold">Metadata</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Reference</dt><dd className="font-mono text-xs">{enquiry.reference}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Service</dt><dd>{SERVICE_LABELS[enquiry.service_type as keyof typeof SERVICE_LABELS]}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Priority</dt><dd className="capitalize">{enquiry.priority}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Created</dt><dd>{format(new Date(enquiry.created_at), "PP p")}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid place-items-center h-8 w-8 rounded-lg bg-accent text-primary shrink-0"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function formatAction(action: string, meta: Record<string, unknown>): string {
  switch (action) {
    case "enquiry_created": return `Enquiry created${meta.service_type ? ` for ${meta.service_type}` : ""}`;
    case "status_changed": return `Status changed: ${meta.from} → ${meta.to}`;
    case "assigned": return `Agent ${meta.to ? "assigned" : "unassigned"}`;
    default: return action.replace(/_/g, " ");
  }
}