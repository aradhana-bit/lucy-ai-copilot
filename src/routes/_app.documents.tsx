import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { FileText, Search, Plus, Trash2, Loader2, Star } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — Lucy" }] }),
  component: Documents,
});

const KIND_COLORS: Record<string, string> = {
  brief: "bg-primary/15 text-primary border-primary/30",
  spec: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  research: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  memo: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  plan: "bg-chart-5/15 text-chart-5 border-chart-5/30",
  code: "bg-secondary text-foreground border-border",
  other: "bg-muted text-muted-foreground",
};

function Documents() {
  const { data: workspace } = useWorkspace();
  const { user } = useSession();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents", workspace?.id, q],
    enabled: !!workspace,
    queryFn: async () => {
      let query = supabase.from("documents").select("id, title, kind, updated_at, favorite, tags, content").eq("workspace_id", workspace!.id).order("updated_at", { ascending: false });
      if (q.trim()) query = query.ilike("title", `%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (input: { title: string; kind: string; content: string }) => {
      const { error } = await supabase.from("documents").insert({
        workspace_id: workspace!.id, title: input.title, kind: input.kind as any, content: input.content, created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Document created"); setOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleFav = useMutation({
    mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => {
      const { error } = await supabase.from("documents").update({ favorite }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["documents"] }); toast.success("Deleted"); },
  });

  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Every brief, spec, memo, and research doc your agents generate."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-1.5 h-4 w-4" /> New document</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>New document</DialogTitle></DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  create.mutate({ title: String(fd.get("title")), kind: String(fd.get("kind") || "other"), content: String(fd.get("content") || "") });
                }}
                className="space-y-4"
              >
                <div className="space-y-2"><Label>Title</Label><Input name="title" required /></div>
                <div className="space-y-2">
                  <Label>Kind</Label>
                  <Select name="kind" defaultValue="brief"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["brief","spec","research","memo","plan","code","other"].map((k) => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Content</Label><Textarea name="content" rows={6} /></div>
                <DialogFooter><Button type="submit" disabled={create.isPending}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      <PageBody className="space-y-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents" className="pl-9 bg-secondary/60" />
        </div>
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl border border-border/60 bg-card/40" />)}</div>
        ) : docs?.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-medium">No documents yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Generate one with Lucy or create one manually.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docs?.map((d) => (
              <Card key={d.id} className="group border-border/70 bg-card/70 p-5 transition hover:border-border">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                  <Badge variant="outline" className={`capitalize ${KIND_COLORS[d.kind]}`}>{d.kind}</Badge>
                </div>
                <div className="mt-4 text-sm font-semibold leading-snug">{d.title}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.content?.slice(0, 120) || "Empty document"}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(d.updated_at), { addSuffix: true })}
                </div>
                <div className="mt-3 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toggleFav.mutate({ id: d.id, favorite: !d.favorite })}>
                    <Star className={cn("mr-1 h-3 w-3", d.favorite && "fill-primary text-primary")} /> {d.favorite ? "Unstar" : "Star"}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { if (confirm("Delete document?")) del.mutate(d.id); }}>
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
