import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  LogIn,
  UserPlus,
  Settings as SettingsIcon,
  Database,
  HardDrive,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_app/security")({
  head: () => ({ meta: [{ title: "Security — Lucy" }] }),
  component: SecurityDashboard,
});

// Curated history of findings resolved on this platform.
// Kept in-app because scan results are ephemeral; each entry corresponds
// to a persisted migration that hardened RLS or policy access.
const FINDINGS_HISTORY = [
  {
    id: "SUPA_anon_security_definer_function_executable",
    title: "SECURITY DEFINER helpers exposed to anon",
    severity: "high",
    status: "resolved",
    resolvedAt: "2026-07-14",
    note: "Relocated has_role / is_workspace_member / can_access_project into private schema; revoked PUBLIC EXECUTE.",
  },
  {
    id: "profiles_read_any_authenticated",
    title: "Profiles readable by any authenticated user",
    severity: "high",
    status: "resolved",
    resolvedAt: "2026-07-14",
    note: "Replaced permissive USING true with private.shares_workspace scoped policy.",
  },
  {
    id: "billing_self_write",
    title: "Billing writable by workspace members",
    severity: "high",
    status: "resolved",
    resolvedAt: "2026-07-16",
    note: "Members restricted to SELECT; INSERT/UPDATE/DELETE only via service_role.",
  },
  {
    id: "wm_insert_any_ws",
    title: "Workspace members insertable by any user",
    severity: "high",
    status: "resolved",
    resolvedAt: "2026-07-16",
    note: "New policy limits INSERT to workspace owner only.",
  },
  {
    id: "workspace_members_self_insert",
    title: "Members could self-join workspaces",
    severity: "medium",
    status: "resolved",
    resolvedAt: "2026-07-18",
    note: "Owner-only INSERT + owner-only DELETE policies applied.",
  },
  {
    id: "SUPA_auth_allow_anonymous_sign_ins",
    title: "Anonymous sign-ins enabled",
    severity: "low",
    status: "accepted",
    resolvedAt: "2026-07-18",
    note: "Intentional — guest access model. All sensitive policies scope via auth.uid().",
  },
] as const;

const SUSPICIOUS_KINDS = ["login", "member_added", "settings_updated"] as const;
const KIND_META: Record<string, { icon: typeof LogIn; label: string; tone: string }> = {
  login: { icon: LogIn, label: "Sign-in", tone: "text-sky-400" },
  member_added: { icon: UserPlus, label: "Member added", tone: "text-amber-400" },
  settings_updated: { icon: SettingsIcon, label: "Settings changed", tone: "text-violet-400" },
};

