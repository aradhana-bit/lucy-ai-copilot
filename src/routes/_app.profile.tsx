import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Lucy" }] }),
  component: Profile,
});

function Profile() {
  return (
    <>
      <PageHeader title="Profile" subtitle="How you appear across your workspace." />
      <PageBody className="mx-auto max-w-3xl space-y-6">
        <Card className="border-border/70 bg-card/70 p-6">
          <div className="flex flex-wrap items-center gap-6">
            <Avatar className="h-20 w-20 shadow-elevated"><AvatarFallback className="bg-gradient-to-br from-primary to-chart-5 text-lg text-primary-foreground">AL</AvatarFallback></Avatar>
            <div>
              <div className="flex items-center gap-2"><div className="text-lg font-semibold">Ada Lovelace</div><Badge variant="outline">Owner</Badge></div>
              <div className="text-sm text-muted-foreground">ada@lucy.app · Joined Mar 2025</div>
              <div className="mt-3 flex gap-2"><Button size="sm" variant="outline">Change photo</Button><Button size="sm" variant="ghost">Remove</Button></div>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 bg-card/70 p-6 space-y-4">
          <div className="text-sm font-semibold">Basic information</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Full name</Label><Input defaultValue="Ada Lovelace" /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="ada@lucy.app" /></div>
            <div className="space-y-2"><Label>Role</Label><Input defaultValue="Founder & CEO" /></div>
            <div className="space-y-2"><Label>Location</Label><Input defaultValue="San Francisco, CA" /></div>
          </div>
          <div className="space-y-2"><Label>Bio</Label><Textarea defaultValue="Building Lucy. Previously shipped analytics at a fintech unicorn. Loves ops, chess, and terse writing." /></div>
          <div className="flex justify-end gap-2"><Button variant="outline">Cancel</Button><Button>Save changes</Button></div>
        </Card>
      </PageBody>
    </>
  );
}
