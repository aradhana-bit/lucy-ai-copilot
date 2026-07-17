import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/projects/$id")({
  head: ({ params }) => ({ meta: [{ title: `Project — Lucy` }] }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ["project-tasks", id],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("id, title, status, priority, due_at, progress").eq("project_id", id).order("created_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  const { data: docs } = useQuery({
    queryKey: ["project-docs", id],
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("id, title, kind, updated_at").eq("project_id", id).order("updated_at", { ascending: false }).limit(50);
      return data || [];
    },
  });

  if (!project) {
    return (
      <PageBody>
        <div className="mx-auto max-w-md py-24 text-center">
          <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 font-medium">Project not found</h3>
          <Button asChild className="mt-4" variant="outline"><Link to="/projects"><ArrowLeft className="mr-1 h-4 w-4" /> Back to projects</Link></Button>
        </div>
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title={project.name}
        subtitle={project.description || "No description yet"}
        actions={
          <Button asChild variant="outline" size="sm"><Link to="/projects"><ArrowLeft className="mr-1 h-4 w-4" /> Projects</Link></Button>
        }
      />
      <PageBody>
        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="docs">Documents</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="mt-4">
            <Card className="divide-y divide-border/60 border-border/60">
              {tasks?.length === 0 && <div className="p-6 text-sm text-muted-foreground">No tasks yet.</div>}
              {tasks?.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-4">
                  <Badge variant="outline" className="capitalize">{t.status.replace("_", " ")}</Badge>
                  <div className="flex-1 text-sm">{t.title}</div>
                  <Badge variant="outline" className="capitalize">{t.priority}</Badge>
                </div>
              ))}
            </Card>
          </TabsContent>
          <TabsContent value="docs" className="mt-4">
            <Card className="divide-y divide-border/60 border-border/60">
              {docs?.length === 0 && <div className="p-6 text-sm text-muted-foreground">No documents yet.</div>}
              {docs?.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-4">
                  <Badge variant="outline" className="capitalize">{d.kind}</Badge>
                  <div className="flex-1 text-sm">{d.title}</div>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(d.updated_at), { addSuffix: true })}</span>
                </div>
              ))}
            </Card>
          </TabsContent>
          <TabsContent value="about" className="mt-4">
            <Card className="space-y-2 p-6 text-sm">
              <div><span className="text-muted-foreground">Status: </span><Badge variant="outline" className="capitalize">{project.status}</Badge></div>
              <div><span className="text-muted-foreground">Progress: </span>{project.progress}%</div>
              <div><span className="text-muted-foreground">Created: </span>{formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}</div>
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
