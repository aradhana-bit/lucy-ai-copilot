import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2 } from "lucide-react";
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

const MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash",
  "openai/gpt-5",
  "openai/gpt-5-mini",
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
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("preferences").upsert({ user_id: user!.id, ...patch });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["prefs"] }); toast.success("Saved"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!prefs) return null;

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
              ai_model: String(fd.get("ai_model")),
            });
          }}
        >
          <Card className="max-w-2xl space-y-6 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
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
            <div className="space-y-2">
              <Label>Default AI model</Label>
              <Select name="ai_model" defaultValue={prefs.ai_model}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MODELS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />} Save
              </Button>
            </div>
          </Card>
        </form>
      </PageBody>
    </>
  );
}
