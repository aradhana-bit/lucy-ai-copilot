import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, LayoutGrid, List, Search, Filter, MoreHorizontal } from "lucide-react";
import { PageHeader, PageBody, EmptyState } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { projects } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — Lucy" }] }),
  component: Projects,
});

function Projects() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const filtered = projects.filter(p =>
    (status === "all" || p.status === status) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Every product, campaign, and workstream Lucy is helping you build."
        actions={<Button><Plus className="mr-1.5 h-4 w-4" /> New project</Button>}
      />
      <PageBody className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" className="pl-9 bg-secondary/60" />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1 text-xs">
            {["all","active","planning","paused","shipped"].map(s => (
              <button key={s} onClick={() => setStatus(s)} className={`rounded-md px-2.5 py-1 capitalize transition ${status === s ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>{s}</button>
            ))}
          </div>
          <Button size="sm" variant="outline"><Filter className="mr-1 h-3.5 w-3.5" /> More filters</Button>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1">
            <button onClick={() => setView("grid")} className={`grid h-7 w-7 place-items-center rounded-md ${view === "grid" ? "bg-background shadow" : "text-muted-foreground"}`}><LayoutGrid className="h-3.5 w-3.5" /></button>
            <button onClick={() => setView("list")} className={`grid h-7 w-7 place-items-center rounded-md ${view === "list" ? "bg-background shadow" : "text-muted-foreground"}`}><List className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No projects match your filters" description="Try clearing filters or creating a new project." action={<Button><Plus className="mr-1.5 h-4 w-4" /> New project</Button>} />
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => (
              <Link key={p.id} to="/projects/$id" params={{ id: p.id }}>
                <Card className="group h-full border-border/70 bg-card/70 p-5 transition hover:border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                      <div className="text-base font-medium">{p.name}</div>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-5"><Progress value={p.progress} /></div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <StatusBadge s={p.status} />
                    <span>{p.agents} agents · {p.updatedAt}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-border/70 bg-card/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Agents</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link to="/projects/$id" params={{ id: p.id }} className="flex items-center gap-2 font-medium hover:text-primary">
                        <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}
                      </Link>
                    </TableCell>
                    <TableCell><StatusBadge s={p.status} /></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Progress value={p.progress} className="w-32" /><span className="text-xs text-muted-foreground">{p.progress}%</span></div></TableCell>
                    <TableCell className="text-muted-foreground">{p.agents}</TableCell>
                    <TableCell className="text-muted-foreground">{p.updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </PageBody>
    </>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string,string> = {
    active: "bg-success/15 text-success border-success/30",
    planning: "bg-primary/15 text-primary border-primary/30",
    paused: "bg-muted text-muted-foreground border-border",
    shipped: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  };
  return <Badge variant="outline" className={`capitalize ${map[s] || ""}`}>{s}</Badge>;
}
