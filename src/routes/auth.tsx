import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Apple, Chrome, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Lucy" },
      { name: "description", content: "Sign in to your Lucy workspace." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<null | "google" | "apple">(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const forgot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email"));
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email for the reset link");
    setForgotOpen(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { display_name: String(fd.get("name") || "") },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created");
    navigate({ to: "/dashboard" });
  };

  const oauth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setOauthLoading(null);
      toast.error(result.error.message || "Sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 lg:hidden" />
      <div className="hidden flex-col justify-between border-r border-border/60 bg-secondary/20 p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-5 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-5 text-primary-foreground">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">Lucy</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Lucy</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your workspace or create a new one.
          </p>

          <Tabs defaultValue="signin" className="mt-8">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="e1">Email</Label>
                  <Input id="e1" name="email" type="email" required placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p1">Password</Label>
                  <Input id="p1" name="password" type="password" required placeholder="••••••••" />
                </div>
                <Button className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="ml-1 h-4 w-4" /></>}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="n2">Full name</Label>
                  <Input id="n2" name="name" required placeholder="Ada Lovelace" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e2">Work email</Label>
                  <Input id="e2" name="email" type="email" required placeholder="you@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p2">Password</Label>
                  <Input id="p2" name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
                </div>
                <Button className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR CONTINUE WITH <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" disabled={!!oauthLoading} onClick={() => oauth("google")}>
              {oauthLoading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Chrome className="mr-2 h-4 w-4" /> Google</>}
            </Button>
            <Button variant="outline" disabled={!!oauthLoading} onClick={() => oauth("apple")}>
              {oauthLoading === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Apple className="mr-2 h-4 w-4" /> Apple</>}
            </Button>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to Lucy's Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
