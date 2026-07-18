import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, FolderKanban, Bot, ListTodo, Calendar, FileText,
  HardDrive, Bell, CreditCard, User, Settings, Shield, Sparkles, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useQuery } from "@tanstack/react-query";

const PAGES = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/workspace", label: "AI Workspace", icon: Bot },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/files", label: "Files", icon: HardDrive },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const { data: workspace } = useWorkspace();
  const [q, setQ] = useState("");

  const { data: results } = useQuery({
    queryKey: ["search", workspace?.id, q],
    enabled: !!workspace && q.length >= 2,
    queryFn: async () => {
      const ws = workspace!.id;
      const like = `%${q}%`;
      const [projects, docs, tasks, convos] = await Promise.all([
        supabase.from("projects").select("id, name").eq("workspace_id", ws).ilike("name", like).limit(5),
        supabase.from("documents").select("id, title, project_id").eq("workspace_id", ws).ilike("title", like).limit(5),
        supabase.from("tasks").select("id, title, project_id").eq("workspace_id", ws).ilike("title", like).limit(5),
        supabase.from("conversations").select("id, title, project_id").eq("workspace_id", ws).ilike("title", like).limit(5),
      ]);
      return {
        projects: projects.data ?? [],
        docs: docs.data ?? [],
        tasks: tasks.data ?? [],
        convos: convos.data ?? [],
      };
    },
    staleTime: 10_000,
  });

  const go = (to: string) => { onOpenChange(false); setQ(""); navigate({ to } as never); };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput value={q} onValueChange={setQ} placeholder="Search projects, tasks, documents, conversations…" />
      <CommandList>
        <CommandEmpty>
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Search className="h-4 w-4" /> No matches. Try another query.
          </div>
        </CommandEmpty>

        {results && q.length >= 2 && (
          <>
            {results.projects.length > 0 && (
              <CommandGroup heading="Projects">
                {results.projects.map((p) => (
                  <CommandItem key={p.id} onSelect={() => go(`/projects/${p.id}`)}>
                    <FolderKanban className="mr-2 h-4 w-4" />{p.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.docs.length > 0 && (
              <CommandGroup heading="Documents">
                {results.docs.map((d) => (
                  <CommandItem key={d.id} onSelect={() => go("/documents")}>
                    <FileText className="mr-2 h-4 w-4" />{d.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.tasks.length > 0 && (
              <CommandGroup heading="Tasks">
                {results.tasks.map((t) => (
                  <CommandItem key={t.id} onSelect={() => go("/tasks")}>
                    <ListTodo className="mr-2 h-4 w-4" />{t.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {results.convos.length > 0 && (
              <CommandGroup heading="Conversations">
                {results.convos.map((c) => (
                  <CommandItem key={c.id} onSelect={() => go("/workspace")}>
                    <Bot className="mr-2 h-4 w-4" />{c.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigate">
          {PAGES.map((p) => (
            <CommandItem key={p.to} onSelect={() => go(p.to)}>
              <p.icon className="mr-2 h-4 w-4" />{p.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/workspace")}>
            <Sparkles className="mr-2 h-4 w-4" /> Start a new AI conversation
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
