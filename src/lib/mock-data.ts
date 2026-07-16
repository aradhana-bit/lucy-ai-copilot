export type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "paused" | "shipped";
  progress: number;
  agents: number;
  updatedAt: string;
  color: string;
};

export const projects: Project[] = [
  { id: "atlas", name: "Atlas — B2B SaaS Launch", description: "Vertical CRM for logistics teams. Target beta in 6 weeks.", status: "active", progress: 62, agents: 5, updatedAt: "2h ago", color: "oklch(0.72 0.17 285)" },
  { id: "harbor", name: "Harbor Newsletter", description: "Weekly deep-dive on operator playbooks. Growth loop via referrals.", status: "active", progress: 41, agents: 3, updatedAt: "5h ago", color: "oklch(0.72 0.16 200)" },
  { id: "meridian", name: "Meridian Mobile", description: "Personal-finance companion for freelancers. iOS first.", status: "planning", progress: 12, agents: 2, updatedAt: "1d ago", color: "oklch(0.75 0.16 155)" },
  { id: "quill", name: "Quill Editor", description: "AI-native writing surface for long-form content teams.", status: "shipped", progress: 100, agents: 4, updatedAt: "3d ago", color: "oklch(0.8 0.16 75)" },
  { id: "orbit", name: "Orbit Analytics", description: "Product analytics for AI applications and agent workflows.", status: "paused", progress: 28, agents: 2, updatedAt: "1w ago", color: "oklch(0.7 0.2 340)" },
  { id: "signal", name: "Signal Research", description: "Continuous market intelligence for early-stage founders.", status: "active", progress: 78, agents: 6, updatedAt: "12m ago", color: "oklch(0.72 0.17 285)" },
];

export type Task = {
  id: string;
  title: string;
  project: string;
  status: "backlog" | "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: { name: string; kind: "human" | "agent" };
  due: string;
  progress: number;
};

export const tasks: Task[] = [
  { id: "t1", title: "Draft go-to-market brief for Atlas beta", project: "Atlas", status: "in_progress", priority: "high", assignee: { name: "Strategist", kind: "agent" }, due: "Today", progress: 60 },
  { id: "t2", title: "Compile competitor teardown — 8 vendors", project: "Signal", status: "review", priority: "medium", assignee: { name: "Researcher", kind: "agent" }, due: "Tomorrow", progress: 90 },
  { id: "t3", title: "Design onboarding flow v3", project: "Meridian", status: "todo", priority: "high", assignee: { name: "Sam Ortega", kind: "human" }, due: "Fri", progress: 0 },
  { id: "t4", title: "Ship Stripe metered billing", project: "Atlas", status: "in_progress", priority: "urgent", assignee: { name: "Engineer", kind: "agent" }, due: "Wed", progress: 35 },
  { id: "t5", title: "Publish issue #14 — retention playbooks", project: "Harbor", status: "done", priority: "medium", assignee: { name: "Writer", kind: "agent" }, due: "Yesterday", progress: 100 },
  { id: "t6", title: "Refactor auth session handling", project: "Atlas", status: "backlog", priority: "low", assignee: { name: "Priya Nair", kind: "human" }, due: "Next week", progress: 0 },
  { id: "t7", title: "Investigate churn spike from Tue release", project: "Orbit", status: "todo", priority: "urgent", assignee: { name: "Analyst", kind: "agent" }, due: "Today", progress: 10 },
  { id: "t8", title: "Landing page copy pass", project: "Quill", status: "review", priority: "low", assignee: { name: "Writer", kind: "agent" }, due: "Fri", progress: 80 },
];

export type Agent = {
  id: string;
  name: string;
  role: string;
  status: "idle" | "working" | "waiting";
  color: string;
};

export const agents: Agent[] = [
  { id: "strategist", name: "Strategist", role: "GTM, positioning, pricing", status: "working", color: "oklch(0.72 0.17 285)" },
  { id: "researcher", name: "Researcher", role: "Market & competitor intel", status: "working", color: "oklch(0.72 0.16 200)" },
  { id: "engineer", name: "Engineer", role: "Codegen, refactors, review", status: "working", color: "oklch(0.75 0.16 155)" },
  { id: "designer", name: "Designer", role: "Flows, UI, brand systems", status: "idle", color: "oklch(0.8 0.16 75)" },
  { id: "writer", name: "Writer", role: "Copy, docs, long-form", status: "waiting", color: "oklch(0.7 0.2 340)" },
  { id: "analyst", name: "Analyst", role: "Metrics, forecasting, cohorts", status: "idle", color: "oklch(0.72 0.17 220)" },
];

