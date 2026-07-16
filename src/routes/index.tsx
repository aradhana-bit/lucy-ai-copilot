import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, Bot, Layers, LineChart, FileText, Code2, Palette,
  Search, Check, Star, Twitter, Github, Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lucy — The AI Workforce That Builds Your Business" },
      { name: "description", content: "Lucy coordinates specialized AI agents that help founders plan, research, design, code, write, and grow — all from one workspace." },
    ],
  }),
  component: Landing,
});

const agents = [
  { icon: LineChart, name: "Strategist", desc: "Positioning, pricing, and GTM plans that ship." },
  { icon: Search, name: "Researcher", desc: "Deep market and competitor intel on demand." },
  { icon: Code2, name: "Engineer", desc: "Generates and reviews production-ready code." },
  { icon: Palette, name: "Designer", desc: "Flows, UI systems, and brand direction." },
  { icon: FileText, name: "Writer", desc: "Docs, copy, and long-form that sounds like you." },
  { icon: Bot, name: "Analyst", desc: "Metrics, cohorts, and forecasts you can trust." },
];

const steps = [
  { n: "01", t: "Describe your idea", d: "Tell Lucy what you're building. She scopes it into a plan, milestones, and the right agents." },
  { n: "02", t: "Agents get to work", d: "Research, design, code, and content run in parallel — with your approval on the important calls." },
  { n: "03", t: "You ship faster", d: "Track progress, review artifacts, and launch — with a workforce that never context-switches." },
];

const plans = [
  { name: "Starter", price: "$0", period: "/mo", desc: "For founders exploring an idea.", features: ["1 project", "3 core agents", "50 agent hours / mo", "Community support"], cta: "Start free", featured: false },
  { name: "Team", price: "$79", period: "/mo", desc: "For teams shipping in earnest.", features: ["Unlimited projects", "All 8 agents", "1,000 agent hours / mo", "Realtime collaboration", "Priority support"], cta: "Start 14-day trial", featured: true },
  { name: "Scale", price: "Custom", period: "", desc: "For funded startups & studios.", features: ["Unlimited agent hours", "Custom agents & tools", "SSO, audit logs, SOC 2", "Dedicated success manager"], cta: "Talk to sales", featured: false },
];

const testimonials = [
  { q: "Lucy replaced three contractors in our first month. The strategist alone paid for the year.", who: "Maya Okafor", role: "Founder, Northline" },
  { q: "It's the first agent product that doesn't feel like a chatbot glued to a UI. It just… works.", who: "Daniel Rhee", role: "CTO, Parcelwise" },
  { q: "We ran a 6-week launch in 11 days. My designer and I finally have leverage.", who: "Priya Nair", role: "Solo founder" },
];

