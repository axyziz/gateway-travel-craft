import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Building2, Save } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/lib/theme-provider";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: Settings,
});

type Company = {
  id: string; company_name: string; logo_url: string | null;
  phone: string | null; email: string | null; address: string | null; website: string | null;
  gst_number: string | null; invoice_prefix: string; quotation_prefix: string;
  booking_prefix: string; currency: string; timezone: string;
};

function Settings() {
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();
  const [form, setForm] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["company_settings"],
    queryFn: async () => (await supabase.from("company_settings").select("*").limit(1).maybeSingle()).data as Company | null,
  });
  useEffect(() => { if (data) setForm(data); }, [data]);

  const set = <K extends keyof Company>(k: K, v: Company[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    if (!form) return;
    setSaving(true);
    const { error } = await supabase.from("company_settings").update({
      company_name: form.company_name, phone: form.phone, email: form.email,
      address: form.address, website: form.website, gst_number: form.gst_number,
      invoice_prefix: form.invoice_prefix, quotation_prefix: form.quotation_prefix,
      booking_prefix: form.booking_prefix, currency: form.currency, timezone: form.timezone,
    }).eq("id", form.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Company details saved"); qc.invalidateQueries({ queryKey: ["company_settings"] }); }
  };

  return (
    <>
      <AdminPageHeader title="Settings" description="Workspace and appearance configuration." />
      <div className="grid gap-4 max-w-3xl">
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="font-semibold tracking-tight">Company profile</h2>
          </div>
          <p className="text-sm text-muted-foreground">Shown on invoices, quotations, and receipts.</p>
          {isLoading || !form ? (
            <div className="mt-6 space-y-3">
              <Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-20" />
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="cn">Company name</Label>
                  <Input id="cn" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ph">Phone</Label>
                  <Input id="ph" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="em">Email</Label>
                  <Input id="em" type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ws">Website</Label>
                  <Input id="ws" value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="gst">GST / Tax number</Label>
                  <Input id="gst" value={form.gst_number ?? ""} onChange={(e) => set("gst_number", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="addr">Address</Label>
                  <Textarea id="addr" rows={2} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border/60">
                <p className="text-sm font-medium mb-3">Reference prefixes</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="qp">Quotation</Label>
                    <Input id="qp" value={form.quotation_prefix} onChange={(e) => set("quotation_prefix", e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <Label htmlFor="bp">Booking</Label>
                    <Input id="bp" value={form.booking_prefix} onChange={(e) => set("booking_prefix", e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <Label htmlFor="ip">Invoice</Label>
                    <Input id="ip" value={form.invoice_prefix} onChange={(e) => set("invoice_prefix", e.target.value.toUpperCase())} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Prefixes label future references. Existing references are unchanged.</p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={save} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" /> {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </>
          )}
        </Card>

        <Card className="p-6 border-border/60">
          <h2 className="font-semibold tracking-tight">Appearance</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose how the CRM looks.</p>
          <div className="mt-5 flex items-center justify-between">
            <Label htmlFor="dark-toggle" className="font-normal">Dark mode</Label>
            <Switch id="dark-toggle" checked={theme === "dark"} onCheckedChange={(c) => setTheme(c ? "dark" : "light")} />
          </div>
        </Card>
      </div>
    </>
  );
}