import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const initials = (name || user?.email || "GT").slice(0, 2).toUpperCase();
  return (
    <>
      <AdminPageHeader title="Profile" description="Your account details." />
      <Card className="p-6 border-border/60 max-w-2xl">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium truncate">{name || "Unnamed user"}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pf-name">Full name</Label>
            <Input id="pf-name" defaultValue={name} disabled />
          </div>
          <div>
            <Label htmlFor="pf-email">Email</Label>
            <Input id="pf-email" defaultValue={user?.email ?? ""} disabled />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button disabled>Save changes</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground text-right">Editing arrives with the profile module.</p>
      </Card>
    </>
  );
}