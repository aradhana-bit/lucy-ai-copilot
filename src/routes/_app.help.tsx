import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy, MessageSquare, Book, Sparkles } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/help")({
  head: () => ({ meta: [{ title: "Help — Lucy" }] }),
  component: Help,
});

const TOPICS = [
  { icon: Sparkles, title: "Getting started", desc: "Create a project, connect a startup profile, and start chatting with Lucy." },
  { icon: Book, title: "Documents & memory", desc: "How Lucy remembers what you're building across every conversation." },
  { icon: MessageSquare, title: "AI models", desc: "Switch between Gemini and GPT models per conversation." },
  { icon: LifeBuoy, title: "Contact support", desc: "We reply to every founder within one business day." },
];

function Help() {
  return (
    <>
      <PageHeader title="Help Center" subtitle="Guides, tips, and shortcuts for shipping faster with Lucy." />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <Card key={t.title} className="border-border/70 bg-card/70 p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><t.icon className="h-4 w-4" /></div>
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{t.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}