export type Notification = {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  kind: "agent" | "billing" | "team" | "system";
};

export const notifications: Notification[] = [
  { id: "n1", title: "Strategist finished GTM brief", body: "12-page positioning doc ready for review in Atlas.", at: "8m ago", read: false, kind: "agent" },
  { id: "n2", title: "Priya commented on Meridian", body: "\"Let's ship the referral loop before the landing update.\"", at: "42m ago", read: false, kind: "team" },
  { id: "n3", title: "Researcher needs your input", body: "Prioritize 3 of 12 competitor angles to deep-dive.", at: "2h ago", read: false, kind: "agent" },
  { id: "n4", title: "Invoice paid", body: "Team plan · $79.00 · Visa ending 4242", at: "1d ago", read: true, kind: "billing" },
  { id: "n5", title: "New agent capability", body: "Analyst can now run cohort forecasts against Postgres.", at: "2d ago", read: true, kind: "system" },
];

export type DocItem = {
  id: string;
  title: string;
  kind: "brief" | "spec" | "research" | "memo" | "code";
  project: string;
  updated: string;
  author: string;
};

export const documents: DocItem[] = [
  { id: "d1", title: "Atlas — Positioning & Messaging v3", kind: "brief", project: "Atlas", updated: "12m ago", author: "Strategist" },
  { id: "d2", title: "Logistics CRM — Competitor teardown", kind: "research", project: "Signal", updated: "1h ago", author: "Researcher" },
  { id: "d3", title: "Onboarding v3 — interaction spec", kind: "spec", project: "Meridian", updated: "3h ago", author: "Designer" },
  { id: "d4", title: "Stripe metered billing — architecture memo", kind: "memo", project: "Atlas", updated: "1d ago", author: "Engineer" },
  { id: "d5", title: "auth/session.ts refactor", kind: "code", project: "Atlas", updated: "2d ago", author: "Engineer" },
  { id: "d6", title: "Harbor Issue #14 — Retention playbooks", kind: "brief", project: "Harbor", updated: "3d ago", author: "Writer" },
];

export type FileItem = {
  id: string;
  name: string;
  size: string;
  kind: "pdf" | "image" | "sheet" | "doc" | "video" | "code";
  updated: string;
  project: string;
};

export const files: FileItem[] = [
  { id: "f1", name: "Atlas-brand-guidelines.pdf", size: "4.2 MB", kind: "pdf", updated: "2h ago", project: "Atlas" },
  { id: "f2", name: "landing-hero.png", size: "1.8 MB", kind: "image", updated: "3h ago", project: "Quill" },
  { id: "f3", name: "financial-model-v4.xlsx", size: "612 KB", kind: "sheet", updated: "1d ago", project: "Atlas" },
  { id: "f4", name: "user-interviews-batch-3.docx", size: "228 KB", kind: "doc", updated: "1d ago", project: "Signal" },
  { id: "f5", name: "demo-walkthrough.mp4", size: "38.1 MB", kind: "video", updated: "2d ago", project: "Meridian" },
  { id: "f6", name: "billing-worker.ts", size: "12 KB", kind: "code", updated: "3d ago", project: "Atlas" },
];

export const stats = [
  { label: "Active projects", value: "6", delta: "+2 this month", trend: "up" as const },
  { label: "Agent hours", value: "184h", delta: "+38h vs last wk", trend: "up" as const },
  { label: "Tasks shipped", value: "127", delta: "+22% MoM", trend: "up" as const },
  { label: "Docs generated", value: "48", delta: "+9 this week", trend: "up" as const },
];

export const activity = [
  { t: "2m", who: "Strategist", what: "updated positioning doc in Atlas" },
  { t: "18m", who: "Researcher", what: "finished competitor teardown (8 vendors)" },
  { t: "1h", who: "Engineer", what: "opened PR: metered billing scaffolding" },
  { t: "2h", who: "You", what: "created project Signal Research" },
  { t: "3h", who: "Analyst", what: "flagged churn anomaly in Orbit" },
  { t: "1d", who: "Writer", what: "shipped Harbor issue #14" },
];
