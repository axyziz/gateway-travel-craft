import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Inbox, Settings, User, LifeBuoy, FileText, Briefcase, Receipt, Wallet, BarChart3 } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "CRM",
    items: [
      { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
      { to: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Sales",
    items: [
      { to: "/admin/quotations", label: "Quotations", icon: FileText },
      { to: "/admin/bookings", label: "Bookings", icon: Briefcase },
      { to: "/admin/invoices", label: "Invoices", icon: Receipt },
      { to: "/admin/payments", label: "Payments", icon: Wallet },
    ],
  },
  {
    label: "Insights",
    items: [{ to: "/admin/reports", label: "Reports", icon: BarChart3 }],
  },
  {
    label: "Account",
    items: [
      { to: "/admin/profile", label: "Profile", icon: User },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = "exact" in item && item.exact
                  ? pathname === item.to
                  : pathname === item.to || pathname.startsWith(item.to + "/");
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <a href="mailto:hello@gatewaytravels.example" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50">
          <LifeBuoy className="h-4 w-4" /> Support
        </a>
      </div>
    </aside>
  );
}