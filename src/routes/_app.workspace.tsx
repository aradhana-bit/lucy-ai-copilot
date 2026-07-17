import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Sparkles, Send, History, Plus, Pin, Archive, Trash2, Loader2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PageHeader } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useWorkspace } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/workspace")({
  head: () => ({ meta: [{ title: "AI Workspace — Lucy" }] }),
  component: Workspace,
});

type Msg = { id: string; role: string; content: string; created_at: string };
type Convo = { id: string; title: string; pinned: boolean; archived: boolean; project_id: string | null; model: string; last_message_at: string | null; updated_at: string };

function Workspace() {
  const { user } = useSession();
  const { data: workspace } = useWorkspace();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamed, setStreamed] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: convos } = useQuery({
    queryKey: ["conversations", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, pinned, archived, project_id, model, last_message_at, updated_at")
        .eq("workspace_id", workspace!.id)
        .eq("archived", false)
        .order("pinned", { ascending: false })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Convo[];
    },
  });

  useEffect(() => {
    if (!activeId && convos && convos.length) setActiveId(convos[0].id);
  }, [convos, activeId]);

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", activeId!)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data as Msg[];
    },
  });

  // Realtime for messages
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`msgs:${activeId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        () => refetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId, refetchMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamed]);

  const createConvo = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .insert({ workspace_id: workspace!.id, title: "New conversation", created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["conversations", workspace?.id] });
      setActiveId(d.id);
    },
  });

  const updateConvo = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Convo> }) => {
      const { error } = await supabase.from("conversations").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations", workspace?.id] }),
  });

  const deleteConvo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conversations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations", workspace?.id] });
      setActiveId(null);
    },
  });

  const send = async () => {
    const text = input.trim();
    if (!text || !activeId || streaming) return;
    setInput("");
    setStreaming(true);
    setStreamed("");
    // Optimistic user message
    qc.setQueryData<Msg[]>(["messages", activeId], (prev) => [
      ...(prev || []),
      { id: crypto.randomUUID(), role: "user", content: text, created_at: new Date().toISOString() },
    ]);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: activeId, userMessage: text }),
      });
      if (!res.ok || !res.body) {
        const body = await res.text().catch(() => "");
        if (res.status === 429) toast.error("Rate limited. Try again shortly.");
        else if (res.status === 402) toast.error("AI credits exhausted. Add credits in workspace billing.");
        else toast.error(body || "Chat failed");
        setStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamed(acc);
      }
      // Auto-title on first exchange
      const currentTitle = convos?.find((c) => c.id === activeId)?.title;
      if (currentTitle === "New conversation") {
        const title = text.slice(0, 60);
        updateConvo.mutate({ id: activeId, patch: { title } });
      }
      await refetchMessages();
      setStreamed("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setStreaming(false);
    }
  };

  const active = convos?.find((c) => c.id === activeId);

  return (
    <>
      <PageHeader
        title="AI Workspace"
        subtitle={active?.title || "Chat with Lucy's agents"}
        actions={
          <Button size="sm" onClick={() => createConvo.mutate()} disabled={createConvo.isPending || !workspace}>
            <Plus className="mr-1.5 h-4 w-4" /> New chat
          </Button>
        }
      />
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 divide-y divide-border/60 lg:grid-cols-[260px_1fr] lg:divide-x lg:divide-y-0">
        <aside className="hidden overflow-y-auto p-3 lg:block">
          <div className="mb-2 flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <History className="h-3 w-3" /> Conversations
          </div>
          {convos?.length === 0 && (
            <div className="px-2 py-8 text-center text-xs text-muted-foreground">
              No conversations yet. Start one to talk to Lucy.
            </div>
          )}
          {convos?.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "group mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition",
                activeId === c.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              {c.pinned && <Pin className="h-3 w-3 text-primary" />}
              <span className="flex-1 truncate">{c.title}</span>
              <span className="hidden text-[10px] text-muted-foreground group-hover:inline">
                {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString() : ""}
              </span>
            </button>
          ))}
        </aside>

        <section className="flex min-w-0 flex-col">
          {!active ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">Start a conversation</h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Lucy coordinates specialized agents to help you plan, research, design, code, write, and grow.
                </p>
                <Button className="mt-4" onClick={() => createConvo.mutate()} disabled={!workspace}>
                  <Plus className="mr-1.5 h-4 w-4" /> New conversation
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2 md:px-6">
                <Input
                  className="h-8 max-w-md border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                  value={active.title}
                  onChange={(e) =>
                    qc.setQueryData<Convo[]>(["conversations", workspace?.id], (prev) =>
                      prev?.map((c) => (c.id === active.id ? { ...c, title: e.target.value } : c))
                    )
                  }
                  onBlur={(e) => updateConvo.mutate({ id: active.id, patch: { title: e.target.value } })}
                />
                <div className="ml-auto flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => updateConvo.mutate({ id: active.id, patch: { pinned: !active.pinned } })}>
                    <Pin className={cn("h-4 w-4", active.pinned && "fill-primary text-primary")} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => updateConvo.mutate({ id: active.id, patch: { archived: true } })}>
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete this conversation?")) deleteConvo.mutate(active.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1" viewportRef={scrollRef}>
                <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
                  {messages?.length === 0 && !streaming && (
                    <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                      Say hello to Lucy — she has access to your project memory and can call on strategist, researcher, engineer, designer, writer, and analyst agents.
                    </div>
                  )}
                  {messages?.map((m) => <MessageBubble key={m.id} m={m} />)}
                  {streaming && streamed && (
                    <MessageBubble m={{ id: "streaming", role: "assistant", content: streamed, created_at: new Date().toISOString() }} />
                  )}
                  {streaming && !streamed && (
                    <div className="flex gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 inline h-3 w-3 animate-spin" /> Thinking…
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-border/60 bg-background/60 px-4 py-4 md:px-6">
                <div className="mx-auto max-w-3xl">
                  <div className="rounded-2xl border border-border/70 surface p-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Ask Lucy anything…"
                      className="min-h-[64px] resize-none border-0 bg-transparent focus-visible:ring-0"
                    />
                    <div className="flex items-center gap-2 px-2 pb-1">
                      <Badge variant="outline" className="border-border/60">
                        <FileText className="mr-1 h-3 w-3" /> {active.model.split("/")[1]}
                      </Badge>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">⏎ send · ⇧⏎ newline</span>
                        <Button size="sm" onClick={send} disabled={streaming || !input.trim()}>
                          {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="mr-1 h-3.5 w-3.5" /> Send</>}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
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
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-medium">Lucy</span>
          <Badge variant="outline" className="h-4 border-border/60 px-1 text-[10px]">agent</Badge>
        </div>
        <div className="prose prose-invert prose-sm max-w-none rounded-2xl rounded-tl-sm border border-border/70 bg-card/60 px-4 py-3 leading-relaxed">
          <ReactMarkdown>{m.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