function SecurityDashboard() {
  const { user } = useSession();

  const { data: role, isLoading: roleLoading } = useQuery({
    queryKey: ["role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).maybeSingle();
      return data?.role ?? "member";
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ["security-metrics"],
    enabled: role === "admin",
    queryFn: async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [users, workspaces, files, recentLogins, recentMembers, recentSettings, msgs] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("workspaces").select("id", { count: "exact", head: true }),
        supabase.from("files").select("size"),
        supabase.from("activity_logs").select("id", { count: "exact", head: true }).eq("kind", "login").gte("created_at", since),
        supabase.from("activity_logs").select("id", { count: "exact", head: true }).eq("kind", "member_added").gte("created_at", since),
        supabase.from("activity_logs").select("id", { count: "exact", head: true }).eq("kind", "settings_updated").gte("created_at", since),
        supabase.from("messages").select("id", { count: "exact", head: true }).gte("created_at", since),
      ]);
      const storageBytes = (files.data ?? []).reduce((s, f) => s + (f.size ?? 0), 0);
      return {
        users: users.count ?? 0,
        workspaces: workspaces.count ?? 0,
        storageBytes,
        logins7d: recentLogins.count ?? 0,
        members7d: recentMembers.count ?? 0,
        settings7d: recentSettings.count ?? 0,
        msgs7d: msgs.count ?? 0,
      };
    },
  });

  const { data: events } = useQuery({
    queryKey: ["security-events"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("id, kind, message, created_at, user_id, workspace_id")
        .in("kind", [...SUSPICIOUS_KINDS])
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (roleLoading) return null;

  if (role !== "admin") {
    return (
      <>
        <PageHeader title="Security" />
        <PageBody>
          <Card className="border-dashed p-12 text-center">
            <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-medium">Admin access only</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You need admin privileges to view the security dashboard.
            </p>
          </Card>
        </PageBody>
      </>
    );
  }

  const resolvedCount = FINDINGS_HISTORY.filter((f) => f.status === "resolved").length;
  const acceptedCount = FINDINGS_HISTORY.filter((f) => f.status === "accepted").length;

  const tiles = [
    { label: "Findings resolved", value: resolvedCount, icon: ShieldCheck, tone: "text-emerald-400" },
    { label: "Accepted risks", value: acceptedCount, icon: ShieldAlert, tone: "text-amber-400" },
    { label: "Sign-ins (7d)", value: metrics?.logins7d ?? 0, icon: LogIn, tone: "text-sky-400" },
    { label: "Members added (7d)", value: metrics?.members7d ?? 0, icon: UserPlus, tone: "text-violet-400" },
    { label: "AI messages (7d)", value: metrics?.msgs7d ?? 0, icon: Activity, tone: "text-primary" },
    { label: "Users", value: metrics?.users ?? 0, icon: Users, tone: "text-foreground/80" },
    { label: "Workspaces", value: metrics?.workspaces ?? 0, icon: Database, tone: "text-foreground/80" },
    { label: "Storage", value: formatBytes(metrics?.storageBytes ?? 0), icon: HardDrive, tone: "text-foreground/80" },
  ];

  return (
    <>
      <PageHeader
        title="Security"
        subtitle="Findings history, suspicious events, and system health."
        actions={
          <Link
            to="/admin"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to admin
          </Link>
        }
      />
      <PageBody className="space-y-6">
        {/* Health tiles */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <Card key={t.label} className="border-border/70 bg-card/70 p-4">
              <div className={`grid h-9 w-9 place-items-center rounded-lg bg-primary/10 ${t.tone}`}>
                <t.icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-xl font-semibold tracking-tight">{t.value}</div>
              <div className="text-xs text-muted-foreground">{t.label}</div>
            </Card>
          ))}
        </div>

        {/* Findings history */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Findings history</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Security scanner findings addressed on this platform.
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              {resolvedCount} resolved
            </Badge>
          </div>
          <div className="mt-4 divide-y divide-border/60">
            {FINDINGS_HISTORY.map((f) => (
              <div key={f.id} className="flex items-start gap-3 py-3">
                <div className="mt-0.5">
                  {f.status === "resolved" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{f.title}</span>
                    <Badge
                      variant="outline"
                      className={
                        f.severity === "high"
                          ? "border-rose-500/30 text-rose-400"
                          : f.severity === "medium"
                          ? "border-amber-500/30 text-amber-400"
                          : "border-sky-500/30 text-sky-400"
                      }
                    >
                      {f.severity}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        f.status === "resolved"
                          ? "border-emerald-500/30 text-emerald-400"
                          : "border-amber-500/30 text-amber-400"
                      }
                    >
                      {f.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    {f.resolvedAt} · {f.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Suspicious events */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Recent sensitive events</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Sign-ins, member changes, and settings updates across workspaces you administer.
              </p>
            </div>
            <Badge variant="outline">{events?.length ?? 0}</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {!events || events.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                No sensitive activity recorded yet.
              </div>
            ) : (
              events.map((e) => {
                const meta = KIND_META[e.kind] ?? { icon: Activity, label: e.kind, tone: "text-muted-foreground" };
                const Icon = meta.icon;
                return (
                  <div
                    key={e.id}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 p-3"
                  >
                    <div className={`grid h-8 w-8 place-items-center rounded-md bg-primary/10 ${meta.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{meta.label}</span>
                        <span className="text-xs text-muted-foreground truncate">{e.message}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                        {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                        {e.user_id ? ` · user ${e.user_id.slice(0, 8)}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </PageBody>
    </>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  const k = 1024;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / k;
  let i = 0;
  while (v >= k && i < units.length - 1) {
    v /= k;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}
