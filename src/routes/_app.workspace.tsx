import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Sparkles, Send, History, Plus, Pin, Archive, Trash2, Loader2, FileText,
  Copy, Check, RefreshCw, Square, Search, MoreHorizontal, Download,
  Pencil, BookMarked, X, MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageHeader } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CodeBlock, InlineCode } from "@/components/app/code-block";
import { PROMPT_LIBRARY, SUGGESTED_PROMPTS } from "@/lib/prompt-library";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useWorkspace } from "@/hooks/use-workspace";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/workspace")({
  head: () => ({ meta: [{ title: "AI Workspace — Lucy" }] }),
  component: Workspace,
});

type Msg = { id: string; role: string; content: string; created_at: string; model?: string | null };
type Convo = { id: string; title: string; pinned: boolean; archived: boolean; project_id: string | null; model: string; last_message_at: string | null; updated_at: string };

const MODELS = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (fast)" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "openai/gpt-5", label: "GPT-5" },
  { id: "openai/gpt-5-mini", label: "GPT-5 mini" },
  { id: "openai/gpt-5-nano", label: "GPT-5 nano" },
];

function Workspace() {
  const { user } = useSession();
  const { data: workspace } = useWorkspace();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamed, setStreamed] = useState("");
  const [search, setSearch] = useState("");
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const filteredConvos = useMemo(() => {
    if (!convos) return [];
    const q = search.trim().toLowerCase();
    if (!q) return convos;
    return convos.filter((c) => c.title.toLowerCase().includes(q));
  }, [convos, search]);

  useEffect(() => {
    if (!activeId && convos && convos.length) setActiveId(convos[0].id);
  }, [convos, activeId]);

  useEffect(() => { inputRef.current?.focus(); }, [activeId]);

  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, role, content, created_at, model")
        .eq("conversation_id", activeId!)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data as Msg[];
    },
  });

  // Realtime
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`msgs:${activeId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
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

  const duplicateConvo = useMutation({
    mutationFn: async (id: string) => {
      const orig = convos?.find((c) => c.id === id);
      if (!orig || !workspace) throw new Error("Not found");
      const { data: newC, error } = await supabase.from("conversations")
        .insert({ workspace_id: workspace.id, title: `${orig.title} (copy)`, created_by: user!.id, model: orig.model, project_id: orig.project_id })
        .select().single();
      if (error) throw error;
      const { data: msgs } = await supabase.from("messages").select("role, content, model").eq("conversation_id", id).order("created_at");
      if (msgs?.length) {
        await supabase.from("messages").insert(msgs.map((m) => ({ conversation_id: newC.id, role: m.role, content: m.content, model: m.model, created_by: user!.id })));
      }
      return newC;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["conversations", workspace?.id] });
      setActiveId(d.id);
      toast.success("Conversation duplicated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => refetchMessages(),
  });

  const editMessage = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase.from("messages").update({ content }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refetchMessages(); setEditingId(null); toast.success("Message updated"); },
  });

  const runStream = async (opts: { userMessage: string; regenerate?: boolean; model?: string }) => {
    if (!activeId) return;
    setStreaming(true);
    setStreamed("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: activeId, ...opts }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const body = await res.text().catch(() => "");
        if (res.status === 429) toast.error("Rate limited. Try again shortly.");
        else if (res.status === 402) toast.error("AI credits exhausted. Add credits in workspace billing.");
        else toast.error(body || "Chat failed");
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
      await refetchMessages();
      setStreamed("");
    } catch (e) {
      const err = e as Error;
      if (err.name !== "AbortError") toast.error(err.message);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeId || streaming) return;
    setInput("");
    qc.setQueryData<Msg[]>(["messages", activeId], (prev) => [
      ...(prev || []),
      { id: crypto.randomUUID(), role: "user", content: text, created_at: new Date().toISOString() },
    ]);
    await runStream({ userMessage: text });
    // Auto-title
    const currentTitle = convos?.find((c) => c.id === activeId)?.title;
    if (currentTitle === "New conversation") {
      updateConvo.mutate({ id: activeId, patch: { title: text.slice(0, 60) } });
    }
  };

  const stop = () => { abortRef.current?.abort(); };

  const regenerate = async () => {
    if (!messages?.length || !activeId || streaming) return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    await supabase.from("messages").delete().eq("id", last.id);
    await refetchMessages();
    await runStream({ userMessage: "", regenerate: true });
  };

  const changeModel = (model: string) => {
    if (!active) return;
    updateConvo.mutate({ id: active.id, patch: { model } });
    qc.setQueryData<Convo[]>(["conversations", workspace?.id], (prev) =>
      prev?.map((c) => (c.id === active.id ? { ...c, model } : c))
    );
  };

  const exportMd = () => {
    if (!active || !messages) return;
    const md = `# ${active.title}\n\n` + messages.map((m) => `**${m.role === "user" ? "You" : "Lucy"}** — ${new Date(m.created_at).toLocaleString()}\n\n${m.content}`).join("\n\n---\n\n");
    downloadBlob(md, `${slug(active.title)}.md`, "text/markdown");
  };
  const exportJson = () => {
    if (!active || !messages) return;
    downloadBlob(JSON.stringify({ conversation: active, messages }, null, 2), `${slug(active.title)}.json`, "application/json");
  };
  const exportTxt = () => {
    if (!active || !messages) return;
    const txt = messages.map((m) => `[${m.role.toUpperCase()}] ${m.content}`).join("\n\n");
    downloadBlob(txt, `${slug(active.title)}.txt`, "text/plain");
  };

  const active = convos?.find((c) => c.id === activeId);
  const stats = useMemo(() => {
    if (!messages) return { count: 0, words: 0 };
    return { count: messages.length, words: messages.reduce((a, m) => a + m.content.split(/\s+/).length, 0) };
  }, [messages]);

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
      <div className="grid h-[calc(100vh-9rem)] grid-cols-1 divide-y divide-border/60 lg:grid-cols-[280px_1fr] lg:divide-x lg:divide-y-0">
        <aside className="hidden flex-col overflow-hidden p-3 lg:flex">
          <div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <History className="h-3 w-3" /> Conversations
            <span className="ml-auto text-muted-foreground/70">{convos?.length ?? 0}</span>
          </div>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="-mx-1 flex-1 overflow-y-auto px-1">
            {filteredConvos.length === 0 && (
              <div className="px-2 py-8 text-center text-xs text-muted-foreground">
                {search ? "No matches." : "No conversations yet."}
              </div>
            )}
            {filteredConvos.map((c) => (
              <div key={c.id} className="group relative mb-0.5 flex items-center">
                <button
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 pr-8 text-left text-sm transition",
                    activeId === c.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  {c.pinned && <Pin className="h-3 w-3 shrink-0 text-primary" />}
                  <span className="flex-1 truncate">{highlight(c.title, search)}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 hover:bg-accent group-hover:opacity-100">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateConvo.mutate({ id: c.id, patch: { pinned: !c.pinned } })}>
                      <Pin className="mr-2 h-3.5 w-3.5" /> {c.pinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => duplicateConvo.mutate(c.id)}>
                      <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateConvo.mutate({ id: c.id, patch: { archived: true } })}>
                      <Archive className="mr-2 h-3.5 w-3.5" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => { if (confirm("Delete this conversation?")) deleteConvo.mutate(c.id); }}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          {!active ? (
            <WelcomeScreen onStart={(p) => { createConvo.mutate(undefined, { onSuccess: () => setInput(p ?? "") }); }} />
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
                <Select value={active.model} onValueChange={changeModel}>
                  <SelectTrigger className="h-8 w-[200px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => <SelectItem key={m.id} value={m.id} className="text-xs">{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-1">
                  <Badge variant="outline" className="hidden border-border/60 text-[10px] md:inline-flex">
                    <MessageSquare className="mr-1 h-3 w-3" /> {stats.count} · {stats.words}w
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Export</DropdownMenuLabel>
                      <DropdownMenuItem onClick={exportMd}>Markdown (.md)</DropdownMenuItem>
                      <DropdownMenuItem onClick={exportTxt}>Plain text (.txt)</DropdownMenuItem>
                      <DropdownMenuItem onClick={exportJson}>JSON (.json)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

              <div ref={scrollRef} className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl space-y-6 px-6 py-6">
                  {messages?.length === 0 && !streaming && (
                    <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                      Say hello to Lucy — she has access to your project memory and specialized agents.
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {SUGGESTED_PROMPTS.map((p) => (
                          <button key={p} onClick={() => setInput(p)}
                            className="rounded-xl border border-border/60 bg-card/40 p-3 text-left text-xs text-foreground/80 transition hover:border-primary/50 hover:bg-accent/40">
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages?.map((m, i) => (
                    <MessageBubble
                      key={m.id}
                      m={m}
                      isLast={i === messages.length - 1}
                      editing={editingId === m.id}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      onEdit={() => { setEditingId(m.id); setEditContent(m.content); }}
                      onSaveEdit={() => editMessage.mutate({ id: m.id, content: editContent })}
                      onCancelEdit={() => setEditingId(null)}
                      onDelete={() => { if (confirm("Delete this message?")) deleteMessage.mutate(m.id); }}
                      onRegenerate={regenerate}
                      canRegenerate={!streaming && i === messages.length - 1 && m.role === "assistant"}
                    />
                  ))}
                  {streaming && streamed && (
                    <MessageBubble
                      m={{ id: "streaming", role: "assistant", content: streamed, created_at: new Date().toISOString() }}
                      streaming
                    />
                  )}
                  {streaming && !streamed && (
                    <div className="flex gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
                        <Sparkles className="h-4 w-4 animate-pulse" />
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
                        <span className="inline-flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                        </span>
                        <span className="ml-2">Lucy is thinking…</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border/60 bg-background/60 px-4 py-4 md:px-6">
                <div className="mx-auto max-w-3xl">
                  {showLibrary && (
                    <PromptLibraryPanel onPick={(p) => { setInput(p); setShowLibrary(false); inputRef.current?.focus(); }} onClose={() => setShowLibrary(false)} />
                  )}
                  <div className="rounded-2xl border border-border/70 surface p-2">
                    <Textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Ask Lucy anything… (⏎ send · ⇧⏎ newline)"
                      className="min-h-[64px] resize-y border-0 bg-transparent focus-visible:ring-0"
                    />
                    <div className="flex items-center gap-2 px-2 pb-1">
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => setShowLibrary((s) => !s)}>
                        <BookMarked className="h-3.5 w-3.5" /> Prompts
                      </Button>
                      <Badge variant="outline" className="border-border/60 text-[10px]">
                        <FileText className="mr-1 h-3 w-3" /> {active.model.split("/")[1] ?? active.model}
                      </Badge>
                      <div className="ml-auto flex items-center gap-2">
                        {streaming ? (
                          <Button size="sm" variant="destructive" onClick={stop}>
                            <Square className="mr-1 h-3.5 w-3.5" /> Stop
                          </Button>
                        ) : (
                          <Button size="sm" onClick={send} disabled={!input.trim()}>
                            <Send className="mr-1 h-3.5 w-3.5" /> Send
                          </Button>
                        )}
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

function WelcomeScreen({ onStart }: { onStart: (prompt?: string) => void }) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10 text-center">
      <div className="max-w-2xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Welcome to Lucy</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your AI operating system for building a startup. Lucy remembers your project context and coordinates specialized agents.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button key={p} onClick={() => onStart(p)}
              className="rounded-xl border border-border/60 bg-card/40 p-3 text-left text-sm transition hover:border-primary/50 hover:bg-accent/40">
              {p}
            </button>
          ))}
        </div>
        <Button className="mt-6" onClick={() => onStart()}>
          <Plus className="mr-1.5 h-4 w-4" /> Start a new conversation
        </Button>
      </div>
    </div>
  );
}

function PromptLibraryPanel({ onPick, onClose }: { onPick: (p: string) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const filtered = PROMPT_LIBRARY.filter((p) =>
    !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="mb-2 rounded-2xl border border-border/70 surface p-3">
      <div className="mb-2 flex items-center gap-2">
        <BookMarked className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Prompt library</span>
        <Input placeholder="Search prompts…" value={q} onChange={(e) => setQ(e.target.value)} className="ml-2 h-7 text-xs" />
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>
      <div className="grid max-h-64 gap-1 overflow-y-auto sm:grid-cols-2">
        {filtered.map((p) => (
          <button key={p.id} onClick={() => onPick(p.prompt)}
            className="rounded-lg border border-border/50 bg-card/40 p-2 text-left transition hover:border-primary/50 hover:bg-accent/40">
            <div className="flex items-center gap-2 text-xs font-medium">{p.title}
              <Badge variant="outline" className="ml-auto h-4 border-border/60 px-1 text-[9px]">{p.category}</Badge>
            </div>
            <div className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{p.prompt}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  m, isLast, streaming, editing, editContent, setEditContent,
  onEdit, onSaveEdit, onCancelEdit, onDelete, onRegenerate, canRegenerate,
}: {
  m: Msg; isLast?: boolean; streaming?: boolean;
  editing?: boolean; editContent?: string; setEditContent?: (v: string) => void;
  onEdit?: () => void; onSaveEdit?: () => void; onCancelEdit?: () => void;
  onDelete?: () => void; onRegenerate?: () => void; canRegenerate?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(m.content); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const time = new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (m.role === "user") {
    return (
      <div className="group flex justify-end">
        <div className="max-w-[80%]">
          {editing ? (
            <div className="rounded-2xl border border-border/70 bg-secondary p-2">
              <Textarea value={editContent} onChange={(e) => setEditContent?.(e.target.value)} className="min-h-[80px] border-0 bg-transparent text-sm focus-visible:ring-0" />
              <div className="mt-1 flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={onCancelEdit}>Cancel</Button>
                <Button size="sm" onClick={onSaveEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl rounded-tr-sm border border-border/70 bg-secondary px-4 py-3 text-sm">{m.content}</div>
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground opacity-0 transition group-hover:opacity-100">
                <span>{time}</span>
                <button className="rounded p-1 hover:bg-accent" onClick={copy}>{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}</button>
                {onEdit && <button className="rounded p-1 hover:bg-accent" onClick={onEdit}><Pencil className="h-3 w-3" /></button>}
                {onDelete && <button className="rounded p-1 hover:bg-accent" onClick={onDelete}><Trash2 className="h-3 w-3" /></button>}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="group flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Sparkles className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-medium">Lucy</span>
          <Badge variant="outline" className="h-4 border-border/60 px-1 text-[10px]">agent</Badge>
          {m.model && <span className="text-[10px] text-muted-foreground">{m.model.split("/")[1]}</span>}
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {streaming && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
        </div>
        <div className="prose prose-invert prose-sm max-w-none rounded-2xl rounded-tl-sm border border-border/70 bg-card/60 px-4 py-3 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...rest }) {
                const match = /language-(\w+)/.exec(className || "");
                const value = String(children ?? "");
                const inline = !value.includes("\n");
                if (inline) return <InlineCode>{children}</InlineCode>;
                return <CodeBlock language={match?.[1] ?? ""} value={value} />;
              },
              a: ({ children, ...p }) => <a {...p} target="_blank" rel="noreferrer" className="text-primary underline">{children}</a>,
              table: ({ children }) => <div className="overflow-x-auto"><table className="min-w-full">{children}</table></div>,
            }}
          >
            {m.content}
          </ReactMarkdown>
        </div>
        {!streaming && (
          <div className="mt-1 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <button className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent" onClick={copy}>
              {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
            </button>
            {canRegenerate && onRegenerate && (
              <button className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent" onClick={onRegenerate}>
                <RefreshCw className="h-3 w-3" /> Regenerate
              </button>
            )}
            {onDelete && isLast && (
              <button className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent" onClick={onDelete}>
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "conversation";
}

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-primary/30 text-foreground">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
