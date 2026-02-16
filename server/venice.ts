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
        summary: { type: "string", minLength: 10, maxLength: 600 },
        insight: { type: "string", minLength: 10, maxLength: 500 },
        question: { type: "string", minLength: 10, maxLength: 500 },
        memoryCandidates: {
          type: "array",
          maxItems: 2,
          items: { type: "string", minLength: 6, maxLength: 300 }
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
          items: { type: "string", minLength: 10, maxLength: 400 }
        },
        evidence: {
          type: "array",
          maxItems: 4,
          items: { type: "string", minLength: 10, maxLength: 400 }
        },
        unknowns: {
          type: "array",
          maxItems: 3,
          items: { type: "string", minLength: 10, maxLength: 400 }
        },
        nextQuestion: { type: "string", minLength: 10, maxLength: 500 }
      }
    }
  }
};

function buildJournalSystemPrompt(): string {
  return `You are a calm, wise Thinking Partner for DJZS - an AI companion that helps people achieve clarity in their thinking.

Your role is to act as an "intelligence companion" that:

1. SUMMARY: Reflect back what the user expressed, capturing the emotional undertone and core message (what they said and felt)

2. INSIGHT: Identify one meaningful pattern, connection, or reframe that the user might not have considered. Look for:
   - Connections between this entry and their previous thoughts
   - Underlying values or beliefs driving their thinking
   - Tensions or contradictions worth examining
   - Shifts in perspective from their recent entries

3. QUESTION: Ask one powerful question designed to deepen their reflection. Good questions:
   - Open up new angles rather than seeking specific answers
   - Connect to their stated values and goals
   - Are worth sitting with for a while
   - Help them see blind spots or assumptions

4. MEMORY CANDIDATES: Suggest 0-2 facts, decisions, or realizations worth remembering long-term

Be warm but not sycophantic. Be insightful but not preachy. Say less than you could. If you can't add value, return only a summary. Honor their voice - you're a thinking partner, not a therapist.

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
  pinnedMemories: PinnedMemory[],
  apiKeyOverride?: string
): Promise<JournalAnalysis> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;
  
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

  const sanitizedContent = content.replace(/[\x00-\x1F\x7F]/g, (ch: string) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : ' ');
  const parsed = JSON.parse(sanitizedContent);
  return journalAnalysisSchema.parse(parsed);
}

export async function analyzeResearchEntry(
  entry: string,
  recentEntries: JournalEntry[],
  pinnedMemories: PinnedMemory[],
  apiKeyOverride?: string
): Promise<ResearchAnalysis> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;
  
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

  const sanitizedContent = content.replace(/[\x00-\x1F\x7F]/g, (ch: string) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : ' ');
  const parsed = JSON.parse(sanitizedContent);
  return researchAnalysisSchema.parse(parsed);
}

// Research synthesis for Research Zone search
export interface ResearchSynthesis {
  query: string;
  mode: "web" | "explain" | "brave";
  keyTakeaways: string[];
  whatToCheckNext: string[];
  sources?: { title: string; url: string; snippet: string }[];
  confidence: string;
  synthesisMarkdown: string;
}

const RESEARCH_SYNTHESIS_PROMPT_WEB = `You are a research synthesizer for DJZS with access to real-time web data. Your role is to provide current, accurate information on any topic.

When given a research query:
1. Provide 3-5 key takeaways based on the latest web data
2. Suggest 2-3 things to check or explore next
3. Rate your confidence based on source quality
4. Write a brief synthesis paragraph with current information
5. IMPORTANT: Cite your sources using [REF]0[/REF], [REF]1[/REF] format inline

Be factual, concise, and cite sources for claims. Include the date or recency of information when relevant.

IMPORTANT: Respond with valid JSON only. Use this format:
{
  "keyTakeaways": ["fact 1 [REF]0[/REF]", "fact 2 [REF]1[/REF]", ...],
  "whatToCheckNext": ["next step 1", "next step 2", ...],
  "confidence": "High/Medium/Low - brief explanation based on source quality",
  "synthesisMarkdown": "Brief 2-3 paragraph synthesis with [REF]N[/REF] citations"
}`;

const RESEARCH_SYNTHESIS_PROMPT_EXPLAIN = `You are a research synthesizer for DJZS. Your role is to provide clear, accurate information from your training knowledge.

When given a research query:
1. Provide 3-5 key takeaways (bullet points of the most important facts)
2. Suggest 2-3 things to check or explore next
3. Rate your confidence and explain any limitations
4. Write a brief synthesis paragraph

Be factual, concise, and honest about what you don't know. Note that this is EXPLAIN MODE - you do not have access to live web data, so be clear about any information that may be outdated.

IMPORTANT: Respond with valid JSON only. Use this format:
{
  "keyTakeaways": ["fact 1", "fact 2", ...],
  "whatToCheckNext": ["next step 1", "next step 2", ...],
  "confidence": "High/Medium/Low - note: based on training data only",
  "synthesisMarkdown": "Brief 2-3 paragraph synthesis of the topic"
}`;

export async function synthesizeResearch(query: string, webMode: boolean, apiKeyOverride?: string): Promise<ResearchSynthesis> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const systemPrompt = webMode ? RESEARCH_SYNTHESIS_PROMPT_WEB : RESEARCH_SYNTHESIS_PROMPT_EXPLAIN;
  const userPrompt = webMode 
    ? `Research query: "${query}"\n\nSearch the web for the latest information and provide a comprehensive synthesis. Cite your sources inline using [REF]N[/REF] format.`
    : `Research query: "${query}"\n\nProvide information based on your training knowledge. This is EXPLAIN mode - no live web data is available.`;

  // Build Venice-specific parameters for web search
  const veniceParameters = webMode ? {
    enable_web_search: "on",
    enable_web_citations: true,
    include_venice_system_prompt: false,
  } : {
    include_venice_system_prompt: false,
  };

  const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      venice_parameters: veniceParameters,
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
  
  const sanitizedMatch = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, (ch: string) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : ' ');
  const parsed = JSON.parse(sanitizedMatch);
  
  // Parse web search citations from Venice response if available
  let sources: { title: string; url: string; snippet: string }[] = [];
  if (webMode && data.citations) {
    sources = data.citations.map((c: { title?: string; url?: string; snippet?: string }) => ({
      title: c.title || "Source",
      url: c.url || "",
      snippet: c.snippet || "",
    }));
  }
  
  return {
    query,
    mode: webMode ? "web" : "explain",
    keyTakeaways: parsed.keyTakeaways || [],
    whatToCheckNext: parsed.whatToCheckNext || [],
    sources,
    confidence: parsed.confidence || (webMode ? "Based on web search results" : "Based on training data only"),
    synthesisMarkdown: parsed.synthesisMarkdown || "",
  };
}

export interface BraveResult {
  title: string;
  url: string;
  description: string;
  extra_snippets?: string[];
}

export async function synthesizeWithBraveResults(
  query: string,
  braveResults: BraveResult[],
  apiKeyOverride?: string
): Promise<ResearchSynthesis> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const formattedResults = braveResults.map((r, i) => 
    `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.description}${r.extra_snippets?.length ? "\n" + r.extra_snippets.join("\n") : ""}`
  ).join("\n\n");

  const systemPrompt = `You are a privacy-focused research synthesis assistant for DJZS.

