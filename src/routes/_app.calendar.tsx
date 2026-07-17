import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";

export const Route = createFileRoute("/_app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Lucy" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data: workspace } = useWorkspace();
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const anchor = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();

  const { data: tasks } = useQuery({
    queryKey: ["tasks-cal", workspace?.id, year, month],
    enabled: !!workspace,
    queryFn: async () => {
      const start = new Date(year, month, 1).toISOString();
      const end = new Date(year, month + 1, 1).toISOString();
      const { data } = await supabase.from("tasks").select("id, title, due_at, priority").eq("workspace_id", workspace!.id).gte("due_at", start).lt("due_at", end);
      return data || [];
    },
  });

  const byDay: Record<number, typeof tasks> = {};
  tasks?.forEach((t) => {
    if (!t.due_at) return;
    const d = new Date(t.due_at).getDate();
    byDay[d] = [...(byDay[d] || []), t];
  });

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle={anchor.toLocaleString("default", { month: "long", year: "numeric" })}
        actions={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setMonthOffset((n) => n - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setMonthOffset(0)}>Today</Button>
            <Button variant="outline" size="icon" onClick={() => setMonthOffset((n) => n + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        }
      />
      <PageBody>
        <Card className="overflow-hidden border-border/60 p-0">
          <div className="grid grid-cols-7 border-b border-border/60 bg-secondary/40 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="p-2 text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: startWeekday }).map((_, i) => <div key={`e${i}`} className="min-h-24 border-b border-r border-border/40 bg-muted/10" />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
              return (
                <div key={day} className="min-h-24 border-b border-r border-border/40 p-1.5">
                  <div className={`text-[11px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{day}</div>
                  <div className="mt-1 space-y-0.5">
                    {byDay[day]?.slice(0, 3).map((t) => (
                      <div key={t.id} className="truncate rounded bg-primary/15 px-1 py-0.5 text-[10px] text-primary">{t.title}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </PageBody>
    </>
  );
}
