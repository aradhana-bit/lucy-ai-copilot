import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Github, Chrome } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Lucy" }, { name: "description", content: "Sign in to your Lucy workspace." }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 600);
  };
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 lg:hidden" />
      <div className="hidden flex-col justify-between border-r border-border/60 bg-secondary/20 p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-5 text-primary-foreground"><Sparkles className="h-4 w-4" /></div>
          <span className="text-base font-semibold">Lucy</span>
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-snug tracking-tight">
            "Lucy replaced three contractors in our first month. It's the leverage every founder wishes they had on day one."
          </blockquote>
          <div className="mt-6 text-sm text-muted-foreground">— Maya Okafor, Founder at Northline</div>
        </div>
        <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} Lucy Labs, Inc.</div>
      </div>
      <div className="relative flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-5 text-primary-foreground"><Sparkles className="h-3.5 w-3.5" /></div>
            <span className="text-sm font-semibold">Lucy</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your workspace or create a new one.</p>

          <Tabs defaultValue="signin" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="e1">Email</Label><Input id="e1" type="email" required placeholder="you@company.com" /></div>
                <div className="space-y-2"><Label htmlFor="p1">Password</Label><Input id="p1" type="password" required placeholder="••••••••" /></div>
                <Button className="w-full" disabled={loading}>{loading ? "Signing in…" : <>Sign in <ArrowRight className="ml-1 h-4 w-4" /></>}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="n2">Full name</Label><Input id="n2" required placeholder="Ada Lovelace" /></div>
                <div className="space-y-2"><Label htmlFor="e2">Work email</Label><Input id="e2" type="email" required placeholder="you@company.com" /></div>
                <div className="space-y-2"><Label htmlFor="p2">Password</Label><Input id="p2" type="password" required placeholder="At least 8 characters" /></div>
                <Button className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR CONTINUE WITH <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}><Chrome className="mr-2 h-4 w-4" /> Google</Button>
            <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}><Github className="mr-2 h-4 w-4" /> GitHub</Button>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">By continuing you agree to Lucy's Terms and Privacy Policy.</p>
        </motion.div>
      </div>
    </div>
  );
}
