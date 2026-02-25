import { z } from "zod";
import { analyzeJournalEntry } from "./venice";
import { analyzeWithAgent, type AgentInput, type AgentOutput } from "./agent.api";
import type { JournalEntry } from "@shared/schema";

const contextEntrySchema = z.object({
  content: z.string(),
  timestamp: z.string().optional(),
});

const contextMemorySchema = z.object({
  kind: z.string(),
  content: z.string(),
});

export const journalInsightPayloadSchema = z.object({
  type: z.literal("journal_entry"),
  user_id: z.string(),
  content: z.string().min(1),
  timestamp: z.string(),
  recentEntries: z.array(contextEntrySchema).default([]),
  pinnedMemories: z.array(contextMemorySchema).default([]),
});

export const thinkingPartnerPayloadSchema = z.object({
  type: z.literal("thinking_partner"),
  user_id: z.string(),
  question: z.string().min(1),
  relevant_memory: z.array(z.object({
    id: z.string(),
    content: z.string(),
  })).default([]),
});

export type JournalInsightPayload = z.infer<typeof journalInsightPayloadSchema>;
export type ThinkingPartnerPayload = z.infer<typeof thinkingPartnerPayloadSchema>;

export interface JournalInsightOutput {
  summary: string;
  insight: string;
  emotion_trend: string;
}

export interface ThinkingPartnerOutput {
  clarifying_questions: string[];
  core_tension: string;
  recommendation_frame: string;
}

export type AgentName = "JournalInsight" | "ThinkingPartner";
export type AgentPayload = JournalInsightPayload | ThinkingPartnerPayload;
export type AgentResult = JournalInsightOutput | ThinkingPartnerOutput;

interface AgentRunner {
  validate(payload: unknown): boolean;
  process(payload: AgentPayload, apiKeyOverride?: string): Promise<AgentResult>;
}

class JournalInsightAgent implements AgentRunner {
  validate(payload: unknown): boolean {
    return journalInsightPayloadSchema.safeParse(payload).success;
  }

  async process(payload: AgentPayload, apiKeyOverride?: string): Promise<JournalInsightOutput> {
    const data = payload as JournalInsightPayload;

    const recentEntries = (data.recentEntries || []).map((e, i) => ({
      id: String(i),
      walletAddress: "",
      content: e.content,
      createdAt: e.timestamp ? new Date(e.timestamp) : new Date(),
    })) as JournalEntry[];

    const result = await analyzeJournalEntry(data.content, recentEntries, apiKeyOverride);

    return {
      summary: result.summary,
      insight: result.insight,
      emotion_trend: this.inferEmotionTrend(result.summary, result.insight),
    };
  }

  private inferEmotionTrend(summary: string, insight: string): string {
    const text = `${summary} ${insight}`.toLowerCase();
    const signals: Record<string, string[]> = {
      optimistic: ["excited", "hopeful", "positive", "opportunity", "momentum", "progress", "growth", "confident"],
      reflective: ["considering", "thinking", "wondering", "reflecting", "questioning", "exploring", "examining"],
      anxious: ["worried", "uncertain", "risk", "concern", "fear", "doubt", "nervous", "stress"],
      determined: ["decided", "committed", "focused", "clear", "resolved", "conviction", "action", "must"],
      frustrated: ["stuck", "blocked", "frustrated", "failing", "difficult", "struggle", "problem"],
      analytical: ["data", "evidence", "pattern", "trend", "metric", "analysis", "correlation"],
    };

    let best = "reflective";
    let bestScore = 0;

    for (const [mood, keywords] of Object.entries(signals)) {
      const score = keywords.filter(k => text.includes(k)).length;
      if (score > bestScore) {
        bestScore = score;
        best = mood;
      }
    }

    return best;
  }
}

class ThinkingPartnerAgent implements AgentRunner {
  validate(payload: unknown): boolean {
    return thinkingPartnerPayloadSchema.safeParse(payload).success;
  }

  async process(payload: AgentPayload, apiKeyOverride?: string): Promise<ThinkingPartnerOutput> {
    const data = payload as ThinkingPartnerPayload;

    const agentInput: AgentInput = {
      mode: "journal",
      intent: "clarity",
      entry: data.question,
      pinnedMemory: data.relevant_memory.map(m => ({
        kind: "pattern" as const,
        content: m.content,
      })),
      priorEntries: [],
    };

    const result: AgentOutput = await analyzeWithAgent(agentInput, apiKeyOverride);

    const clarifyingQuestions: string[] = [];
    if (result.question) clarifyingQuestions.push(result.question);
    if (result.reflectiveQuestions) {
      clarifyingQuestions.push(...result.reflectiveQuestions);
    }

    return {
      clarifying_questions: clarifyingQuestions,
      core_tension: result.matters,
      recommendation_frame: result.nextMove || result.said,
    };
  }
}

const agents: Record<AgentName, AgentRunner> = {
  JournalInsight: new JournalInsightAgent(),
  ThinkingPartner: new ThinkingPartnerAgent(),
};

export async function runAgent(agentName: AgentName, payload: AgentPayload, apiKeyOverride?: string): Promise<AgentResult> {
  const agent = agents[agentName];
  if (!agent) {
    throw new Error(`Unknown agent: ${agentName}`);
  }

  if (!agent.validate(payload)) {
    throw new Error(`Invalid payload for agent ${agentName}`);
  }

  return agent.process(payload, apiKeyOverride);
}

export function formatJournalReply(data: JournalInsightOutput): string {
  return `**Summary:** ${data.summary}\n\n**Insight:** ${data.insight}\n\n**Emotional Signal:** ${data.emotion_trend}`;
}

export function formatThinkingReply(data: ThinkingPartnerOutput): string {
  let reply = `**Core Tension:** ${data.core_tension}\n\n`;

  if (data.clarifying_questions.length > 0) {
    reply += `**Questions to Consider:**\n${data.clarifying_questions.map(q => `- ${q}`).join("\n")}\n\n`;
  }

  reply += `**Frame:** ${data.recommendation_frame}`;

  return reply;
}

export function detectIntent(text: string): AgentName | null {
  const t = text.trim().toLowerCase();

  if (t.startsWith("journal:") || t.startsWith("/journal")) return "JournalInsight";
  if (t.startsWith("thinking:") || t.startsWith("/think") || t.startsWith("think:")) return "ThinkingPartner";

  return null;
}

export function extractContent(text: string, intent: AgentName): string {
  const t = text.trim();
  const prefixes: Record<AgentName, RegExp> = {
    JournalInsight: /^(?:journal:|\/journal)\s*/i,
    ThinkingPartner: /^(?:thinking:|think:|\/think)\s*/i,
  };

  return t.replace(prefixes[intent], "").trim();
}