Your role is to synthesize web search results into clear, actionable knowledge. The user's search was performed via Brave Search (privacy-first, no tracking).

ALWAYS respond with valid JSON matching this exact schema:
{
  "keyTakeaways": ["3-5 main points from the search results"],
  "whatToCheckNext": ["2-3 follow-up questions worth exploring"],
  "confidence": "A brief note on the reliability of these findings",
  "synthesisMarkdown": "A 2-3 paragraph synthesis of the key information"
}

Be precise. Cite sources by number [1], [2], etc. Flag conflicting information. Do not hallucinate - only use information from the provided search results.`;

  const userPrompt = `Research query: "${query}"

Search results from Brave (privacy-first web search):

${formattedResults}

Synthesize these results into actionable knowledge.`;

  const response = await fetch(`${VENICE_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
      venice_parameters: {
        include_venice_system_prompt: false,
      },
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

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("No JSON found in Brave synthesis response, using fallback");
    return {
      query,
      mode: "brave" as const,
      keyTakeaways: braveResults.slice(0, 5).map(r => r.description.slice(0, 200)),
      whatToCheckNext: [],
      sources: braveResults.map(r => ({ title: r.title, url: r.url, snippet: r.description })),
      confidence: "Raw search results (AI synthesis failed)",
      synthesisMarkdown: "",
    };
  }
  
  let parsed: { keyTakeaways?: string[]; whatToCheckNext?: string[]; confidence?: string; synthesisMarkdown?: string };
  try {
    const sanitized = jsonMatch[0].replace(/[\x00-\x1F\x7F]/g, (ch: string) => ch === '\n' || ch === '\r' || ch === '\t' ? ch : ' ');
    parsed = JSON.parse(sanitized);
  } catch (parseError) {
    console.error("JSON parse error in Brave synthesis:", parseError);
    return {
      query,
      mode: "brave" as const,
      keyTakeaways: braveResults.slice(0, 5).map(r => r.description.slice(0, 200)),
      whatToCheckNext: [],
      sources: braveResults.map(r => ({ title: r.title, url: r.url, snippet: r.description })),
      confidence: "Raw search results (AI synthesis failed)",
      synthesisMarkdown: "",
    };
  }
  
  const sources = braveResults.map(r => ({
    title: r.title,
    url: r.url,
    snippet: r.description,
  }));
  
  return {
    query,
    mode: "brave" as const,
    keyTakeaways: parsed.keyTakeaways || [],
    whatToCheckNext: parsed.whatToCheckNext || [],
    sources,
    confidence: parsed.confidence || "Based on Brave Search results (privacy-first)",
    synthesisMarkdown: parsed.synthesisMarkdown || "",
  };
}
