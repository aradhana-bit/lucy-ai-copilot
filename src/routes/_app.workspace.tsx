import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Send, Paperclip, History, Layers, FileText, ChevronRight, Bot, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { agents } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/workspace")({
  head: () => ({ meta: [{ title: "AI Workspace — Lucy" }] }),
  component: Workspace,
});

type Msg = { id: string; role: "user" | "agent"; agent?: string; content: string; artifacts?: { name: string; kind: string }[] };

const seed: Msg[] = [
  { id: "m1", role: "user", content: "Let's finalize positioning for Atlas. Target audience is ops managers at 3PL logistics companies." },
  { id: "m2", role: "agent", agent: "Strategist", content: "Great. From the interviews you shared, three tensions matter most: (1) fragmented visibility across carriers, (2) manual exception handling, (3) reporting for shipper customers. I'm drafting three positioning angles that lean into #1 and #2 — reporting becomes a wedge feature." },
  { id: "m3", role: "agent", agent: "Researcher", content: "Pulled competitor teardowns for 8 vendors. Only 2 sell to ops managers directly; the rest go C-suite. Attaching a comparison matrix.", artifacts: [{ name: "competitor-matrix.pdf", kind: "pdf" }] },
  { id: "m4", role: "user", content: "Push on angle #2 — 'exception handling as a first-class workflow'. Draft the one-liner + hero sub." },
  { id: "m5", role: "agent", agent: "Strategist", content: "One-liner: **The logistics CRM built around exceptions, not shipments.** Sub: *Atlas turns every stuck load into a workflow — assigned, tracked, and closed — so your ops team stops living in email.* Ready to iterate.", artifacts: [{ name: "atlas-positioning-v3.md", kind: "doc" }] },
];

function Workspace() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const um: Msg = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages(m => [...m, um]);
    setInput("");
    setTimeout(() => {
      setMessages(m => [...m, { id: crypto.randomUUID(), role: "agent", agent: "Strategist", content: "On it. Coordinating with Researcher for supporting data and Writer for a copy pass. I'll come back with a v4 draft in a few minutes." }]);
    }, 700);
  };

  return (
    <>
      <PageHeader
        title="AI Workspace"
        subtitle="Atlas · six agents active"
        actions={<>
          <Button variant="outline" size="sm"><History className="mr-1.5 h-4 w-4" /> History</Button>
          <Button size="sm"><Wand2 className="mr-1.5 h-4 w-4" /> New session</Button>
        </>}
      />
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 divide-y divide-border/60 lg:grid-cols-[220px_1fr_300px] lg:divide-x lg:divide-y-0">
        <aside className="hidden overflow-y-auto p-4 lg:block">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Agents</div>
          {agents.map(a => (
            <button key={a.id} className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-accent">
              <div className="grid h-7 w-7 place-items-center rounded-md" style={{ background: `${a.color}25`, color: a.color }}><Sparkles className="h-3.5 w-3.5" /></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm">{a.name}</div>
                <div className="truncate text-[11px] text-muted-foreground">{a.role}</div>
              </div>
              <span className={`h-1.5 w-1.5 rounded-full ${a.status === "working" ? "bg-success" : a.status === "waiting" ? "bg-warning" : "bg-muted-foreground"}`} />
            </button>
          ))}
          <div className="mt-6 mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Prompt history</div>
          {["Positioning v3","Beta pricing options","Onboarding copy","Referral loop math"].map(h => (
            <button key={h} className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground">{h}<ChevronRight className="h-3 w-3" /></button>
          ))}
        </aside>

        <section className="flex min-w-0 flex-col">
          <ScrollArea className="flex-1 px-6 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map(m => <MessageBubble key={m.id} m={m} />)}
            </div>
          </ScrollArea>
          <div className="border-t border-border/60 bg-background/60 px-6 py-4">
            <div className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-border/70 surface p-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask Lucy anything — she'll route it to the right agents."
                  className="min-h-[64px] resize-none border-0 bg-transparent focus-visible:ring-0"
                />
                <div className="flex items-center gap-2 px-2 pb-1">
                  <Button variant="ghost" size="sm" className="h-8"><Paperclip className="h-4 w-4" /></Button>
                  <Badge variant="outline" className="border-border/60"><Bot className="mr-1 h-3 w-3" /> Auto-route</Badge>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">⏎ to send · ⇧⏎ for newline</span>
                    <Button size="sm" onClick={send}><Send className="mr-1 h-3.5 w-3.5" /> Send</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="hidden overflow-y-auto p-4 lg:block">
          <div className="mb-2 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"><span>Memory</span><Layers className="h-3 w-3" /></div>
          <Card className="border-border/70 bg-card/60 p-3 text-xs text-muted-foreground">
            <div className="mb-1 font-medium text-foreground">Atlas context</div>
            <ul className="space-y-1">
              <li>• ICP: ops managers, 3PL, 20–200 loads/day</li>
              <li>• Pricing anchor: $299/mo seat</li>
              <li>• Wedge: exception workflows</li>
              <li>• 12 interviews synthesized</li>
            </ul>
          </Card>

          <div className="mt-6 mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Artifacts</div>
          {[
            { n: "atlas-positioning-v3.md", k: "doc" },
            { n: "competitor-matrix.pdf", k: "pdf" },
            { n: "hero-copy-options.txt", k: "doc" },
          ].map(a => (
            <div key={a.n} className="mb-1 flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 p-2 text-xs">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">{a.n}</span>
            </div>
          ))}

          <div className="mt-6 mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Execution timeline</div>
          <ol className="relative space-y-3 border-l border-border/70 pl-4 text-xs">
            {[
              { t: "0:42", w: "Strategist opened session" },
              { t: "1:15", w: "Researcher summoned" },
              { t: "3:04", w: "Competitor matrix generated" },
              { t: "4:20", w: "Positioning v3 drafted" },
              { t: "now", w: "Writer queued for copy pass" },
            ].map((s, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[19px] mt-1 grid h-3 w-3 place-items-center rounded-full bg-primary/20"><span className="h-1 w-1 rounded-full bg-primary" /></span>
                <div className="text-foreground">{s.w}</div>
                <div className="text-[10px] text-muted-foreground">{s.t}</div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}

function MessageBubble({ m }: { m: Msg }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm border border-border/70 bg-secondary px-4 py-3 text-sm">{m.content}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Sparkles className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs"><span className="font-medium">{m.agent}</span><Badge variant="outline" className="h-4 border-border/60 px-1 text-[10px]">agent</Badge></div>
        <div className="rounded-2xl rounded-tl-sm border border-border/70 bg-card/60 px-4 py-3 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>") }} />
        {m.artifacts && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.artifacts.map(a => (
              <div key={a.name} className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/60 px-2.5 py-1.5 text-xs">
                <FileText className="h-3.5 w-3.5 text-primary" />{a.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
