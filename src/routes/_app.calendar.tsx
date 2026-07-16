import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { tasks } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Lucy" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) days.push(d);

  const eventsByDay: Record<string, { title: string; project: string; kind: "task" | "review" | "launch" }[]> = {};
  const today = new Date();
  tasks.forEach((t, i) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (i - 2));
    const key = day.toDateString();
    (eventsByDay[key] ||= []).push({ title: t.title, project: t.project, kind: t.status === "review" ? "review" : "task" });
  });

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle={format(cursor, "MMMM yyyy")}
        actions={<>
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-secondary/40 p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCursor(addMonths(cursor, -1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-7" onClick={() => setCursor(new Date())}>Today</Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCursor(addMonths(cursor, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button><Plus className="mr-1.5 h-4 w-4" /> Event</Button>
        </>}
      />
      <PageBody>
        <Card className="border-border/70 bg-card/70 p-2">
          <div className="grid grid-cols-7 border-b border-border/60 text-[11px] uppercase tracking-widest text-muted-foreground">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} className="px-3 py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {days.map((d) => {
              const inMonth = isSameMonth(d, cursor);
              const isToday = isSameDay(d, today);
              const evs = eventsByDay[d.toDateString()] || [];
              return (
                <div key={d.toISOString()} className={`min-h-28 border-b border-r border-border/60 p-2 ${inMonth ? "" : "bg-secondary/10"}`}>
                  <div className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs ${isToday ? "bg-primary text-primary-foreground" : inMonth ? "text-foreground" : "text-muted-foreground"}`}>
                    {format(d, "d")}
                  </div>
                  <div className="mt-1 space-y-1">
                    {evs.slice(0,3).map((e, i) => (
                      <div key={i} className="truncate rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px]">
                        <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${e.kind === "review" ? "bg-warning" : "bg-primary"}`} />{e.title}
                      </div>
                    ))}
                    {evs.length > 3 && <div className="text-[10px] text-muted-foreground">+{evs.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-border/60"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" /> Task</Badge>
          <Badge variant="outline" className="border-border/60"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-warning" /> Review</Badge>
        </div>
      </PageBody>
    </>
  );
}
