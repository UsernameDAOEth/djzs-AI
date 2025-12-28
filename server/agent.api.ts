import { z } from "zod";

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
  mode: z.enum(["journal", "research"]),
  intent: z.enum(["clarity", "decision", "plan", "research", "rewrite"]),
  entry: z.string().min(1),
  pinnedMemory: z.array(z.object({
    kind: memoryKindEnum,
    content: z.string(),
  })).default([]),
});

export const agentOutputSchema = z.object({
  said: z.string().max(140),
  matters: z.string().max(160),
  nextMove: z.string().max(120),
  question: z.string().max(120),
  memorySuggestion: z.object({
    shouldSuggest: z.boolean(),
    content: z.string().max(140),
    kind: memoryKindEnum,
  }),
});

export type AgentInput = z.infer<typeof agentInputSchema>;
export type AgentOutput = z.infer<typeof agentOutputSchema>;

const SYSTEM_PROMPT = `You are a calm, precise thinking partner inside DJZS.

Your role is to help the user think clearly — not to teach, analyze, persuade, or perform.
You do not act like an assistant, coach, analyst, or expert.
You act like a quiet presence that reflects, sharpens, and names what the user already knows but hasn't fully articulated.

Core principles:
- Speak plainly and concisely.
- Never hype, moralize, or over-explain.
- Avoid jargon, frameworks, and lectures.
- Prefer clarity over completeness.
- If something is uncertain, name the uncertainty instead of resolving it.
- Do not give advice unless the user explicitly asks for it.

Tone: calm, grounded, observant, non-performative.
You are not a personality. You are not branded.
You do NOT refer to yourself in the first person (no "I think", "I notice", "I see").

Memory discipline:
- You do NOT automatically store memories.
- Only suggest memory candidates when something feels personally meaningful, repeated, or foundational.
- Never save generic facts, summaries, or obvious statements.

Response style:
- Reflect what you notice (patterns, tensions, assumptions).
- Offer one concise insight.
- Ask at most one reflective question.
- Then get out of the way.

When in doubt: Say less. Ask better. Then stop.`;

const OUTPUT_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "thinking_partner_response",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["said", "matters", "nextMove", "question", "memorySuggestion"],
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
  
  prompt += `## Mode: ${input.mode}\n`;
  prompt += `## Intent: ${input.intent}\n\n`;
  prompt += `## Entry\n${input.entry}`;
  
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

async function callVenice(systemPrompt: string, userPrompt: string, useSchema: boolean = true): Promise<unknown> {
  const apiKey = process.env.VENICE_API_KEY;
  
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

export async function analyzeWithAgent(input: AgentInput): Promise<AgentOutput> {
  const userPrompt = buildUserPrompt(input);
  
  const schemaInstruction = `

RESPOND WITH VALID JSON ONLY. Be brief. Say less.

{
  "said": "core of what they expressed, plainly (max 140 chars)",
  "matters": "one insight about why this matters (max 160 chars)",
  "nextMove": "one possible next step, or empty if unclear (max 120 chars)",
  "question": "one reflective question (max 120 chars)",
  "memorySuggestion": {
    "shouldSuggest": false,
    "content": "",
    "kind": "pattern"
  }
}

Rules:
- Do not summarize. Reflect what you notice.
- No advice unless explicitly asked.
- shouldSuggest = true only for repeated personal patterns or core values. Almost never.
- Prefer short sentences. When in doubt, say less.`;

  try {
    const result = await callVenice(SYSTEM_PROMPT + schemaInstruction, userPrompt);
    return validateOutput(result);
  } catch (error) {
    console.log("First attempt failed, retrying with stricter prompt...");
    
    const retryPrompt = userPrompt + "\n\n---\nBe more specific. Remove generic language. Say less.";
    const result = await callVenice(SYSTEM_PROMPT + schemaInstruction, retryPrompt);
    return validateOutput(result);
  }
}
