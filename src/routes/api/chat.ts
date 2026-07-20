import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { Database } from "@/integrations/supabase/types";

type Body = {
  conversationId: string;
  userMessage: string;
  model?: string;
  regenerate?: boolean;
};

const SYSTEM_BASE = `You are Lucy, an AI operating system for founders. You coordinate specialized agents (Strategist, Researcher, Engineer, Designer, Writer, Analyst) to help ship a startup. You are concise, opinionated, and action-oriented. Use markdown. When useful, propose next steps as a short bulleted list.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

        const url = process.env.SUPABASE_URL!;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient<Database>(url, key, {
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
              h.set("apikey", key);
              h.set("Authorization", `Bearer ${token}`);
              return fetch(input, { ...init, headers: h });
            },
          },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const body = (await request.json()) as Body;
        if (!body.conversationId || !body.userMessage?.trim()) {
          return new Response("Bad request", { status: 400 });
        }

        // Load conversation + memories
        const { data: convo, error: convoErr } = await supabase
          .from("conversations")
          .select("id, project_id, workspace_id, system_prompt, model")
          .eq("id", body.conversationId)
          .maybeSingle();
        if (convoErr || !convo) return new Response("Conversation not found", { status: 404 });

        const model = body.model || convo.model || "google/gemini-3-flash-preview";

        // Persist user message
        const { error: insertUserErr } = await supabase.from("messages").insert({
          conversation_id: convo.id,
          role: "user",
          content: body.userMessage,
          created_by: userId,
        });
        if (insertUserErr) return new Response(insertUserErr.message, { status: 500 });

        // Bump conversation
        await supabase
          .from("conversations")
          .update({ last_message_at: new Date().toISOString() })
          .eq("id", convo.id);

        // Load full history (last 100 for context)
        const { data: history } = await supabase
          .from("messages")
          .select("role, content")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: true })
          .limit(100);

        // Load project memory
        let memoryContext = "";
        if (convo.project_id) {
          const { data: proj } = await supabase
            .from("projects")
            .select("name, description")
            .eq("id", convo.project_id)
            .maybeSingle();
          const { data: startup } = await supabase
            .from("startup_profiles")
            .select("*")
            .eq("workspace_id", convo.workspace_id)
            .maybeSingle();
          const { data: mems } = await supabase
            .from("memories")
            .select("kind, content")
            .eq("project_id", convo.project_id)
            .order("importance", { ascending: false })
            .limit(20);

          const parts: string[] = [];
          if (proj) parts.push(`# Project\n${proj.name}${proj.description ? ` — ${proj.description}` : ""}`);
          if (startup) {
            const s = startup;
            const rows = [
              s.name && `Name: ${s.name}`,
              s.vision && `Vision: ${s.vision}`,
              s.mission && `Mission: ${s.mission}`,
              s.target_audience && `Audience: ${s.target_audience}`,
              s.business_model && `Business model: ${s.business_model}`,
              s.pricing && `Pricing: ${s.pricing}`,
              s.competitors && `Competitors: ${s.competitors}`,
              s.brand_voice && `Brand voice: ${s.brand_voice}`,
              s.tech_stack && `Tech stack: ${s.tech_stack}`,
            ].filter(Boolean);
            if (rows.length) parts.push(`# Startup\n${rows.join("\n")}`);
          }
          if (mems?.length) parts.push(`# Memory\n${mems.map((m) => `- (${m.kind}) ${m.content}`).join("\n")}`);
          memoryContext = parts.join("\n\n");
        }

        const systemPrompt = [SYSTEM_BASE, convo.system_prompt, memoryContext].filter(Boolean).join("\n\n");

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(apiKey);

        const uiMessages: UIMessage[] = (history || []).map((m, i) => ({
          id: `${i}`,
          role: m.role === "assistant" ? "assistant" : "user",
          parts: [{ type: "text", text: m.content }],
        })) as UIMessage[];

        const result = streamText({
          model: gateway(model),
          system: systemPrompt,
          messages: await convertToModelMessages(uiMessages),
          onFinish: async ({ text, usage }) => {
            await supabase.from("messages").insert({
              conversation_id: convo.id,
              role: "assistant",
              content: text,
              model,
              tokens_in: usage?.inputTokens ?? null,
              tokens_out: usage?.outputTokens ?? null,
            });
            await supabase
              .from("conversations")
              .update({ last_message_at: new Date().toISOString() })
              .eq("id", convo.id);
          },
        });

        return result.toTextStreamResponse({
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
