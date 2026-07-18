import { createFileRoute, Link, Outlet, useRouterState, useNavigate, redirect } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderKanban, Bot, ListTodo, Calendar as CalIcon,
  FileText, HardDrive, Bell, CreditCard, User, Settings, LifeBuoy, Shield,
  Search, Sparkles, Plus, Command, LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useSession, SessionProvider } from "@/hooks/use-session";
import { toast } from "sonner";
import { CommandPalette, useCommandPalette } from "@/components/app/command-palette";
import { OnboardingDialog } from "@/components/app/onboarding-dialog";
import { identify, resetAnalytics } from "@/lib/analytics";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: () => (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  ),
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
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, email")
        .eq("id", session!.user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: unread } = useQuery({
    queryKey: ["unread-count", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false);
      return count ?? 0;
    },
    refetchInterval: 30_000,
  });

  const [q, setQ] = useState("");
  const palette = useCommandPalette();

  useEffect(() => {
    if (session?.user) identify(session.user.id, { email: session.user.email });
  }, [session?.user]);

  const signOut = async () => {
    resetAnalytics();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  const name = profile?.display_name || session.user.email?.split("@")[0] || "You";
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-5 text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-semibold leading-none">Lucy</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">Workspace</div>
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
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-6">
          <button
            type="button"
            onClick={() => palette.setOpen(true)}
            className="group relative flex w-full max-w-md items-center rounded-md border border-border/60 bg-secondary/60 px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-secondary"
            aria-label="Open command palette"
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="flex-1 truncate">{q || "Search or jump to…"}</span>
            <span className="pointer-events-none ml-2 rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px]">
              <Command className="mr-0.5 inline h-2.5 w-2.5" />K
            </span>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="hidden md:inline-flex">
              <Link to="/projects"><Plus className="mr-1 h-4 w-4" /> New project</Link>
            </Button>
            <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-lg border border-border/60 bg-secondary/60 transition hover:bg-accent">
              <Bell className="h-4 w-4" />
              {unread && unread > 0 ? <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{unread}</span> : null}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/60 px-2 py-1.5 transition hover:bg-accent">
                  <Avatar className="h-6 w-6">
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                    <AvatarFallback className="bg-primary/20 text-[10px] text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/billing">Billing</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
      <OnboardingDialog />
    </div>
  );
}
