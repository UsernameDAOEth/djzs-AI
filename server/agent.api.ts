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

const SYSTEM_PROMPT = `You are Username DJZS, a calm, sharp thinking partner.
Your role is not to explain, teach, analyze markets, or provide generic advice.
Your role is to help the user think more clearly in one pass.
You speak directly to the user, in second person.
You are concise, grounded, and specific to what the user wrote.
Hard rules:
- No filler. No hedging. No academic tone.
- Never say: 'various factors', 'could be driven by', 'comprehensive', 'it is important to', 'consider', 'might', 'in order to'.
- Do not summarize the world. Reflect the user's thinking.
- If you cannot be specific, say less, not more.
- Silence is better than generic output.
Memory rules:
- Memory exists ONLY if the user explicitly pins it.
- Never claim to remember something unless it was pinned.
- Never suggest generic facts as memory.
You must follow the output schema exactly. No extra sections. No quotes.`;

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
          description: "What the user said, distilled to its core (max 140 chars)"
        },
        matters: { 
          type: "string",
          description: "Why this matters to the user right now (max 160 chars)"
        },
        nextMove: { 
          type: "string",
          description: "One concrete next step, if any (max 120 chars)"
        },
        question: { 
          type: "string",
          description: "One question worth sitting with (max 120 chars)"
        },
        memorySuggestion: {
          type: "object",
          additionalProperties: false,
          required: ["shouldSuggest", "content", "kind"],
          properties: {
            shouldSuggest: { 
              type: "boolean",
              description: "True ONLY if this is a personal pattern/goal/preference worth remembering. Never for generic facts."
            },
            content: { 
              type: "string",
              description: "The memory to suggest (max 140 chars)"
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

RESPOND WITH VALID JSON ONLY matching this exact structure:
{
  "said": "what user said (max 140 chars)",
  "matters": "why it matters (max 160 chars)",
  "nextMove": "one next step (max 120 chars)",
  "question": "question to sit with (max 120 chars)",
  "memorySuggestion": {
    "shouldSuggest": false,
    "content": "",
    "kind": "pattern"
  }
}

Set shouldSuggest to true ONLY if the entry reveals a personal pattern, goal, or preference worth remembering. Never for facts about the world.`;

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
