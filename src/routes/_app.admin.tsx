import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — Lucy" }] }),
  component: Admin,
});

function Admin() {
  const { user } = useSession();

  const { data: role } = useQuery({
    queryKey: ["role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).maybeSingle();
      return data?.role ?? "member";
    },
  });

  if (role !== "admin") {
    return (
      <>
        <PageHeader title="Admin" />
        <PageBody>
          <Card className="border-dashed p-12 text-center">
            <Shield className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-medium">Admin access only</h3>
            <p className="mt-1 text-sm text-muted-foreground">You don't have admin privileges on this workspace.</p>
          </Card>
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Admin" subtitle="Workspace-level controls." />
      <PageBody>
        <Card className="p-6 text-sm text-muted-foreground">Admin console coming online.</Card>
      </PageBody>
    </>
  );
}
