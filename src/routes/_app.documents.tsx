import { createFileRoute } from "@tanstack/react-router";
import { FileText, Search, Plus, Download, Share2 } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { documents } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — Lucy" }] }),
  component: Documents,
});

const kindColor: Record<string,string> = {
  brief: "bg-primary/15 text-primary border-primary/30",
  spec: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  research: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  memo: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  code: "bg-chart-5/15 text-chart-5 border-chart-5/30",
};

function Documents() {
  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Every brief, spec, memo, and research doc your agents have generated."
        actions={<Button><Plus className="mr-1.5 h-4 w-4" /> Generate doc</Button>}
      />
      <PageBody className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents" className="pl-9 bg-secondary/60" />
          </div>
          {["all","brief","spec","research","memo","code"].map(k => (
            <button key={k} className="rounded-md border border-border/60 bg-secondary/40 px-2.5 py-1 text-xs capitalize text-muted-foreground hover:text-foreground">{k}</button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map(d => (
            <Card key={d.id} className="group border-border/70 bg-card/70 p-5 transition hover:border-border">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-5 w-5" /></div>
                <Badge variant="outline" className={`capitalize ${kindColor[d.kind]}`}>{d.kind}</Badge>
              </div>
              <div className="mt-4 text-sm font-semibold leading-snug">{d.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{d.project} · {d.author} · {d.updated}</div>
              <div className="mt-4 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                <Button size="sm" variant="outline" className="h-7 text-xs"><Download className="mr-1 h-3 w-3" /> Export</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs"><Share2 className="mr-1 h-3 w-3" /> Share</Button>
              </div>
            </Card>
          ))}
        </div>
      </PageBody>
    </>
  );
}
