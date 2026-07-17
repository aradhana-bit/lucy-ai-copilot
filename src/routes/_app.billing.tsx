import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Check } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: "Billing — Lucy" }] }),
  component: Billing,
});

const PLANS = [
  { name: "Free", price: 0, features: ["1 workspace", "3 projects", "500 AI messages/mo", "Community support"] },
  { name: "Team", price: 79, features: ["Unlimited projects", "10 seats", "50k AI messages/mo", "Priority support"], featured: true },
  { name: "Scale", price: 299, features: ["Unlimited seats", "Custom models", "Dedicated slack channel", "SSO / SAML"] },
];

function Billing() {
  const { data: workspace } = useWorkspace();

  const { data: billing } = useQuery({
    queryKey: ["billing", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data } = await supabase.from("billing").select("*").eq("workspace_id", workspace!.id).maybeSingle();
      return data;
    },
  });

  return (
    <>
      <PageHeader title="Billing" subtitle={`Current plan: ${billing?.plan || "free"} · ${billing?.seats || 1} seat`} />
      <PageBody>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <Card key={p.name} className={`p-6 ${p.featured ? "border-primary/40 ring-1 ring-primary/20" : "border-border/70"}`}>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{p.name}</div>
                {p.featured && <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Popular</Badge>}
              </div>
              <div className="mt-2 text-3xl font-semibold">${p.price}<span className="text-sm text-muted-foreground">/mo</span></div>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={p.featured ? "default" : "outline"} disabled={billing?.plan === p.name.toLowerCase()}>
                <CreditCard className="mr-1.5 h-4 w-4" /> {billing?.plan === p.name.toLowerCase() ? "Current" : "Upgrade"}
              </Button>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}
