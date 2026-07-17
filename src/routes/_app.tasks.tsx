import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Loader2, ListTodo } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Lucy" }] }),
  component: Tasks,
});

const COLS = [
  { key: "backlog", label: "Backlog" },
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-chart-2/15 text-chart-2",
  high: "bg-chart-4/15 text-chart-4",
  urgent: "bg-destructive/15 text-destructive",
};

function Tasks() {
  const { data: workspace } = useWorkspace();
  const { user } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: projects } = useQuery({
    queryKey: ["projects-select", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data } = await supabase.from("projects").select("id, name").eq("workspace_id", workspace!.id).order("updated_at", { ascending: false });
      return data || [];
    },
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("id, title, status, priority, due_at, project_id, progress")
        .eq("workspace_id", workspace!.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (input: { title: string; project_id: string | null; priority: string }) => {
      const { error } = await supabase.from("tasks").insert({
        workspace_id: workspace!.id,
        title: input.title,
        project_id: input.project_id,
        priority: input.priority as any,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", workspace?.id] });
      toast.success("Task created");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const patch: any = { status };
      if (status === "done") patch.completed_at = new Date().toISOString();
      const { error } = await supabase.from("tasks").update(patch).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["tasks", workspace?.id] });
      const prev = qc.getQueryData<any[]>(["tasks", workspace?.id]);
      qc.setQueryData<any[]>(["tasks", workspace?.id], (p) => p?.map((t) => (t.id === id ? { ...t, status } : t)));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", workspace?.id], ctx.prev);
      toast.error("Failed to update task");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks", workspace?.id] }),
  });

  const [dragId, setDragId] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Everything Lucy and your team are shipping."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1.5 h-4 w-4" /> New task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  create.mutate({
                    title: String(fd.get("title")),
                    project_id: String(fd.get("project_id") || "") || null,
                    priority: String(fd.get("priority") || "medium"),
                  });
                }}
                className="space-y-4"
              >
                <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select name="project_id"><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>{projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue="medium"><SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["low","medium","high","urgent"].map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter><Button type="submit" disabled={create.isPending}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <PageBody>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-96 animate-pulse rounded-xl border border-border/60 bg-card/40" />)}</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-5">
            {COLS.map((col) => {
              const items = tasks?.filter((t) => t.status === col.key) || [];
              return (
                <div key={col.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragId) { updateStatus.mutate({ id: dragId, status: col.key }); setDragId(null); } }}
                  className="rounded-xl border border-border/60 bg-card/40 p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{col.label}</div>
                    <span className="text-[10px] text-muted-foreground">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((t) => (
                      <Card
                        key={t.id}
                        draggable
                        onDragStart={() => setDragId(t.id)}
                        className={cn("cursor-grab border-border/60 bg-card p-3 shadow-sm", dragId === t.id && "opacity-50")}
                      >
                        <div className="text-sm font-medium">{t.title}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline" className={cn("capitalize", PRIORITY_COLORS[t.priority])}>{t.priority}</Badge>
                          {t.due_at && <span className="text-[10px] text-muted-foreground">{new Date(t.due_at).toLocaleDateString()}</span>}
                        </div>
                      </Card>
                    ))}
                    {items.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border/50 p-4 text-center text-[11px] text-muted-foreground">Drop tasks here</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tasks?.length === 0 && !isLoading && (
          <Card className="mt-6 border-dashed p-12 text-center">
            <ListTodo className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-medium">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your first task or ask Lucy to plan work for you.</p>
          </Card>
        )}
      </PageBody>
    </>
  );
}
