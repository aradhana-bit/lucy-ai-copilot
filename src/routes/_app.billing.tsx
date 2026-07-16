import { createFileRoute } from "@tanstack/react-router";
import { Check, Download } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "Billing — Lucy" }] }),
  component: Billing,
});

const plans = [
  { n: "Starter", p: "$0", f: ["1 project", "3 agents", "50h / mo"], current: false },
  { n: "Team", p: "$79", f: ["Unlimited projects", "All agents", "1,000h / mo", "Priority support"], current: true },
  { n: "Scale", p: "Custom", f: ["Unlimited hours", "SSO, SOC 2", "Dedicated CS"], current: false },
];

const invoices = [
  { id: "INV-00124", date: "Jul 1, 2026", amount: "$79.00", status: "Paid" },
  { id: "INV-00113", date: "Jun 1, 2026", amount: "$79.00", status: "Paid" },
  { id: "INV-00102", date: "May 1, 2026", amount: "$79.00", status: "Paid" },
  { id: "INV-00091", date: "Apr 1, 2026", amount: "$29.00", status: "Paid" },
];

function Billing() {
  return (
    <>
      <PageHeader title="Billing" subtitle="Manage your plan, usage, and invoices." />
      <PageBody className="space-y-6">
        <Card className="border-border/70 bg-card/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Current plan</div>
              <div className="mt-1 flex items-center gap-2 text-2xl font-semibold">Team <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Monthly</Badge></div>
              <div className="mt-1 text-sm text-muted-foreground">Renews Aug 1, 2026 · $79/mo</div>
            </div>
            <div className="flex gap-2"><Button variant="outline">Cancel plan</Button><Button>Upgrade to Scale</Button></div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Agent hours</div><div className="mt-1 text-lg font-semibold">640 / 1,000h</div><Progress value={64} className="mt-2" /></div>
            <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Projects</div><div className="mt-1 text-lg font-semibold">6 / ∞</div><Progress value={6} className="mt-2" /></div>
            <div><div className="text-xs uppercase tracking-widest text-muted-foreground">Team seats</div><div className="mt-1 text-lg font-semibold">3 / 10</div><Progress value={30} className="mt-2" /></div>
          </div>
        </Card>

        <div>
          <div className="mb-3 text-sm font-semibold">Change plan</div>
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map(p => (
              <Card key={p.n} className={`p-6 ${p.current ? "border-primary/60 shadow-glow" : "border-border/70"} bg-card/70`}>
                <div className="flex items-center justify-between"><div className="text-sm font-medium">{p.n}</div>{p.current && <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Current</Badge>}</div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">{p.p}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="mt-4 space-y-2 text-sm">
                  {p.f.map(x => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {x}</li>)}
                </ul>
                <Button className="mt-6 w-full" variant={p.current ? "outline" : "default"} disabled={p.current}>{p.current ? "Current plan" : "Choose plan"}</Button>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold">Invoices</div>
          <Card className="border-border/70 bg-card/70">
            <Table>
              <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
              <TableBody>
                {invoices.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.id}</TableCell>
                    <TableCell className="text-muted-foreground">{i.date}</TableCell>
                    <TableCell className="text-muted-foreground">{i.amount}</TableCell>
                    <TableCell><Badge variant="outline" className="border-success/30 bg-success/15 text-success">{i.status}</Badge></TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
