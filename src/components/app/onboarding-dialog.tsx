import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useWorkspace } from "@/hooks/use-workspace";
import { toast } from "sonner";

const STAGES = ["idea", "prototype", "mvp", "beta", "launched", "scaling"] as const;
const MODELS = ["b2b_saas", "b2c", "marketplace", "hardware", "consumer_app", "agency", "other"] as const;

export function OnboardingDialog() {
  const { user } = useSession();
  const { data: workspace } = useWorkspace();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [open, setOpen] = useState(false);

  const { data: prefs } = useQuery({
    queryKey: ["prefs-onboarding", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("preferences").select("onboarding_completed").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: existing } = useQuery({
    queryKey: ["startup-profile", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data } = await supabase.from("startup_profiles").select("id").eq("workspace_id", workspace!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (prefs && !prefs.onboarding_completed && !existing) setOpen(true);
  }, [prefs, existing]);

  const complete = useMutation({
    mutationFn: async (form: {
      name: string; idea: string; industry: string; audience: string; stage: string; model: string; goal: string;
    }) => {
      if (!workspace || !user) throw new Error("Workspace not ready");
      const { error: spErr } = await supabase.from("startup_profiles").insert({
        workspace_id: workspace.id,
        name: form.name,
        idea: form.idea,
        industry: form.industry,
        audience: form.audience,
        stage: form.stage,
        business_model: form.model,
        goal: form.goal,
      });
      if (spErr) throw spErr;

      const { error: projErr } = await supabase.from("projects").insert({
        workspace_id: workspace.id,
        name: form.name,
        description: form.idea.slice(0, 240),
        status: "active",
        progress: 5,
        color: "#7c3aed",
        created_by: user.id,
      });
      if (projErr) throw projErr;

      const { error: prefErr } = await supabase
        .from("preferences")
        .upsert({ user_id: user.id, onboarding_completed: true });
      if (prefErr) throw prefErr;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Your Founder OS is set up");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    complete.mutate({
      name: String(fd.get("name")).trim(),
      idea: String(fd.get("idea")).trim(),
      industry: String(fd.get("industry")).trim(),
      audience: String(fd.get("audience")).trim(),
      stage: String(fd.get("stage")),
      model: String(fd.get("model")),
      goal: String(fd.get("goal")).trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!complete.isPending) setOpen(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-5 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <DialogTitle>Set up your Founder OS</DialogTitle>
          <DialogDescription>Lucy uses this to seed your workspace with a project, PRD, and roadmap.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Startup name</Label>
                <Input id="name" name="name" required placeholder="Northline" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idea">Startup idea</Label>
                <Textarea id="idea" name="idea" required rows={3} placeholder="A one-liner or short paragraph." />
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => setStep(1)}>Continue <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" name="industry" required placeholder="Fintech" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target audience</Label>
                  <Input id="audience" name="audience" required placeholder="Solo operators" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Stage</Label>
                  <Select name="stage" defaultValue="idea">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Business model</Label>
                  <Select name="model" defaultValue="b2b_saas">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MODELS.map((m) => <SelectItem key={m} value={m}>{m.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Your primary goal in the next 90 days</Label>
                <Textarea id="goal" name="goal" required rows={2} placeholder="Ship the MVP and land 10 design partners." />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(0)}>Back</Button>
                <Button type="submit" disabled={complete.isPending}>
                  {complete.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Finish setup <ArrowRight className="ml-1 h-4 w-4" /></>}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
