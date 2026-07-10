import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/lib/theme-provider";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: Settings,
});

function Settings() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <AdminPageHeader title="Settings" description="Preferences and workspace configuration." />
      <div className="grid gap-4 max-w-2xl">
        <Card className="p-6 border-border/60">
          <h2 className="font-semibold tracking-tight">Appearance</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose how the CRM looks.</p>
          <div className="mt-5 flex items-center justify-between">
            <Label htmlFor="dark-toggle" className="font-normal">Dark mode</Label>
            <Switch
              id="dark-toggle"
              checked={theme === "dark"}
              onCheckedChange={(c) => setTheme(c ? "dark" : "light")}
            />
          </div>
        </Card>
        <Card className="p-6 border-border/60">
          <h2 className="font-semibold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">Notification preferences arrive with the notifications module.</p>
        </Card>
      </div>
    </>
  );
}