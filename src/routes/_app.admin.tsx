import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Save, Loader2, Users, MessagesSquare, HardDrive, Activity } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({ meta: [{ title: "Admin — Lucy" }] }),
  component: Admin,
});

function Admin() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ["role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).maybeSingle();
      return data?.role ?? "member";
    },
  });

  const { data: owner } = useQuery({
    queryKey: ["owner-settings"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase.from("owner_settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    enabled: role === "admin",
    queryFn: async () => {
      const [users, convos, msgs, files, workspaces] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("conversations").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("files").select("size"),
        supabase.from("workspaces").select("id", { count: "exact", head: true }),
      ]);
      const storageBytes = (files.data ?? []).reduce((s, f) => s + (f.size ?? 0), 0);
      return {
        users: users.count ?? 0,
        convos: convos.count ?? 0,
        msgs: msgs.count ?? 0,
        workspaces: workspaces.count ?? 0,
        storageBytes,
      };
    },
  });

  const saveOwner = useMutation({
    mutationFn: async (patch: { name: string; role: string; support_email: string; bio: string; avatar_url: string }) => {
      const { error } = await supabase.from("owner_settings").update(patch).eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["owner-settings"] }); toast.success("Owner profile updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (roleLoading) return null;

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

  const cards = [
    { label: "Users", value: stats?.users ?? 0, icon: Users },
    { label: "Workspaces", value: stats?.workspaces ?? 0, icon: Shield },
    { label: "Conversations", value: stats?.convos ?? 0, icon: MessagesSquare },
    { label: "AI messages", value: stats?.msgs ?? 0, icon: Activity },
    { label: "Storage", value: formatBytes(stats?.storageBytes ?? 0), icon: HardDrive },
  ];

  return (
    <>
      <PageHeader title="Admin" subtitle="Platform-level controls for the Lucy owner." />
      <PageBody className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => (
            <Card key={c.label} className="border-border/70 bg-card/70 p-4">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-xl font-semibold tracking-tight">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </Card>
          ))}
        </div>

        {owner && (
          <Card className="max-w-2xl p-6">
            <h3 className="text-sm font-semibold">Owner profile</h3>
            <p className="mt-1 text-xs text-muted-foreground">Shown in Help Center, footer, and support emails.</p>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                saveOwner.mutate({
                  name: String(fd.get("name")).trim(),
                  role: String(fd.get("role")).trim(),
                  support_email: String(fd.get("support_email")).trim(),
                  bio: String(fd.get("bio") ?? "").trim(),
                  avatar_url: String(fd.get("avatar_url") ?? "").trim(),
                });
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input name="name" defaultValue={owner.name} required />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input name="role" defaultValue={owner.role} required />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Support email</Label>
                  <Input name="support_email" type="email" defaultValue={owner.support_email} required />
                </div>
                <div className="space-y-2">
                  <Label>Avatar URL</Label>
                  <Input name="avatar_url" defaultValue={owner.avatar_url ?? ""} placeholder="https://…" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea name="bio" rows={3} defaultValue={owner.bio ?? ""} placeholder="A short public bio." />
              </div>
              <Button type="submit" disabled={saveOwner.isPending}>
                {saveOwner.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />} Save
              </Button>
            </form>
          </Card>
        )}
      </PageBody>
    </>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const k = 1024;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / k, i = 0;
  while (v >= k && i < units.length - 1) { v /= k; i++; }
  return `${v.toFixed(1)} ${units[i]}`;
}
