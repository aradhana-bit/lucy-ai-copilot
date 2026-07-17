import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Lucy" }] }),
  component: Notifications,
});

function Notifications() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data: items } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`notifs:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications", user.id] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["unread-count"] });
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Everything happening across your workspace."
        actions={<Button variant="outline" onClick={markAllRead}><CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read</Button>}
      />
      <PageBody>
        {items?.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-medium">All caught up</h3>
            <p className="mt-1 text-sm text-muted-foreground">No notifications yet.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-border/60 border-border/60">
            {items?.map((n) => (
              <div key={n.id} className={cn("flex items-start gap-3 p-4", !n.read && "bg-primary/5")}>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary"><Bell className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {n.title} {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  {n.body && <div className="mt-0.5 text-xs text-muted-foreground">{n.body}</div>}
                  <div className="mt-1 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
                </div>
                <Badge variant="outline" className="capitalize">{n.kind}</Badge>
              </div>
            ))}
          </Card>
        )}
      </PageBody>
    </>
  );
}
