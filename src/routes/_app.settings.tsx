import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, Info } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — Lucy" }] }),
  component: Settings,
});

const PROVIDERS = [
  { id: "gemini", label: "Google Gemini", models: ["google/gemini-3-flash-preview", "google/gemini-2.5-pro", "google/gemini-2.5-flash"] },
  { id: "openai", label: "OpenAI", models: ["openai/gpt-5", "openai/gpt-5-mini", "openai/gpt-5-nano"] },
  { id: "anthropic", label: "Anthropic (via Lovable AI)", models: ["google/gemini-3-flash-preview"] },
  { id: "openrouter", label: "OpenRouter (via Lovable AI)", models: ["google/gemini-3-flash-preview"] },
];

function Settings() {
  const { user } = useSession();
  const qc = useQueryClient();

  const { data: prefs } = useQuery({
    queryKey: ["prefs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("preferences").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (patch: { language?: string; timezone?: string; ai_model?: string; ai_provider?: string }) => {
      const { error } = await supabase.from("preferences").upsert({ user_id: user!.id, ...patch });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["prefs"] }); toast.success("Saved"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!prefs) return null;

  const currentProvider = PROVIDERS.find((p) => p.id === prefs.ai_provider) ?? PROVIDERS[0];

  return (
    <>
      <PageHeader title="Settings" subtitle="Preferences that follow you across every device." />
      <PageBody>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            save.mutate({
              language: String(fd.get("language")),
              timezone: String(fd.get("timezone")),
              ai_provider: String(fd.get("ai_provider")),
              ai_model: String(fd.get("ai_model")),
            });
          }}
        >
          <Card className="max-w-2xl space-y-6 p-6">
            <div>
              <h3 className="text-sm font-semibold">Locale</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select name="language" defaultValue={prefs.language}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["en","es","fr","de","pt"].map((l) => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input name="timezone" defaultValue={prefs.timezone} />
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-6">
              <h3 className="text-sm font-semibold">AI provider</h3>
              <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                All providers route through Lucy's secure AI gateway. Your default model is used across the workspace unless you override per conversation.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select name="ai_provider" defaultValue={prefs.ai_provider ?? "gemini"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROVIDERS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default model</Label>
                  <Select name="ai_model" defaultValue={prefs.ai_model}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {currentProvider.models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-6">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />} Save changes
              </Button>
            </div>
          </Card>
        </form>
      </PageBody>
    </>
  );
}
