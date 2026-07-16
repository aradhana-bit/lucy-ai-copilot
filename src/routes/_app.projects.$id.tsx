import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Users, FileText, Milestone, MessageSquare, Sparkles, Plus, Clock } from "lucide-react";
import { PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { projects, tasks, documents, activity, agents } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/projects/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Lucy` }] }),
  loader: ({ params }) => {
    const project = projects.find(p => p.id === params.id);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDetail,
  notFoundComponent: () => (
    <PageBody><div className="rounded-2xl border border-border/70 p-10 text-center"><h2 className="text-xl font-semibold">Project not found</h2><p className="mt-2 text-sm text-muted-foreground">It may have been archived or moved.</p><Link to="/projects" className="mt-4 inline-block text-sm text-primary hover:underline">Back to projects</Link></div></PageBody>
  ),
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const projectTasks = tasks.filter(t => t.project.toLowerCase() === project.name.toLowerCase().split(" ")[0]);
  const projectDocs = documents.filter(d => d.project.toLowerCase() === project.name.toLowerCase().split(" ")[0]);

  return (
    <>
      <div className="border-b border-border/60 px-6 py-6 md:px-8">
        <Link to="/projects" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3 w-3" /> Projects</Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: project.color }} />
              <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
              <Badge variant="outline" className="capitalize">{project.status}</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline"><MessageSquare className="mr-1.5 h-4 w-4" /> Comment</Button>
            <Link to="/workspace"><Button><Sparkles className="mr-1.5 h-4 w-4" /> Open AI Workspace</Button></Link>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Progress" value={`${project.progress}%`}><Progress value={project.progress} className="mt-2" /></Metric>
          <Metric label="Agents on task" value={String(project.agents)} />
          <Metric label="Open tasks" value={String(projectTasks.filter(t => t.status !== "done").length)} />
          <Metric label="Last activity" value={project.updatedAt} />
        </div>
      </div>

      <PageBody>
        <Tabs defaultValue="overview">
          <TabsList className="bg-secondary/60">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="border-border/70 bg-card/70 p-6 lg:col-span-2">
              <div className="mb-4 text-sm font-semibold">Milestones</div>
              <div className="space-y-4">
                {[
                  { t: "Positioning finalized", d: "Week 1 · complete", done: true },
                  { t: "Beta scope locked", d: "Week 2 · complete", done: true },
                  { t: "Private beta invite list", d: "Week 3 · in progress", done: false },
                  { t: "Public launch", d: "Week 6 · upcoming", done: false },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 grid h-5 w-5 place-items-center rounded-full ${m.done ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"}`}><Milestone className="h-3 w-3" /></div>
                    <div><div className="text-sm font-medium">{m.t}</div><div className="text-xs text-muted-foreground">{m.d}</div></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="border-border/70 bg-card/70 p-6">
              <div className="mb-4 flex items-center justify-between text-sm font-semibold"><span>Team & agents</span><Users className="h-4 w-4 text-muted-foreground" /></div>
              <div className="space-y-3">
                {[{n:"Ada L.",h:true},{n:"Priya N.",h:true},{n:"Sam O.",h:true}].map(p => (
                  <div key={p.n} className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="bg-secondary text-xs">{p.n.split(" ").map(x=>x[0]).join("")}</AvatarFallback></Avatar><div><div className="text-sm">{p.n}</div><div className="text-xs text-muted-foreground">Human</div></div></div>
                ))}
                {agents.slice(0,3).map(a => (
                  <div key={a.id} className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-full" style={{ background: `${a.color}25`, color: a.color }}><Sparkles className="h-3.5 w-3.5" /></div><div><div className="text-sm">{a.name}</div><div className="text-xs text-muted-foreground">Agent</div></div></div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card className="border-border/70 bg-card/70 p-4">
              <div className="mb-2 flex items-center justify-between"><div className="text-sm font-semibold">Tasks</div><Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" /> Add task</Button></div>
              <ul className="divide-y divide-border/60">
                {projectTasks.length === 0 ? <li className="py-8 text-center text-sm text-muted-foreground">No tasks yet.</li> : projectTasks.map(t => (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <div className="text-sm">{t.title}</div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="capitalize">{t.status.replace("_"," ")}</Badge>
                      <span>{t.due}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6 grid gap-3 sm:grid-cols-2">
            {projectDocs.length === 0 ? <div className="col-span-2 rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">No documents generated yet.</div> : projectDocs.map(d => (
              <Card key={d.id} className="border-border/70 bg-card/70 p-4">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><div className="text-sm font-medium">{d.title}</div></div>
                <div className="mt-2 text-xs text-muted-foreground">{d.kind} · updated {d.updated} by {d.author}</div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <Card className="border-border/70 bg-card/70 p-6">
              <ol className="relative space-y-6 border-l border-border/70 pl-6">
                {[1,2,3,4].map(i => <li key={i}><span className="absolute -left-[9px] grid h-4 w-4 place-items-center rounded-full bg-primary/20"><span className="h-1.5 w-1.5 rounded-full bg-primary" /></span><div className="text-sm font-medium">Milestone {i}</div><div className="text-xs text-muted-foreground">Week {i} · target</div></li>)}
              </ol>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <Card className="border-border/70 bg-card/70 p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {agents.map(a => (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${a.color}25`, color: a.color }}><Sparkles className="h-4 w-4" /></div>
                    <div className="min-w-0"><div className="text-sm font-medium">{a.name}</div><div className="truncate text-xs text-muted-foreground">{a.role}</div></div>
                    <Badge variant="outline" className="ml-auto capitalize">{a.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card className="border-border/70 bg-card/70 p-6">
              <ol className="relative space-y-4 border-l border-border/70 pl-6">
                {activity.map((a, i) => <li key={i} className="relative">
                  <span className="absolute -left-[27px] mt-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary/20"><span className="h-1.5 w-1.5 rounded-full bg-primary" /></span>
                  <div className="text-sm"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
                  <div className="text-[11px] text-muted-foreground"><Clock className="mr-1 inline h-2.5 w-2.5" />{a.t}</div>
                </li>)}
              </ol>
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

function Metric({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {children}
    </div>
  );
}
