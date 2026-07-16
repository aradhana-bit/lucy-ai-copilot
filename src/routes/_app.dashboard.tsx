import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus, Sparkles, Clock, TrendingUp, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { projects, tasks, stats, activity, notifications } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Lucy" }] }),
  component: Dashboard,
});

const chartData = [
  { d: "Mon", hours: 12 }, { d: "Tue", hours: 22 }, { d: "Wed", hours: 18 },
  { d: "Thu", hours: 34 }, { d: "Fri", hours: 28 }, { d: "Sat", hours: 15 }, { d: "Sun", hours: 41 },
];

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Good evening, Ada"
        subtitle="Here's what your workforce moved forward today."
        actions={<>
          <Button variant="outline"><Sparkles className="mr-1.5 h-4 w-4" /> Ask Lucy</Button>
          <Button><Plus className="mr-1.5 h-4 w-4" /> New project</Button>
        </>}
      />
      <PageBody className="space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/70 bg-card/70 p-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-3xl font-semibold tracking-tight">{s.value}</div>
                  <div className="flex items-center gap-1 text-xs text-success"><TrendingUp className="h-3 w-3" /> {s.delta}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/70 bg-card/70 p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Agent activity</div>
                <div className="text-xs text-muted-foreground">Hours run across all projects, last 7 days</div>
              </div>
              <Badge variant="outline" className="border-border/70">+38h vs last week</Badge>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.17 285)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.72 0.17 285)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="oklch(1 0 0 / 6%)" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 260)" fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 260)" fontSize={12} width={30} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.012 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="hours" stroke="oklch(0.72 0.17 285)" strokeWidth={2} fill="url(#fill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-border/70 bg-card/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold">Quick actions</div>
            </div>
            <div className="space-y-2">
              {[
                { t: "Start a new project", d: "Lucy scopes it in seconds", to: "/projects" },
                { t: "Open AI workspace", d: "Talk to your agents", to: "/workspace" },
                { t: "Review today's tasks", d: "7 in-flight items", to: "/tasks" },
                { t: "Generate a doc", d: "Brief, spec, or memo", to: "/documents" },
              ].map((a) => (
                <Link key={a.t} to={a.to} className="group flex items-center justify-between rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5 transition hover:border-border hover:bg-accent">
                  <div>
                    <div className="text-sm font-medium">{a.t}</div>
                    <div className="text-xs text-muted-foreground">{a.d}</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/70 bg-card/70 p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold">Recent projects</div>
              <Link to="/projects" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.slice(0, 4).map((p) => (
                <Link key={p.id} to="/projects/$id" params={{ id: p.id }} className="group rounded-xl border border-border/60 bg-background/40 p-4 transition hover:border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                      <div className="text-sm font-medium">{p.name}</div>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                  <div className="mt-4"><Progress value={p.progress} /></div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{p.progress}%</span><span>{p.updatedAt}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="border-border/70 bg-card/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold">Today's tasks</div>
              <Link to="/tasks" className="text-xs text-muted-foreground hover:text-foreground">All tasks →</Link>
            </div>
            <ul className="space-y-3">
              {tasks.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-start gap-3">
                  <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${t.status === "done" ? "text-success" : "text-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm">{t.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{t.project}</span><span>·</span><span>{t.due}</span>
                    </div>
                  </div>
                  <PriorityDot p={t.priority} />
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/70 bg-card/70 p-6 lg:col-span-2">
            <div className="mb-4 text-sm font-semibold">Recent AI activity</div>
            <ol className="relative space-y-4 border-l border-border/70 pl-6">
              {activity.map((a, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] mt-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary/20"><span className="h-1.5 w-1.5 rounded-full bg-primary" /></span>
                  <div className="text-sm"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></div>
                  <div className="text-[11px] text-muted-foreground"><Clock className="mr-1 inline h-2.5 w-2.5" />{a.t}</div>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="border-border/70 bg-card/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold">Upcoming deadlines</div>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.status !== "done").slice(0,4).map(t => (
                <div key={t.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
                  <div className="text-sm">{t.title}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{t.project}</span>
                    <Badge variant="outline" className="border-border/60">{t.due}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-border/60 pt-4">
              <div className="mb-3 text-sm font-semibold">Notifications</div>
              <div className="space-y-2">
                {notifications.slice(0,3).map(n => (
                  <div key={n.id} className="flex items-start gap-2">
                    <Avatar className="mt-0.5 h-6 w-6"><AvatarFallback className="bg-primary/15 text-[10px] text-primary">L</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium">{n.title}</div>
                      <div className="text-[11px] text-muted-foreground">{n.at}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>
      </PageBody>
    </>
  );
}

function PriorityDot({ p }: { p: string }) {
  const c = p === "urgent" ? "bg-destructive" : p === "high" ? "bg-warning" : p === "medium" ? "bg-primary" : "bg-muted-foreground";
  return <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c}`} />;
}