const faqs = [
  { q: "Is Lucy a chatbot?", a: "No. Lucy is an operating system. Specialized agents run in parallel with structured memory, artifacts, and task graphs — not a single chat window." },
  { q: "Does Lucy write real, shippable code?", a: "Yes. The Engineer agent produces production-ready TypeScript, opens PRs, and reviews changes. You stay in control of merges." },
  { q: "Can I bring my own models or tools?", a: "On Team and Scale plans, you can wire in your own model keys, MCP tools, and internal APIs." },
  { q: "How does pricing work?", a: "Plans include a monthly agent-hour budget. Additional hours are billed transparently at cost. No token math surprises." },
  { q: "Is my data private?", a: "Your data is isolated per workspace, encrypted at rest, and never used to train foundation models. SOC 2 available on Scale." },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <AgentsGrid />
      <Benefits />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-chart-5 text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">Lucy</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition hover:text-foreground">Features</a>
          <a href="#how" className="text-sm text-muted-foreground transition hover:text-foreground">How it works</a>
          <a href="#pricing" className="text-sm text-muted-foreground transition hover:text-foreground">Pricing</a>
          <a href="#faq" className="text-sm text-muted-foreground transition hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden text-sm text-muted-foreground transition hover:text-foreground sm:inline">Sign in</Link>
          <Link to="/dashboard">
            <Button size="sm" className="rounded-lg">Open Lucy <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-[-10rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-28 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge variant="outline" className="rounded-full border-border/70 bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-success" /> Now in private beta — 2,400 founders building
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl"
        >
          The AI workforce that <span className="text-gradient">builds your business.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Lucy coordinates specialized agents that plan, research, design, code, write and grow — so a solo founder ships like a team of ten.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link to="/dashboard"><Button size="lg" className="h-11 rounded-lg px-6">Start building free <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          <a href="#how"><Button size="lg" variant="outline" className="h-11 rounded-lg border-border bg-secondary/60 px-6 hover:bg-accent">See how it works</Button></a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="rounded-2xl border border-border/70 surface p-2 shadow-elevated">
            <div className="rounded-xl bg-background/60 p-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-muted-foreground">lucy.app / atlas</span>
              </div>
              <div className="grid gap-4 pt-6 md:grid-cols-3">
                {[
                  { t: "Strategist", s: "Positioning v3 ready", p: 92 },
                  { t: "Researcher", s: "Competitor teardown (8/8)", p: 100 },
                  { t: "Engineer", s: "PR: metered billing", p: 68 },
                ].map((c) => (
                  <div key={c.t} className="rounded-xl border border-border/70 bg-card/60 p-4 text-left">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.t}</div>
                    <div className="mt-2 text-sm font-medium">{c.s}</div>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-5" style={{ width: `${c.p}%` }} />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{c.p}% complete</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const logos = ["Northline", "Parcelwise", "Meridian", "Harbor", "Quill", "Orbit"];
  return (
    <div className="border-y border-border/50 bg-secondary/20">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 py-8 text-sm text-muted-foreground">
        <span className="mr-2 text-xs uppercase tracking-widest">Trusted by builders at</span>
        {logos.map((l) => <span key={l} className="text-base font-medium opacity-80">{l}</span>)}
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { icon: Layers, t: "One workspace, every function", d: "Projects, tasks, docs, files, calendar, and research — unified around each thing you're building." },
    { icon: Bot, t: "Specialized agents, not a chatbot", d: "Each agent has its own tools, memory, and evaluation loop. They collaborate — you approve the big calls." },
    { icon: LineChart, t: "Progress you can trust", d: "Task graphs, artifacts, and audit trails. Every action is inspectable and re-runnable." },
    { icon: FileText, t: "Real documents, real code", d: "Positioning briefs, technical specs, and PRs — not throwaway chat snippets." },
    { icon: Search, t: "Continuous market intelligence", d: "Researcher agent watches your space and pings you when signals change." },
    { icon: Sparkles, t: "Feels like a product, not a toolkit", d: "Designed with the care of Linear, the polish of Vercel, the calm of Notion." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="Features" title="An operating system for founders." sub="Everything you need to move an idea to a company — coordinated, not scattered across tabs." />
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => (
          <motion.div
            key={f.t}
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.04 }}
            className="group rounded-2xl border border-border/70 surface p-6 transition hover:border-border"
          >
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-t border-border/50 bg-secondary/10">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader eyebrow="How Lucy works" title="From idea to launch, in three moves." />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/70 surface p-8">
              <div className="text-sm font-medium text-primary">{s.n}</div>
              <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentsGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="The workforce" title="Six specialists. One workspace." sub="Every Lucy agent has domain training, tool access, and its own quality bar. They hand off to each other automatically." />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <div key={a.name} className="rounded-2xl border border-border/70 surface p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><a.icon className="h-5 w-5" /></div>
              <div className="text-base font-semibold">{a.name}</div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  const rows = [
    ["Ship 6× faster", "Parallel agent execution replaces serial handoffs."],
    ["Stop context-switching", "One workspace instead of ten SaaS tabs."],
    ["Compound your knowledge", "Everything Lucy learns about your business stays with her."],
    ["Keep the taste calls", "Agents propose. You decide. No black boxes."],
  ];
  return (
    <section className="border-t border-border/50">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2">
        <div>
          <SectionHeader eyebrow="Why founders choose Lucy" title="A team's leverage, without the payroll." align="left" />
        </div>
        <div className="space-y-4">
          {rows.map(([t, d]) => (
            <div key={t} className="flex gap-4 rounded-xl border border-border/70 surface p-5">
              <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary"><Check className="h-3.5 w-3.5" /></div>
              <div><div className="font-medium">{t}</div><div className="mt-1 text-sm text-muted-foreground">{d}</div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/50 bg-secondary/10">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader eyebrow="Pricing" title="Simple, transparent, hour-based." sub="Every plan includes a monthly agent-hour budget. No token math. No surprises." />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-2xl border p-8 ${p.featured ? "border-primary/60 surface shadow-glow" : "border-border/70 surface"}`}>
              {p.featured && <Badge className="absolute -top-3 left-8 rounded-full bg-primary text-primary-foreground">Most popular</Badge>}
              <div className="text-sm font-medium text-muted-foreground">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{p.desc}</div>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> {f}</li>
                ))}
              </ul>
              <Link to="/auth" className="mt-8 block">
                <Button className="w-full rounded-lg" variant={p.featured ? "default" : "outline"}>{p.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="Loved by operators" title="Built for people who ship." />
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.who} className="rounded-2xl border border-border/70 surface p-6">
            <div className="flex gap-1 text-warning">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-warning" />)}</div>
            <p className="mt-4 text-sm leading-relaxed">"{t.q}"</p>
            <div className="mt-6 text-sm">
              <div className="font-medium">{t.who}</div>
              <div className="text-muted-foreground">{t.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="border-t border-border/50 bg-secondary/10">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <SectionHeader eyebrow="FAQ" title="Answers, no marketing fluff." />
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`i-${i}`} className="border-border/70">
              <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-border/50">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Your workforce is waiting.</h2>
        <p className="mt-4 text-muted-foreground">Start with a single project. Watch six agents move it forward tonight.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/dashboard"><Button size="lg" className="h-11 rounded-lg px-6">Start building free <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          <Link to="/auth"><Button size="lg" variant="outline" className="h-11 rounded-lg border-border bg-secondary/60 px-6 hover:bg-accent">Sign in</Button></Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-5 text-primary-foreground"><Sparkles className="h-3.5 w-3.5" /></div>
            <span className="text-sm font-semibold">Lucy</span>
          </Link>
          <p className="mt-4 max-w-xs text-xs text-muted-foreground">The AI workforce that builds your business. Built with care in San Francisco.</p>
        </div>
        {[
          { t: "Product", links: [["Features","#features"],["Pricing","#pricing"],["Changelog","#"],["Roadmap","#"]] },
          { t: "Company", links: [["About","#"],["Blog","#"],["Careers","#"],["Press","#"]] },
          { t: "Resources", links: [["Docs","/help"],["Support","/help"],["Status","#"],["Security","#"]] },
        ].map((col) => (
          <div key={col.t}>
            <div className="text-sm font-semibold">{col.t}</div>
            <ul className="mt-4 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}><a href={href} className="text-sm text-muted-foreground transition hover:text-foreground">{label}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Lucy Labs, Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, sub, align = "center" }: { eyebrow: string; title: string; sub?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <div className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </div>
  );
}
