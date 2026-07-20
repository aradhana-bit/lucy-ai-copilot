export type PromptTemplate = {
  id: string;
  title: string;
  category: string;
  prompt: string;
};

export const PROMPT_LIBRARY: PromptTemplate[] = [
  { id: "prd", category: "Product", title: "Generate PRD", prompt: "Write a comprehensive Product Requirements Document for my startup. Include problem, users, goals, non-goals, user stories, functional requirements, success metrics, and open questions." },
  { id: "business-plan", category: "Business", title: "Business Plan", prompt: "Draft a lean business plan for my startup covering: executive summary, problem, solution, market size, business model, go-to-market, competition, team, financial projections, and milestones." },
  { id: "pitch-deck", category: "Fundraising", title: "Pitch Deck Outline", prompt: "Create a 12-slide investor pitch deck outline for my startup. For each slide, give a title, key message, and 3-5 bullet points." },
  { id: "marketing", category: "Growth", title: "Marketing Strategy", prompt: "Design a 90-day marketing strategy for my startup. Include target ICP, channels, content plan, budget allocation, and KPIs." },
  { id: "competitors", category: "Research", title: "Competitor Analysis", prompt: "Research the top 5 competitors for my startup. For each, list positioning, pricing, strengths, weaknesses, and how we can differentiate." },
  { id: "landing", category: "Marketing", title: "Landing Page Copy", prompt: "Write high-converting landing page copy for my startup: hero headline + subhead, 3 value props, social proof section, features (with benefit-oriented copy), FAQ, and CTA variants." },
  { id: "architecture", category: "Engineering", title: "Technical Architecture", prompt: "Propose a scalable technical architecture for my startup. Include stack choices, data model, key services, integrations, deployment topology, and reasoning for each decision." },
  { id: "investor-email", category: "Fundraising", title: "Investor Cold Email", prompt: "Draft 3 variants of a concise investor cold email introducing my startup, traction, ask, and next step." },
  { id: "hiring", category: "Team", title: "Hiring Plan", prompt: "Create a 12-month hiring plan for my startup. Include roles, seniority, sequencing, comp bands, and rationale." },
  { id: "forecast", category: "Finance", title: "Financial Forecast", prompt: "Build a simple 24-month financial forecast for my startup with assumptions, revenue, costs, burn, and runway. Present as a table." },
  { id: "next-tasks", category: "Ops", title: "Suggest Next Tasks", prompt: "Based on my project context, suggest the 5 highest-leverage tasks I should work on this week. Prioritize by impact/effort." },
  { id: "weekly-report", category: "Ops", title: "Weekly Startup Report", prompt: "Generate a weekly startup report from my project context: wins, losses, metrics movement, blockers, and next week's focus." },
];

export const SUGGESTED_PROMPTS = [
  "What should I focus on this week to move my startup forward?",
  "Generate a PRD for the next feature I'm building.",
  "Analyze my top 3 competitors and how I can differentiate.",
  "Draft a cold email to a potential investor.",
];
