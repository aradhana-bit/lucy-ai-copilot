import { createFileRoute } from "@tanstack/react-router";
import { Upload, FolderPlus, FileText, Image as ImageIcon, FileSpreadsheet, FileVideo, FileCode, File as FileIcon, MoreHorizontal, Download, Share2, Trash2 } from "lucide-react";
import { PageHeader, PageBody } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { files } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/files")({
  head: () => ({ meta: [{ title: "Files — Lucy" }] }),
  component: Files,
});

const icons = { pdf: FileText, image: ImageIcon, sheet: FileSpreadsheet, doc: FileText, video: FileVideo, code: FileCode } as const;

function Files() {
  return (
    <>
      <PageHeader
        title="Files"
        subtitle="Shared storage across your workspace, versioned per project."
        actions={<>
          <Button variant="outline"><FolderPlus className="mr-1.5 h-4 w-4" /> New folder</Button>
          <Button><Upload className="mr-1.5 h-4 w-4" /> Upload</Button>
        </>}
      />
      <PageBody className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Atlas","Meridian","Signal","Harbor"].map(f => (
            <Card key={f} className="flex items-center gap-3 border-border/70 bg-card/70 p-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><FolderPlus className="h-5 w-5" /></div>
              <div>
                <div className="text-sm font-medium">{f}</div>
                <div className="text-xs text-muted-foreground">{Math.floor(Math.random()*40)+6} files</div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="border-border/70 bg-card/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map(f => {
                const Icon = icons[f.kind] || FileIcon;
                return (
                  <TableRow key={f.id}>
                    <TableCell><div className="flex items-center gap-3"><div className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-muted-foreground"><Icon className="h-4 w-4" /></div><span className="font-medium">{f.name}</span></div></TableCell>
                    <TableCell className="text-muted-foreground">{f.project}</TableCell>
                    <TableCell className="text-muted-foreground">{f.size}</TableCell>
                    <TableCell className="text-muted-foreground">{f.updated}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Download className="mr-2 h-3.5 w-3.5" /> Download</DropdownMenuItem>
                          <DropdownMenuItem><Share2 className="mr-2 h-3.5 w-3.5" /> Share</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </PageBody>
    </>
  );
}
