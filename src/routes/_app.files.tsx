import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { HardDrive, Upload, Trash2, Download, Loader2 } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/files")({
  head: () => ({ meta: [{ title: "Files — Lucy" }] }),
  component: Files,
});

function fmtSize(n: number | null | undefined) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function Files() {
  const { data: workspace } = useWorkspace();
  const { user } = useSession();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  const { data: files, isLoading } = useQuery({
    queryKey: ["files", workspace?.id],
    enabled: !!workspace,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("id, name, mime, size, storage_path, created_at")
        .eq("workspace_id", workspace!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upload = async (list: FileList | null) => {
    if (!list || !workspace) return;
    setUploading(true);
    try {
      for (const file of Array.from(list)) {
        const path = `${workspace.id}/${crypto.randomUUID()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("workspace-files").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { error: dbErr } = await supabase.from("files").insert({
          workspace_id: workspace.id,
          name: file.name,
          storage_path: path,
          mime: file.type || null,
          size: file.size,
          uploaded_by: user!.id,
        });
        if (dbErr) throw dbErr;
      }
      toast.success("Uploaded");
      qc.invalidateQueries({ queryKey: ["files"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const del = useMutation({
    mutationFn: async ({ id, path }: { id: string; path: string }) => {
      await supabase.storage.from("workspace-files").remove([path]);
      const { error } = await supabase.from("files").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["files"] }); toast.success("Removed"); },
  });

  const download = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("workspace-files").createSignedUrl(path, 60);
    if (error || !data) return toast.error("Download failed");
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = name;
    a.click();
  };

  return (
    <>
      <PageHeader
        title="Files"
        subtitle="Every asset uploaded to your workspace."
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => upload(e.target.files)}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />} Upload
            </Button>
          </>
        }
      />
      <PageBody className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          className={`rounded-xl border-2 border-dashed p-8 text-center text-sm text-muted-foreground transition ${drag ? "border-primary bg-primary/5" : "border-border/60"}`}
        >
          Drag files here to upload, or click Upload above.
        </div>

        {isLoading ? (
          <div className="grid gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-lg border border-border/60 bg-card/40" />)}</div>
        ) : files?.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <HardDrive className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-3 font-medium">No files yet</h3>
          </Card>
        ) : (
          <Card className="divide-y divide-border/60 border-border/60">
            {files?.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-3 md:p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><HardDrive className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {fmtSize(f.size)} · {f.mime || "file"} · {formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => download(f.storage_path, f.name)}><Download className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete file?")) del.mutate({ id: f.id, path: f.storage_path }); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </Card>
        )}
      </PageBody>
    </>
  );
}
