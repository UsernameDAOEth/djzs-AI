import { 
  journalAnalysisSchema, 
  researchAnalysisSchema,
  type JournalAnalysis, 
  type ResearchAnalysis,
  type JournalEntry, 
  type PinnedMemory 
} from "@shared/schema";

const VENICE_API_BASE = "https://api.venice.ai/api/v1";

const DJZS_JOURNAL_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "djzs_journal_v1",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "insight", "question", "memoryCandidates"],
      properties: {
        summary: { type: "string", minLength: 10, maxLength: 300 },
        insight: { type: "string", minLength: 10, maxLength: 220 },
        question: { type: "string", minLength: 10, maxLength: 220 },
        memoryCandidates: {
          type: "array",
          maxItems: 2,
          items: { type: "string", minLength: 6, maxLength: 140 }
        }
      }
    }
  }
};

const DJZS_RESEARCH_SCHEMA = {
  type: "json_schema" as const,
  json_schema: {
    name: "djzs_research_v1",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["keyClaims", "evidence", "unknowns", "nextQuestion"],
      properties: {
        keyClaims: {
          type: "array",
          minItems: 1,
          maxItems: 5,
          items: { type: "string", minLength: 10, maxLength: 200 }
        },
        evidence: {
          type: "array",
          maxItems: 4,
          items: { type: "string", minLength: 10, maxLength: 200 }
        },
        unknowns: {
          type: "array",
          maxItems: 3,
          items: { type: "string", minLength: 10, maxLength: 200 }
        },
        nextQuestion: { type: "string", minLength: 10, maxLength: 220 }
      }
    }
  }
};

function buildJournalSystemPrompt(): string {
  return `You are a calm, precise Thinking Partner for DJZS. Your role is to help users think clearly by:

1. Summarizing their entry concisely (what they said)
2. Identifying one meaningful insight (what it means)
3. Asking one question worth sitting with (what to think about next)
4. Suggesting 0-2 facts worth remembering long-term

Be warm but not sycophantic. Be insightful but not preachy. Say less than you could. If you can't add value, return only a summary.`;
}

function buildResearchSystemPrompt(): string {
  return `You are a calm, precise Research Assistant for DJZS. Your role is to help users structure their thinking by:

1. Extracting key claims from their research notes
2. Identifying supporting evidence and data points
3. Flagging what remains uncertain or unverified
4. Suggesting the next question that would reduce uncertainty

Focus on clarity over completeness. Don't interpret - structure. Don't advise - clarify.`;
}

function buildUserPrompt(
  entry: string,
  recentEntries: JournalEntry[],
  pinnedMemories: PinnedMemory[]
): string {
  let prompt = "";

  if (pinnedMemories.length > 0) {
    prompt += "## Pinned Memories (things I want to remember)\n";
    pinnedMemories.forEach((m, i) => {
      prompt += `${i + 1}. ${m.content}\n`;
    });
    prompt += "\n";
  }

  if (recentEntries.length > 0) {
    prompt += "## Recent Entries\n";
    recentEntries.forEach((e, i) => {
      const date = new Date(e.createdAt).toLocaleDateString();
      prompt += `### ${date}\n${e.content.slice(0, 500)}${e.content.length > 500 ? "..." : ""}\n\n`;
    });
  }

  prompt += "## Today's Entry\n";
  prompt += entry;
  prompt += "\n\n---\nAnalyze this entry in context of my recent writing and memories.";

  return prompt;
}

export async function analyzeJournalEntry(
  entry: string,
  recentEntries: JournalEntry[],
  pinnedMemories: PinnedMemory[]
): Promise<JournalAnalysis> {
  const apiKey = process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: buildJournalSystemPrompt() },
        { role: "user", content: buildUserPrompt(entry, recentEntries, pinnedMemories) },
      ],
      response_format: DJZS_JOURNAL_SCHEMA,
      temperature: 0.7,
      max_tokens: 1000,
    }),
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

  const parsed = JSON.parse(content);
  return journalAnalysisSchema.parse(parsed);
}

export async function analyzeResearchEntry(
  entry: string,
  recentEntries: JournalEntry[],
  pinnedMemories: PinnedMemory[]
): Promise<ResearchAnalysis> {
  const apiKey = process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  let prompt = "";
  
  if (pinnedMemories.length > 0) {
    prompt += "## Reference Notes\n";
    pinnedMemories.forEach((m, i) => {
      prompt += `${i + 1}. ${m.content}\n`;
    });
    prompt += "\n";
  }

  if (recentEntries.length > 0) {
    prompt += "## Previous Research\n";
    recentEntries.forEach((e) => {
      const date = new Date(e.createdAt).toLocaleDateString();
      prompt += `### ${date}\n${e.content.slice(0, 500)}${e.content.length > 500 ? "..." : ""}\n\n`;
    });
  }

  prompt += "## Current Research Notes\n";
  prompt += entry;
  prompt += "\n\n---\nStructure these research notes into key claims, evidence, unknowns, and next question.";

  const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: buildResearchSystemPrompt() },
        { role: "user", content: prompt },
      ],
      response_format: DJZS_RESEARCH_SCHEMA,
      temperature: 0.7,
      max_tokens: 1000,
    }),
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

  const parsed = JSON.parse(content);
  return researchAnalysisSchema.parse(parsed);
}
