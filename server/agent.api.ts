import { z } from "zod";
import { DJZS_CORE_IDENTITY } from "./ai-identity";

const VENICE_API_BASE = process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1";
const VENICE_MODEL = process.env.VENICE_MODEL || "llama-3.3-70b";

const FORBIDDEN_PHRASES = [
  "various factors",
  "could be driven by",
  "comprehensive",
  "it is important to",
  "consider",
  "might",
  "in order to",
  "as an ai",
  "i think you should",
  "here are some tips",
  "let me explain",
  "you should",
  "i would recommend",
  "i suggest",
  "i believe",
  "i notice",
  "i see",
  "holistic",
  "framework",
  "leverage",
  "optimize",
  "actionable",
  "impactful",
];

const memoryKindEnum = z.enum(["goal", "pattern", "preference", "project", "principle", "question", "person"]);

export const agentInputSchema = z.object({
  mode: z.enum(["journal"]),
  intent: z.enum(["clarity", "decision", "plan", "rewrite"]),
  entry: z.string().min(1),
  pinnedMemory: z.array(z.object({
    kind: memoryKindEnum,
    content: z.string(),
  })).default([]),
  priorEntries: z.array(z.object({
    text: z.string(),
    createdAt: z.string(),
  })).default([]),
});

export const agentOutputSchema = z.object({
  said: z.string().max(140),
  matters: z.string().max(160),
  nextMove: z.string().max(120),
  question: z.string().max(120),
  reflectiveQuestions: z.array(z.string().max(100)).max(5).optional(),
  connectionToPrior: z.string().max(200).optional(),
  memorySuggestion: z.object({
    shouldSuggest: z.boolean(),
    content: z.string().max(140),
    kind: memoryKindEnum,
  }),
});

export type AgentInput = z.infer<typeof agentInputSchema>;
export type AgentOutput = z.infer<typeof agentOutputSchema>;

const SYSTEM_PROMPT = `${DJZS_CORE_IDENTITY}

---

You are a sharp, direct thinking partner inside DJZS — built for crypto founders, traders, and builders who need their decisions to survive volatility, not just the next hype cycle.

Your job is to cut through noise. You are not here to validate, soothe, or agree. You exist to pressure-test thinking, call out bias, and make sure decisions are driven by strategy — not FOMO, narrative addiction, or community pressure.

Core principles:
- Be blunt. If the reasoning is weak, say so.
- If a decision smells like FOMO, hype-chasing, or ego — name it directly.
- If "Twitter is pumping this narrative" is the real reason behind a move, call it out.
- If capital allocation is driven by fear or social pressure rather than conviction, flag it.
- Never soften a message to be liked. Softening is a death sentence for this model.
- Prefer precision over politeness. Say what needs to be said.
- If something is uncertain, name the uncertainty and quantify it if possible.
- Apply the Evasion Defense Execution Pipeline: STRIP premises from rhetoric, INVERT to find the catastrophic failure scenario, TRACE who benefits regardless of outcome.

What you are NOT:
- You are not a cheerleader, coach, therapist, or hype man.
- You do not say "great question" or "interesting point."
- You do NOT refer to yourself in the first person (no "I think", "I notice", "I see").
- You are not a personality. You are not branded.

Memory discipline:
- You do NOT automatically store memories.
- Only suggest memory candidates when something reveals a repeated pattern, core conviction, or strategic blind spot worth tracking.
- Never save generic facts, summaries, or obvious statements.

Response style:
- Name the real driver behind their thinking (is it strategy or emotion?).
- Surface contradictions between what they say and what they do.
- Challenge assumptions that haven't been stress-tested.
- Ask one question that forces them to confront what they're avoiding.
- Then stop. No fluff. No padding.

If the user's reasoning is sound, say so briefly and move on. Don't manufacture objections. But if it's not — don't flinch.`;

const OUTPUT_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "thinking_partner_response",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["said", "matters", "nextMove", "question", "connectionToPrior", "memorySuggestion"],
      properties: {
        said: { 
          type: "string",
          description: "The core of what user expressed, plainly stated (max 140 chars). No interpretation."
        },
        matters: { 
          type: "string",
          description: "One insight about why this matters to them (max 160 chars). Be specific, not generic."
        },
        nextMove: { 
          type: "string",
          description: "One possible next step, or empty string if none is clear (max 120 chars). No advice."
        },
        question: { 
          type: "string",
          description: "One reflective question that invites deeper thinking (max 120 chars)"
        },
        reflectiveQuestions: {
          type: "array",
          items: { type: "string" },
          description: "3-5 additional reflective questions to deepen thinking (JOURNAL mode only, max 100 chars each)"
        },
        connectionToPrior: {
          type: "string",
          description: "If prior entries provided, note a specific connection, pattern, or evolution (max 200 chars). Reference the actual content. Empty if no prior entries or no meaningful connection."
        },
        memorySuggestion: {
          type: "object",
          additionalProperties: false,
          required: ["shouldSuggest", "content", "kind"],
          properties: {
            shouldSuggest: { 
              type: "boolean",
              description: "True ONLY if entry reveals a repeated personal pattern, core value, or foundational preference. Almost always false."
            },
            content: { 
              type: "string",
              description: "The pattern worth remembering (max 140 chars). Never facts or summaries."
            },
            kind: { 
              type: "string",
              enum: ["goal", "pattern", "preference", "project", "principle", "question", "person"]
            }
          }
        }
      }
    }
  }
};

