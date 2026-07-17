import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, FolderKanban, ListTodo, FileText, ArrowUpRight, Sparkles } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Lucy" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: workspace } = useWorkspace();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const [projects, tasksDone, tasksOpen, docs, convos] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", workspace!.id).neq("status", "archived"),
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspace!.id).eq("status", "done"),
        supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspace!.id).neq("status", "done"),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("workspace_id", workspace!.id),
        supabase.from("conversations").select("id", { count: "exact", head: true }).eq("workspace_id", workspace!.id),
      ]);
      return {
        projects: projects.count ?? 0,
        tasksDone: tasksDone.count ?? 0,
        tasksOpen: tasksOpen.count ?? 0,
        docs: docs.count ?? 0,
        convos: convos.count ?? 0,
      };
    },
  });

  const { data: recentProjects } = useQuery({
    queryKey: ["recent-projects", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name, description, status, progress, color, updated_at").eq("workspace_id", workspace!.id).order("updated_at", { ascending: false }).limit(4);
      return data || [];
    },
  });

  const { data: activity } = useQuery({
    queryKey: ["activity", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data } = await supabase.from("activity_logs").select("id, kind, message, created_at").eq("workspace_id", workspace!.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });

  const cards = [
    { label: "Active projects", value: stats?.projects ?? 0, icon: FolderKanban },
    { label: "Tasks shipped", value: stats?.tasksDone ?? 0, icon: ListTodo },
    { label: "Open tasks", value: stats?.tasksOpen ?? 0, icon: ListTodo },
    { label: "Documents", value: stats?.docs ?? 0, icon: FileText },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Here's what's happening across your workspace today."
        actions={<Button asChild><Link to="/workspace"><Sparkles className="mr-1.5 h-4 w-4" /> Chat with Lucy</Link></Button>}
      />
      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.label} className="border-border/70 bg-card/70 p-5">
              <div className="flex items-center justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><c.icon className="h-4 w-4" /></div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/70 bg-card/70 p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-medium">Recent projects</div>
              <Button asChild variant="ghost" size="sm"><Link to="/projects">All <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button>
            </div>
            {recentProjects?.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No projects yet. <Link to="/projects" className="text-primary hover:underline">Create one</Link>.
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects?.map((p) => (
                  <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3 transition hover:bg-secondary/60">
                    <div className="grid h-8 w-8 place-items-center rounded-md" style={{ background: `${p.color}25`, color: p.color as string }}>
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{p.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{p.description}</div>
                    </div>
                    <div className="hidden w-32 md:block">
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-gradient-to-r from-primary to-chart-5" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{p.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="border-border/70 bg-card/70 p-5">
            <div className="mb-4 font-medium">Recent activity</div>
            {activity?.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No activity yet.</div>
            ) : (
              <ol className="space-y-3 text-sm">
                {activity?.map((a) => (
                  <li key={a.id} className="flex gap-2">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <div>{a.message}</div>
                      <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </PageBody>
    </>
  );
}
