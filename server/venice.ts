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

Be warm but not sycophantic. Be insightful but not preachy. Say less than you could. If you can't add value, return only a summary.

IMPORTANT: You must respond with valid JSON only. No markdown, no explanation. Use this exact format:
{"summary": "...", "insight": "...", "question": "...", "memoryCandidates": ["...", "..."]}`;
}

function buildResearchSystemPrompt(): string {
  return `You are a calm, precise Research Assistant for DJZS. Your role is to help users structure their thinking by:

1. Extracting key claims from their research notes
2. Identifying supporting evidence and data points
3. Flagging what remains uncertain or unverified
4. Suggesting the next question that would reduce uncertainty

Focus on clarity over completeness. Don't interpret - structure. Don't advise - clarify.

IMPORTANT: You must respond with valid JSON only. No markdown, no explanation. Use this exact format:
{"keyClaims": ["..."], "evidence": ["..."], "unknowns": ["..."], "nextQuestion": "..."}`;
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

// Research synthesis for Research Zone search
export interface ResearchSynthesis {
  query: string;
  mode: "web" | "explain";
  keyTakeaways: string[];
  whatToCheckNext: string[];
  sources?: { title: string; url: string; snippet: string }[];
  confidence: string;
  synthesisMarkdown: string;
}

const RESEARCH_SYNTHESIS_PROMPT = `You are a research synthesizer for DJZS. Your role is to provide clear, accurate information on any topic.

When given a research query:
1. Provide 3-5 key takeaways (bullet points of the most important facts)
2. Suggest 2-3 things to check or explore next
3. Rate your confidence and explain any limitations
4. Write a brief synthesis paragraph

Be factual, concise, and honest about what you don't know. If the topic requires current data you don't have, say so explicitly.

IMPORTANT: Respond with valid JSON only. Use this format:
{
  "keyTakeaways": ["fact 1", "fact 2", ...],
  "whatToCheckNext": ["next step 1", "next step 2", ...],
  "confidence": "High/Medium/Low - brief explanation of limitations",
  "synthesisMarkdown": "Brief 2-3 paragraph synthesis of the topic"
}`;

export async function synthesizeResearch(query: string, webMode: boolean): Promise<ResearchSynthesis> {
  const apiKey = process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const userPrompt = webMode 
    ? `Research query: "${query}"\n\nProvide comprehensive information on this topic. Note: You're operating in Explain mode (no live web search). Be clear about any information that may be outdated or require verification.`
    : `Research query: "${query}"\n\nProvide information based on your training knowledge. Clearly label this as "Explain mode" - no live web data is available.`;

  const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: RESEARCH_SYNTHESIS_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
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

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    query,
    mode: webMode ? "web" : "explain",
    keyTakeaways: parsed.keyTakeaways || [],
    whatToCheckNext: parsed.whatToCheckNext || [],
    sources: [], // No web sources in explain mode
    confidence: parsed.confidence || "Medium - based on training data only",
    synthesisMarkdown: parsed.synthesisMarkdown || "",
  };
}
