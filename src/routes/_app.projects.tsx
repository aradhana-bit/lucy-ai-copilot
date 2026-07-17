import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, FolderKanban, Loader2, MoreHorizontal } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — Lucy" }] }),
  component: Projects,
});

const STATUS_COLORS: Record<string, string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  planning: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  paused: "bg-muted text-muted-foreground border-border",
  shipped: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  archived: "bg-muted text-muted-foreground border-border",
};

function Projects() {
  const { data: workspace } = useWorkspace();
  const { user } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, status, color, progress, updated_at")
        .eq("workspace_id", workspace!.id)
        .neq("status", "archived")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (input: { name: string; description: string }) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ workspace_id: workspace!.id, name: input.name, description: input.description, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("activity_logs").insert({
        workspace_id: workspace!.id, project_id: data.id, user_id: user!.id,
        kind: "project_created", message: `Created project ${data.name}`,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", workspace?.id] });
      toast.success("Project created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Every startup, product, or initiative you're building with Lucy."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1.5 h-4 w-4" /> New project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create project</DialogTitle></DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  create.mutate({ name: String(fd.get("name")), description: String(fd.get("description") || "") });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required placeholder="Atlas — B2B SaaS launch" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={3} placeholder="What are you building?" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={create.isPending}>
                    {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create project"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <PageBody className="space-y-4">
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl border border-border/60 bg-card/40" />
            ))}
          </div>
        ) : projects?.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-medium">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first project to give Lucy context.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> New project</Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((p) => (
              <Link key={p.id} to="/projects/$id" params={{ id: p.id }}>
                <Card className="group h-full border-border/70 bg-card/70 p-5 transition hover:border-border">
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `${p.color}25`, color: p.color as string }}>
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={`capitalize ${STATUS_COLORS[p.status]}`}>{p.status}</Badge>
                  </div>
                  <div className="mt-4 font-semibold leading-snug">{p.name}</div>
                  <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</div>
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Progress</span><span>{p.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-5" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
