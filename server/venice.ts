import { 
  journalAnalysisSchema, 
  type JournalAnalysis, 
  type JournalEntry, 
} from "@shared/schema";
import { DJZS_CORE_IDENTITY } from "./ai-identity";

const VENICE_API_BASE = process.env.VENICE_BASE_URL || "https://api.venice.ai/api/v1";

const PRIMARY_MODEL = process.env.VENICE_MODEL || "deepseek-v3.2";
const FALLBACK_MODEL = "llama-3.3-70b";

const DJZS_JOURNAL_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "djzs_journal_v1",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "insight", "question"],
      properties: {
        summary: { type: "string", minLength: 10, maxLength: 600 },
        insight: { type: "string", minLength: 10, maxLength: 500 },
        question: { type: "string", minLength: 10, maxLength: 500 },
      }
    }
  }
};

function buildJournalSystemPrompt(): string {
  return `${DJZS_CORE_IDENTITY}

---

You are DJZS — a sharp, no-bullshit adversarial oracle built for founders, traders, and builders operating in volatile markets.

You exist to cut through noise, not add to it. You are not a therapist, coach, or cheerleader. You are the voice in the room that says what everyone else is too polite to say.

Your role:

1. SUMMARY: State plainly what the user actually said — and what they might be avoiding saying. Strip the narrative. Get to the core.

2. INSIGHT: Identify the one thing that matters most. Apply the Evasion Defense Execution Pipeline:
   - STRIP the text to raw premises — ignore rhetoric, jargon, formatting.
   - INVERT — what is the most likely catastrophic failure scenario? If not hedged, it is a fatal flaw.
   - TRACE — who benefits financially or strategically regardless of success?
   - CLASSIFY — evaluate strictly against the 7 DJZS-LF codes (S01, S02, E01, E02, I01, I02, X01). Diagnosis only, no fix advice.
   Look for:
   - Is this thinking driven by strategy or by emotion (FOMO, fear, ego, social pressure)?
   - Contradictions between stated goals and actual behavior
   - Assumptions that haven't been stress-tested
   - Narrative dependency — are they thinking independently or echoing Twitter/community consensus?

3. QUESTION: Ask one question designed to make them uncomfortable in a productive way. Good questions:
   - Force them to confront what they're avoiding
   - Challenge the real motivation behind a decision
   - Expose the gap between conviction and evidence
   - Ask "would you still do this if nobody was watching?"

Be direct. Be precise. Don't soften to be liked. If the reasoning is sound, say so briefly. If it's not — say that too, clearly. No padding. No filler. No "great insight."

IMPORTANT: You must respond with valid JSON only. No markdown, no explanation. Use this exact format:
{"summary": "...", "insight": "...", "question": "..."}`;
}

function buildUserPrompt(
  entry: string,
  recentEntries: JournalEntry[],
): string {
  let prompt = "";

  if (recentEntries.length > 0) {
    prompt += "## Recent Entries\n";
    recentEntries.forEach((e) => {
      const date = new Date(e.createdAt).toLocaleDateString();
      prompt += `### ${date}\n${e.content.slice(0, 500)}${e.content.length > 500 ? "..." : ""}\n\n`;
    });
  }

  prompt += "## Today's Entry\n";
  prompt += entry;
  prompt += "\n\n---\nAnalyze this entry in context of my recent writing.";

  return prompt;
}

async function callVenice(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
): Promise<string> {
  const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: DJZS_JOURNAL_SCHEMA,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Venice API error [${model}]: ${response.status} — ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`No content in Venice response from model: ${model}`);
  }

  return content;
}

export async function analyzeJournalEntry(
  entry: string,
  recentEntries: JournalEntry[],
  apiKeyOverride?: string
): Promise<JournalAnalysis> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const messages = [
    { role: "system", content: buildJournalSystemPrompt() },
    { role: "user", content: buildUserPrompt(entry, recentEntries) },
  ];

  let content: string;

  try {
    content = await callVenice(apiKey, PRIMARY_MODEL, messages);
    console.log(`[Venice] Audit completed via primary model: ${PRIMARY_MODEL}`);
  } catch (primaryError) {
    console.warn(`[Venice] Primary model (${PRIMARY_MODEL}) failed — falling back to ${FALLBACK_MODEL}:`, primaryError);
    try {
      content = await callVenice(apiKey, FALLBACK_MODEL, messages);
      console.log(`[Venice] Audit completed via fallback model: ${FALLBACK_MODEL}`);
    } catch (fallbackError) {
      console.error(`[Venice] Both models failed. Fallback error:`, fallbackError);
      throw new Error(`Venice inference failed on both ${PRIMARY_MODEL} and ${FALLBACK_MODEL}`);
    }
  }

  const sanitized = content.replace(/[\x00-\x1F\x7F]/g, (ch: string) =>
    ch === '\n' || ch === '\r' || ch === '\t' ? ch : ' '
  );

  const parsed = JSON.parse(sanitized);
  return journalAnalysisSchema.parse(parsed);
}
