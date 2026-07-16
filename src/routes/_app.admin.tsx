import { createFileRoute } from "@tanstack/react-router";
import { Users, DollarSign, Bot, Activity, MoreHorizontal } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — Lucy" }] }),
  component: Admin,
});

const chart = Array.from({length: 14}, (_, i) => ({ d: `D${i+1}`, u: 800 + i*35 + Math.round(Math.random()*80), r: 12 + Math.round(Math.random()*8) }));
const usage = [
  { a: "Strategist", h: 412 },{ a: "Researcher", h: 388 },{ a: "Engineer", h: 620 },{ a: "Designer", h: 245 },{ a: "Writer", h: 302 },{ a: "Analyst", h: 178 },
];

const users = [
  { n: "Maya Okafor", e: "maya@northline.co", plan: "Team", ws: "Northline", status: "Active", agents: 6 },
  { n: "Daniel Rhee", e: "daniel@parcelwise.io", plan: "Scale", ws: "Parcelwise", status: "Active", agents: 12 },
  { n: "Priya Nair", e: "priya@meridian.app", plan: "Team", ws: "Meridian", status: "Trial", agents: 4 },
  { n: "Sam Ortega", e: "sam@harbor.dev", plan: "Starter", ws: "Harbor", status: "Active", agents: 2 },
  { n: "Rin Tanaka", e: "rin@quill.md", plan: "Team", ws: "Quill", status: "Suspended", agents: 0 },
];

const logs = [
  { t: "12:04:22", lvl: "info", m: "Deploy #4821 succeeded (agent-runtime v2.14.1)" },
  { t: "12:01:08", lvl: "warn", m: "Rate limit hit on OpenAI ingress for workspace parcelwise" },
  { t: "11:56:44", lvl: "info", m: "Nightly evals passed 42/42" },
  { t: "11:40:12", lvl: "error", m: "Task exec_9f21 exceeded 8m budget — auto-retried" },
];

function Admin() {
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Platform-wide oversight for Lucy operators." />
      <PageBody className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { l: "Users", v: "12,482", d: "+322 this week", i: Users },
            { l: "MRR", v: "$184.2k", d: "+8.4% MoM", i: DollarSign },
            { l: "Agent hours (24h)", v: "38,914", d: "peak 09:00 UTC", i: Bot },
            { l: "Uptime (30d)", v: "99.98%", d: "1 incident", i: Activity },
          ].map(s => (
            <Card key={s.l} className="border-border/70 bg-card/70 p-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground"><span>{s.l}</span><s.i className="h-4 w-4" /></div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.d}</div>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/70 bg-card/70 p-6 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between"><div className="text-sm font-semibold">Daily active users</div><Badge variant="outline" className="border-border/60">Last 14 days</Badge></div>
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={chart}>
                  <CartesianGrid vertical={false} stroke="oklch(1 0 0 / 6%)" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 260)" fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 260)" fontSize={11} width={30} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.012 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="u" stroke="oklch(0.72 0.17 285)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="border-border/70 bg-card/70 p-6">
            <div className="mb-3 text-sm font-semibold">Agent hours by role (7d)</div>
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={usage}>
                  <CartesianGrid vertical={false} stroke="oklch(1 0 0 / 6%)" />
                  <XAxis dataKey="a" tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 260)" fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 260)" fontSize={10} width={30} />
                  <Tooltip contentStyle={{ background: "oklch(0.19 0.012 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="h" fill="oklch(0.72 0.17 285)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/70 bg-card/70 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4"><div className="text-sm font-semibold">User management</div><Button size="sm" variant="outline">Export CSV</Button></div>
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Workspace</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Agents</TableHead><TableHead className="w-8"></TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.e}>
                    <TableCell><div className="font-medium">{u.n}</div><div className="text-xs text-muted-foreground">{u.e}</div></TableCell>
                    <TableCell className="text-muted-foreground">{u.ws}</TableCell>
                    <TableCell><Badge variant="outline">{u.plan}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.status==="Active"?"border-success/30 bg-success/15 text-success":u.status==="Trial"?"border-primary/30 bg-primary/15 text-primary":"border-destructive/30 bg-destructive/15 text-destructive"}>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.agents}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="border-border/70 bg-card/70 p-6">
            <div className="mb-3 text-sm font-semibold">Feature flags</div>
            {[
              { n: "New workspace onboarding", on: true },
              { n: "Analyst v2 (cohorts)", on: true },
              { n: "MCP tool marketplace", on: false },
              { n: "Realtime co-editing", on: false },
              { n: "Public API v2", on: true },
            ].map(f => (
              <div key={f.n} className="flex items-center justify-between border-b border-border/60 py-3 last:border-b-0">
                <div className="text-sm">{f.n}</div>
                <Switch defaultChecked={f.on} />
              </div>
            ))}
          </Card>
        </section>

        <section>
          <Card className="border-border/70 bg-card/70 p-6">
            <div className="mb-3 text-sm font-semibold">System logs</div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4 font-mono text-xs">
              {logs.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-muted-foreground">{l.t}</span>
                  <span className={l.lvl==="error"?"text-destructive":l.lvl==="warn"?"text-warning":"text-success"}>{l.lvl.padEnd(5)}</span>
                  <span>{l.m}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </PageBody>
    </>
  );
}
