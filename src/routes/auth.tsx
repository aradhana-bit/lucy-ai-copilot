import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entering Lucy" },
      { name: "description", content: "Preparing your Lucy workspace." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        toast.error(error.message || "Could not start your workspace");
        return;
      }
      navigate({ to: "/dashboard", replace: true });
    })();
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative flex flex-col items-center gap-4 text-center"
      >
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-chart-5 text-primary-foreground shadow-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Spinning up your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lucy is preparing a fresh session for you…</p>
        </div>
        <Loader2 className="mt-2 h-5 w-5 animate-spin text-muted-foreground" />
      </motion.div>
    </div>
  );
}
