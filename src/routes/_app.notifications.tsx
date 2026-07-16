import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCheck, Bell, Bot, CreditCard, Users, Settings as SettingsIcon } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notifications as seed } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Lucy" }] }),
  component: Notifications,
});

const iconMap = { agent: Bot, billing: CreditCard, team: Users, system: SettingsIcon };

function Notifications() {
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "unread" ? items.filter(i => !i.read) : filter === "all" ? items : items.filter(i => i.kind === filter);
  const unread = items.filter(i => !i.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread — everything Lucy wants you to see.`}
        actions={<Button variant="outline" onClick={() => setItems(items.map(i => ({ ...i, read: true })))}><CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read</Button>}
      />
      <PageBody className="space-y-4">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1 text-xs w-fit">
          {["all","unread","agent","team","billing","system"].map(k => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-md px-2.5 py-1 capitalize transition ${filter === k ? "bg-background shadow" : "text-muted-foreground hover:text-foreground"}`}>{k}</button>
          ))}
        </div>
        <Card className="border-border/70 bg-card/70">
          <ul className="divide-y divide-border/60">
            {filtered.length === 0 && <li className="p-10 text-center text-sm text-muted-foreground"><Bell className="mx-auto mb-3 h-6 w-6" /> You're all caught up.</li>}
            {filtered.map(n => {
              const Icon = iconMap[n.kind];
              return (
                <li key={n.id} className={`flex items-start gap-4 px-4 py-4 ${n.read ? "" : "bg-primary/[0.03]"}`}>
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><div className="font-medium">{n.title}</div>{!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>
                  </div>
                  <Badge variant="outline" className="border-border/60">{n.at}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </PageBody>
    </>
  );
}
