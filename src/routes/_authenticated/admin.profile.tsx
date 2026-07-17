import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Save } from "lucide-react";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const initialName = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  useEffect(() => { setName(initialName); }, [initialName]);

  const initials = (name || user?.email || "GT").slice(0, 2).toUpperCase();

  const saveName = async () => {
    if (!user) return;
    setSavingName(true);
    const { error: e1 } = await supabase.auth.updateUser({ data: { full_name: name } });
    const { error: e2 } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    setSavingName(false);
    if (e1 || e2) toast.error((e1 ?? e2)!.message);
    else toast.success("Profile updated");
  };

  const savePw = async () => {
    if (pw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (pw !== pw2) { toast.error("Passwords do not match"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSavingPw(false);
    if (error) toast.error(error.message);
    else { toast.success("Password changed"); setPw(""); setPw2(""); }
  };

  return (
    <>
      <AdminPageHeader title="Profile" description="Your account details." />
      <div className="grid gap-4 max-w-2xl">
        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium truncate">{name || "Unnamed user"}</p>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pf-name">Full name</Label>
              <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pf-email">Email</Label>
              <Input id="pf-email" value={user?.email ?? ""} disabled />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={saveName} disabled={savingName || name === initialName}>
              <Save className="h-4 w-4 mr-2" /> {savingName ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-border/60">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h2 className="font-semibold tracking-tight">Change password</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Use at least 8 characters.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pw1">New password</Label>
              <Input id="pw1" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <Label htmlFor="pw2">Confirm password</Label>
              <Input id="pw2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={savePw} disabled={savingPw || !pw}>
              {savingPw ? "Updating…" : "Update password"}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}