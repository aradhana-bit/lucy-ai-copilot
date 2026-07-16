import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Plug, Copy, Trash2, Plus } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Lucy" }] }),
  component: Settings,
});

function Settings() {
  const [dark, setDark] = useState(true);
  return (
    <>
      <PageHeader title="Settings" subtitle="Tune your workspace, security, and integrations." />
      <PageBody>
        <Tabs defaultValue="account" orientation="vertical" className="flex flex-col gap-6 lg:flex-row">
          <TabsList className="flex h-auto w-full flex-row flex-wrap gap-1 bg-secondary/60 p-1 lg:w-56 lg:flex-col lg:flex-nowrap">
            {["account","security","appearance","api","integrations","notifications"].map(t => (
              <TabsTrigger key={t} value={t} className="w-full justify-start capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>
          <div className="min-w-0 flex-1 space-y-4">
            <TabsContent value="account">
              <Card className="border-border/70 bg-card/70 p-6 space-y-4">
                <div className="text-sm font-semibold">Account</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Workspace name</Label><Input defaultValue="Lucy Labs" /></div>
                  <div className="space-y-2"><Label>Workspace URL</Label><Input defaultValue="lucy.app/lucy-labs" /></div>
                </div>
                <div className="flex justify-end"><Button>Save</Button></div>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card className="border-border/70 bg-card/70 p-6 space-y-4">
                <div className="text-sm font-semibold">Security</div>
                <Row t="Two-factor authentication" d="Require a second factor when signing in." right={<Switch defaultChecked />} />
                <Row t="Single sign-on (SSO)" d="Available on Scale plan." right={<Badge variant="outline">Upgrade</Badge>} />
                <Row t="Active sessions" d="3 devices signed in." right={<Button size="sm" variant="outline">Sign out others</Button>} />
              </Card>
            </TabsContent>
            <TabsContent value="appearance">
              <Card className="border-border/70 bg-card/70 p-6 space-y-4">
                <div className="text-sm font-semibold">Appearance</div>
                <Row t="Dark mode" d="Lucy is dark-first — light coming soon." right={<Switch checked={dark} onCheckedChange={setDark} />} />
                <Row t="Compact mode" d="Denser lists and cards." right={<Switch />} />
              </Card>
            </TabsContent>
            <TabsContent value="api">
              <Card className="border-border/70 bg-card/70 p-6 space-y-4">
                <div className="flex items-center justify-between"><div className="text-sm font-semibold">API keys</div><Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> New key</Button></div>
                {["lucy_live_a1b2••••4f9c","lucy_live_9de4••••7c11"].map(k => (
                  <div key={k} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1"><div className="font-mono text-xs">{k}</div><div className="text-[11px] text-muted-foreground">Created May 12 · last used 2h ago</div></div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(k); toast.success("Copied to clipboard"); }}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </Card>
            </TabsContent>
            <TabsContent value="integrations">
              <Card className="border-border/70 bg-card/70 p-6 space-y-3">
                <div className="text-sm font-semibold">Integrations</div>
                {[
                  { n: "GitHub", d: "Sync issues, PRs, and code reviews.", c: true },
                  { n: "Linear", d: "Two-way sync with your issue tracker.", c: true },
                  { n: "Slack", d: "Get agent updates in channel.", c: false },
                  { n: "Notion", d: "Publish generated docs.", c: false },
                  { n: "Figma", d: "Embed and comment on frames.", c: false },
                ].map(i => (
                  <div key={i.n} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Plug className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1"><div className="text-sm font-medium">{i.n}</div><div className="text-xs text-muted-foreground">{i.d}</div></div>
                    <Button variant={i.c ? "outline" : "default"} size="sm">{i.c ? "Connected" : "Connect"}</Button>
                  </div>
                ))}
              </Card>
            </TabsContent>
            <TabsContent value="notifications">
              <Card className="border-border/70 bg-card/70 p-6 space-y-4">
                <div className="text-sm font-semibold">Notification preferences</div>
                {["Agent completions","Task deadlines","Team @mentions","Weekly digest","Billing updates"].map(n => (
                  <Row key={n} t={n} d="Email + in-app" right={<Switch defaultChecked />} />
                ))}
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </PageBody>
    </>
  );
}

function Row({ t, d, right }: { t: string; d: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <div><div className="text-sm font-medium">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
      {right}
    </div>
  );
}
