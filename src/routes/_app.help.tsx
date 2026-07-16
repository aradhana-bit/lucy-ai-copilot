import { createFileRoute } from "@tanstack/react-router";
import { Search, BookOpen, MessageCircle, LifeBuoy, Zap, Video } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/help")({
  head: () => ({ meta: [{ title: "Help Center — Lucy" }] }),
  component: Help,
});

const cats = [
  { i: BookOpen, t: "Getting started", d: "Set up your first project and meet the agents." },
  { i: Zap, t: "Agents deep-dive", d: "What each agent does and how they collaborate." },
  { i: LifeBuoy, t: "Billing & plans", d: "Understand agent hours, seats, and invoices." },
  { i: Video, t: "Video walkthroughs", d: "Watch 5-minute product demos." },
];

const faqs = [
  { q: "How do agent hours work?", a: "Each plan comes with a monthly budget. An agent hour is 60 minutes of active reasoning or tool use. Overages are billed at cost — you'll see the per-minute rate before it runs." },
  { q: "Can I use my own LLM keys?", a: "Yes — bring your own OpenAI, Anthropic, or Google keys on Team and Scale. Lucy will bill zero agent hours against your workspace when using BYO keys." },
  { q: "How does Lucy handle sensitive data?", a: "Data is encrypted at rest and in transit, isolated per workspace, and never used to train foundation models. SOC 2 Type II available on Scale." },
  { q: "Can multiple people work in the same workspace?", a: "Absolutely. Invite teammates from Settings → Members. Every plan except Starter includes multi-seat collaboration." },
];

function Help() {
  return (
    <>
      <PageHeader title="Help Center" subtitle="Docs, guides, and answers." />
      <PageBody className="space-y-8">
        <div className="rounded-2xl border border-border/70 surface p-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">How can Lucy help?</h2>
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search articles, guides, and FAQs" className="border-0 bg-transparent focus-visible:ring-0" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map(c => (
            <Card key={c.t} className="border-border/70 bg-card/70 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><c.i className="h-5 w-5" /></div>
              <div className="mt-4 text-sm font-semibold">{c.t}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.d}</div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 text-sm font-semibold">Frequently asked</div>
            <Accordion type="single" collapsible>
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f-${i}`} className="border-border/70">
                  <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <Card className="h-fit border-border/70 bg-card/70 p-6">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><MessageCircle className="h-5 w-5" /></div>
            <div className="mt-4 text-sm font-semibold">Talk to a human</div>
            <p className="mt-1 text-xs text-muted-foreground">Team plan and above get priority support with a 4-hour response time.</p>
            <Button className="mt-4 w-full">Contact support</Button>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
