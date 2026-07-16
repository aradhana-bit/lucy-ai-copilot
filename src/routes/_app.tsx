import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderKanban, Bot, ListTodo, Calendar as CalIcon,
  FileText, HardDrive, Bell, CreditCard, User, Settings, LifeBuoy, Shield,
  Search, Sparkles, Plus, Command,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

const nav = [
  { section: "Workspace", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/workspace", label: "AI Workspace", icon: Bot, badge: "Live" },
  ]},
  { section: "Plan", items: [
    { to: "/tasks", label: "Tasks", icon: ListTodo },
    { to: "/calendar", label: "Calendar", icon: CalIcon },
    { to: "/documents", label: "Documents", icon: FileText },
    { to: "/files", label: "Files", icon: HardDrive },
  ]},
  { section: "Account", items: [
    { to: "/notifications", label: "Notifications", icon: Bell },
    { to: "/billing", label: "Billing", icon: CreditCard },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/help", label: "Help Center", icon: LifeBuoy },
    { to: "/admin", label: "Admin", icon: Shield },
  ]},
] as const;

function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-5 text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-semibold leading-none">Lucy</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Team plan</div>
            </div>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {nav.map((group) => (
            <div key={group.section} className="mb-6">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{group.section}</div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
                  return (
                    <li key={item.to}>
                      <Link to={item.to} className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"}`}>
                        <item.icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                        <span className="flex-1">{item.label}</span>
                        {"badge" in item && item.badge && <Badge className="h-4 rounded-full bg-primary/15 px-1.5 text-[10px] text-primary hover:bg-primary/15">{item.badge}</Badge>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-sidebar-border p-3">
          <div className="rounded-xl border border-border/70 bg-card/60 p-3">
            <div className="text-xs font-medium">Agent hours</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-5" style={{ width: "64%" }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>640 / 1,000h</span>
              <Link to="/billing" className="text-primary hover:underline">Upgrade</Link>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search projects, tasks, documents…" className="pl-9 pr-16 bg-secondary/60 border-border/60" />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Command className="mr-0.5 inline h-2.5 w-2.5" />K
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="hidden md:inline-flex"><Plus className="mr-1 h-4 w-4" /> New project</Button>
            <Link to="/notifications" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-secondary/60 transition hover:bg-accent">
              <Bell className="h-4 w-4" />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/60 px-2 py-1.5 transition hover:bg-accent">
                  <Avatar className="h-6 w-6"><AvatarFallback className="bg-primary/20 text-[10px] text-primary">AL</AvatarFallback></Avatar>
                  <span className="hidden text-sm font-medium sm:inline">Ada Lovelace</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Ada Lovelace</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/billing">Billing</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/">Sign out</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
