import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { tasks as seedTasks, type Task } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Lucy" }] }),
  component: Tasks,
});

const columns: { id: Task["status"]; title: string }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do" },
  { id: "in_progress", title: "In progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

function Tasks() {
  const [tasks] = useState<Task[]>(seedTasks);
  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Kanban across every project. Filter by priority, project, or assignee."
        actions={<>
          <Button variant="outline"><Filter className="mr-1.5 h-4 w-4" /> Filters</Button>
          <Button><Plus className="mr-1.5 h-4 w-4" /> New task</Button>
        </>}
      />
      <PageBody>
        <Tabs defaultValue="board">
          <TabsList className="bg-secondary/60">
            <TabsTrigger value="board">Kanban</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
          <TabsContent value="board" className="mt-4">
            <div className="grid gap-3 lg:grid-cols-5">
              {columns.map(col => {
                const list = tasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className="rounded-xl border border-border/60 bg-secondary/20 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold">{col.title}<Badge variant="outline" className="h-5 border-border/60 px-1.5 text-[10px]">{list.length}</Badge></div>
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="space-y-2">
                      {list.map(t => <TaskCard key={t.id} t={t} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <Card className="border-border/70 bg-card/70">
              <ul className="divide-y divide-border/60">
                {tasks.map(t => (
                  <li key={t.id} className="flex items-center gap-4 px-4 py-3">
                    <PriorityDot p={t.priority} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground">{t.project} · {t.assignee.name}</div>
                    </div>
                    <Badge variant="outline" className="capitalize">{t.status.replace("_"," ")}</Badge>
                    <span className="w-16 text-right text-xs text-muted-foreground">{t.due}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

function TaskCard({ t }: { t: Task }) {
  return (
    <Card className="border-border/60 bg-card/80 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm">{t.title}</div>
        <PriorityDot p={t.priority} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Badge variant="outline" className="border-border/60 text-[10px]">{t.project}</Badge>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{t.due}</span>
          <Avatar className="h-6 w-6">
            <AvatarFallback className={`text-[10px] ${t.assignee.kind === "agent" ? "bg-primary/20 text-primary" : "bg-secondary"}`}>
              {t.assignee.name.split(" ").map(x=>x[0]).join("").slice(0,2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      {t.progress > 0 && t.progress < 100 && <Progress value={t.progress} className="mt-3 h-1" />}
    </Card>
  );
}

function PriorityDot({ p }: { p: Task["priority"] }) {
  const c = p === "urgent" ? "bg-destructive" : p === "high" ? "bg-warning" : p === "medium" ? "bg-primary" : "bg-muted-foreground";
  const t = p === "urgent" ? "Urgent" : p === "high" ? "High" : p === "medium" ? "Med" : "Low";
  return <span className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"><span className={`h-1.5 w-1.5 rounded-full ${c}`} />{t}</span>;
}