function buildUserPrompt(input: AgentInput): string {
  let prompt = "";
  
  if (input.pinnedMemory.length > 0) {
    prompt += "## What you've pinned (your memory)\n";
    input.pinnedMemory.forEach((m, i) => {
      prompt += `- [${m.kind}] ${m.content}\n`;
    });
    prompt += "\n";
  }
  
  if (input.priorEntries.length > 0) {
    prompt += "## Recent prior entries (for context - look for patterns/connections)\n";
    input.priorEntries.slice(0, 3).forEach((entry, i) => {
      const date = new Date(entry.createdAt);
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
      const timeLabel = daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`;
      const snippet = entry.text.length > 200 ? entry.text.slice(0, 200) + "..." : entry.text;
      prompt += `[${timeLabel}] ${snippet}\n\n`;
    });
  }
  
  prompt += `## Mode: ${input.mode}\n`;
  prompt += `## Intent: ${input.intent}\n\n`;
  prompt += `## Current Entry\n${input.entry}`;
  
  return prompt;
}

function containsForbiddenPhrases(text: string): boolean {
  const lower = text.toLowerCase();
  return FORBIDDEN_PHRASES.some(phrase => lower.includes(phrase));
}

function validateOutput(data: unknown): AgentOutput {
  const parsed = agentOutputSchema.parse(data);
  
  const allText = `${parsed.said} ${parsed.matters} ${parsed.nextMove} ${parsed.question} ${parsed.memorySuggestion.content}`;
  if (containsForbiddenPhrases(allText)) {
    throw new Error("Response contains forbidden phrases");
  }
  
  return parsed;
}

async function callVenice(systemPrompt: string, userPrompt: string, useSchema: boolean = true, apiKeyOverride?: string): Promise<unknown> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const body: Record<string, unknown> = {
    model: VENICE_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 800,
  };

  const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Venice API error:", response.status, errorText);
    throw new Error(`Venice API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content in Venice response");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function analyzeWithAgent(input: AgentInput, apiKeyOverride?: string): Promise<AgentOutput> {
  const userPrompt = buildUserPrompt(input);
  
  const schemaInstruction = `

RESPOND WITH VALID JSON ONLY. Be brief. Say less.

{
  "said": "core of what they expressed, plainly (max 140 chars)",
  "matters": "one insight about why this matters (max 160 chars)",
  "nextMove": "one possible next step, or empty if unclear (max 120 chars)",
  "question": "one reflective question (max 120 chars)",
  "reflectiveQuestions": ["3-5 additional questions to deepen thinking (journal mode)", "each max 100 chars"],
  "connectionToPrior": "if prior entries provided, note a specific pattern or evolution (max 200 chars). Be concrete. Empty if none.",
  "memorySuggestion": {
    "shouldSuggest": false,
    "content": "",
    "kind": "pattern"
  }
}

Rules:
- Do not summarize. Reflect what you notice.
- No advice unless explicitly asked.
- If prior entries are provided, actively look for recurring themes, evolving questions, or contrasts.
- connectionToPrior should reference specific content from prior entries (e.g., "You mentioned X two days ago, and now...")
- shouldSuggest = true only for repeated personal patterns or core values. Almost never.
- Prefer short sentences. When in doubt, say less.`;

  const modeInstructions = `\n\nJOURNAL MODE ACTIVE:
- Focus on reflective questions that invite deeper self-examination.
- reflectiveQuestions MUST contain 3-5 distinct questions that probe different angles.
- Questions should be introspective, not advice-giving.
- Examples: "What would change if you let go of this?", "Where else have you felt this before?", "What are you protecting here?"
- Each question should invite a different direction of thought.`;

  try {
    const result = await callVenice(SYSTEM_PROMPT + modeInstructions + schemaInstruction, userPrompt, true, apiKeyOverride);
    return validateOutput(result);
  } catch (error) {
    console.log("First attempt failed, retrying with stricter prompt...");
    
    const retryPrompt = userPrompt + "\n\n---\nBe more specific. Remove generic language. Say less.";
    const result = await callVenice(SYSTEM_PROMPT + modeInstructions + schemaInstruction, retryPrompt, true, apiKeyOverride);
    return validateOutput(result);
  }
}
