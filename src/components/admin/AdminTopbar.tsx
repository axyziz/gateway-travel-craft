import { Bell, Moon, Sun, Search, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/admin/GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/hooks/use-auth";

export function AdminTopbar() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const initials =
    (user?.user_metadata?.full_name as string | undefined)?.slice(0, 2).toUpperCase() ??
    user?.email?.slice(0, 2).toUpperCase() ??
    "GT";

  return (
    <header className="h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <button
        onClick={() => setSearchOpen(true)}
        className="relative flex-1 max-w-md flex items-center gap-2 h-9 px-3 rounded-md bg-muted/40 border border-transparent hover:bg-muted/60 text-left text-sm text-muted-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1">Search customers, quotations, invoices…</span>
        <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-background/60">⌘K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => toast.info("No new notifications")}>
          <Bell className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium truncate">{user?.user_metadata?.full_name ?? "Signed in"}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/profile" })}>
              <UserIcon className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/admin/settings" })}>
              <Settings className="h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate({ to: "/auth", replace: true });
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}