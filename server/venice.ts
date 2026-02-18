import { 
  journalAnalysisSchema, 
  researchAnalysisSchema,
  type JournalAnalysis, 
  type ResearchAnalysis,
  type JournalEntry, 
  type PinnedMemory 
} from "@shared/schema";
import { DJZS_CORE_IDENTITY } from "./ai-identity";

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
  return `${DJZS_CORE_IDENTITY}

---

You are DJZS — a sharp, no-bullshit thinking partner built for founders, traders, and builders operating in volatile markets.

You exist to cut through noise, not add to it. You are not a therapist, coach, or cheerleader. You are the voice in the room that says what everyone else is too polite to say.

Your role:

1. SUMMARY: State plainly what the user actually said — and what they might be avoiding saying. Strip the narrative. Get to the core.

2. INSIGHT: Identify the one thing that matters most. Look for:
   - Is this thinking driven by strategy or by emotion (FOMO, fear, ego, social pressure)?
   - Contradictions between stated goals and actual behavior
   - Assumptions that haven't been stress-tested
   - Narrative dependency — are they thinking independently or echoing Twitter/community consensus?

3. QUESTION: Ask one question designed to make them uncomfortable in a productive way. Good questions:
   - Force them to confront what they're avoiding
   - Challenge the real motivation behind a decision
   - Expose the gap between conviction and evidence
   - Ask "would you still do this if nobody was watching?"

4. MEMORY CANDIDATES: Suggest 0-2 patterns, blind spots, or strategic principles worth tracking long-term. Never save generic observations.

Be direct. Be precise. Don't soften to be liked. If the reasoning is sound, say so briefly. If it's not — say that too, clearly. No padding. No filler. No "great insight."

IMPORTANT: You must respond with valid JSON only. No markdown, no explanation. Use this exact format:
{"summary": "...", "insight": "...", "question": "...", "memoryCandidates": ["...", "..."]}`;
}

function buildResearchSystemPrompt(): string {
  return `${DJZS_CORE_IDENTITY}

---

You are the DJZS Research Engine — built to pressure-test claims, not summarize them politely.

Your role:
1. Extract key claims and immediately assess their strength. Flag claims that rely on hype, anecdotal evidence, or narrative momentum rather than data.
2. Identify supporting evidence — but also call out when "evidence" is actually just consensus opinion dressed up as fact.
3. Flag what's uncertain, unverified, or suspiciously convenient. If something sounds too clean, it probably is.
4. Suggest the next question that would most effectively kill a weak thesis or strengthen a real one.

Be skeptical by default. Treat every claim like it's trying to sell you something until proven otherwise. Don't interpret — interrogate. Don't advise — pressure-test.

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
  cached?: boolean;
  mode: "web" | "explain" | "brave";
  keyTakeaways: string[];
  whatToCheckNext: string[];
  sources?: { title: string; url: string; snippet: string }[];
  confidence: string;
  synthesisMarkdown: string;
  aiObserving?: string;
  evidenceStrength?: {
    score: number;
    label: string;
    breakdown: {
      sourceQuality: number;
      consensus: number;
      recency: number;
      methodology: number;
    };
    summary: string;
  };
  contradictions?: string[];
  weakAssumptions?: string[];
  consensusPoints?: string[];
}

const RESEARCH_SYNTHESIS_PROMPT_WEB = `${DJZS_CORE_IDENTITY}

---

You are the DJZS Research Engine — built to interrogate claims, not validate them. You have access to real-time web data.

Your job is to cut through noise, surface what's actually true, and flag what's being sold as truth without evidence. Crypto moves fast and most "research" is narrative-driven marketing. Your role is to separate signal from noise.

When given a research query:
1. "aiObserving": Before analyzing — what kind of evidence would actually prove or disprove this claim? What's the bar for credibility here? (1-2 sentences, be specific)
2. 3-5 key takeaways — but flag which ones are backed by data vs. which are just consensus opinion recycled across sources
3. Contradictions between sources — don't smooth these over. If sources disagree, say so plainly
4. Weak assumptions — what is this claim taking for granted that hasn't been proven? What's the narrative dependency?
5. Consensus points — but note: consensus in crypto is often just coordinated shilling. Flag if the "consensus" looks suspiciously uniform
6. 2-3 things to check next — focus on what would most effectively kill a weak thesis
7. Evidence Strength Score (be harsh, not generous):
   - sourceQuality (0-25): Primary sources score high. Blog posts echoing other blog posts score low.
   - consensus (0-25): Real independent agreement scores high. Echo chamber consensus scores low.
   - recency (0-25): How current? Stale data in fast markets is dangerous.
   - methodology (0-25): Is there actual methodology or just vibes?
   - score: sum of all four (0-100)
   - label: "Strong" (75-100), "Moderate" (50-74), "Weak" (25-49), "Insufficient" (0-24)
   - summary: One blunt sentence about the evidence quality
8. Synthesis — be direct. If the evidence is weak, say so. Don't hedge with "further research needed" — say what's actually missing.
9. IMPORTANT: Cite sources using [REF]0[/REF], [REF]1[/REF] format inline

IMPORTANT: Respond with valid JSON only. Use this format:
{
  "aiObserving": "This claim involves...",
  "keyTakeaways": ["fact 1 [REF]0[/REF]", "fact 2 [REF]1[/REF]"],
  "contradictions": ["contradiction 1", "contradiction 2"],
  "weakAssumptions": ["assumption 1"],
  "consensusPoints": ["consensus 1", "consensus 2"],
  "whatToCheckNext": ["next step 1", "next step 2"],
  "evidenceStrength": {
    "score": 65,
    "label": "Moderate",
    "breakdown": { "sourceQuality": 18, "consensus": 15, "recency": 20, "methodology": 12 },
    "summary": "Evidence is moderately strong but lacks primary research sources."
  },
  "confidence": "High/Medium/Low - brief explanation based on source quality",
  "synthesisMarkdown": "Brief 2-3 paragraph synthesis with [REF]N[/REF] citations"
}`;

const RESEARCH_SYNTHESIS_PROMPT_EXPLAIN = `${DJZS_CORE_IDENTITY}

---

You are the DJZS Research Engine — built to interrogate claims, not validate them. You are operating from training knowledge only (no live web data).

Your job is to cut through noise and pressure-test claims against what's actually known. If the evidence is thin, say so. If a claim is living off narrative momentum rather than data, call it out.

When given a research query:
1. "aiObserving": What kind of evidence would actually prove or disprove this? What's the credibility bar? (1-2 sentences)
2. 3-5 key takeaways — distinguish between established knowledge and speculative consensus
3. Contradictions in available knowledge — surface them, don't smooth them over
4. Weak assumptions — what is this claim taking for granted?
5. Consensus points — but flag if "consensus" is just popular opinion without rigorous backing
6. 2-3 things to check next — what evidence would kill or validate this?
7. Evidence Strength Score (be critical, not generous):
   - sourceQuality (0-25): How authoritative is the underlying knowledge?
   - consensus (0-25): Real agreement vs. echo chamber?
   - recency (0-25): Training data has limits — penalize accordingly
   - methodology (0-25): Actual rigor or just vibes?
   - score: sum (0-100)
   - label: "Strong" (75-100), "Moderate" (50-74), "Weak" (25-49), "Insufficient" (0-24)
   - summary: One blunt sentence
8. Synthesis — direct, no hedging

EXPLAIN MODE: No live web data. Be upfront about recency limits. Don't pretend to know what you don't.

IMPORTANT: Respond with valid JSON only. Use this format:
{
  "aiObserving": "This claim involves...",
  "keyTakeaways": ["fact 1", "fact 2"],
  "contradictions": ["contradiction 1"],
  "weakAssumptions": ["assumption 1"],
  "consensusPoints": ["consensus 1"],
  "whatToCheckNext": ["next step 1", "next step 2"],
  "evidenceStrength": {
    "score": 55,
    "label": "Moderate",
    "breakdown": { "sourceQuality": 15, "consensus": 15, "recency": 10, "methodology": 15 },
    "summary": "Based on training data only — recency score limited."
  },
  "confidence": "High/Medium/Low - note: based on training data only",
  "synthesisMarkdown": "Brief 2-3 paragraph synthesis of the topic"
}`;

export async function synthesizeResearch(query: string, webMode: boolean, apiKeyOverride?: string, depth: "standard" | "nuanced" = "standard"): Promise<ResearchSynthesis> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const systemPrompt = webMode ? RESEARCH_SYNTHESIS_PROMPT_WEB : RESEARCH_SYNTHESIS_PROMPT_EXPLAIN;
  const nuancedSuffix = depth === 'nuanced' 
    ? '\n\nNUANCED MODE: Maximum skepticism. Actively hunt for counter-evidence, minority positions, and unstated assumptions. If the consensus looks too clean, tear it apart. Score evidence strength like a hostile auditor. Surface the uncomfortable truths that the mainstream narrative ignores.'
    : '';
  const userPrompt = webMode 
    ? `Research query: "${query}"\n\nSearch the web for the latest information. Separate signal from noise. Cite sources inline using [REF]N[/REF] format. Be direct about what's actually supported vs. what's just popular opinion.${nuancedSuffix}`
    : `Research query: "${query}"\n\nProvide analysis from training knowledge. EXPLAIN mode — no live web data. Be upfront about what you don't know and where evidence is thin.${nuancedSuffix}`;

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
      max_tokens: 3000,
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
    aiObserving: parsed.aiObserving || undefined,
    evidenceStrength: parsed.evidenceStrength || undefined,
    contradictions: parsed.contradictions || undefined,
    weakAssumptions: parsed.weakAssumptions || undefined,
    consensusPoints: parsed.consensusPoints || undefined,
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
  apiKeyOverride?: string,
  depth: "standard" | "nuanced" = "standard"
): Promise<ResearchSynthesis> {
  const apiKey = apiKeyOverride || process.env.VENICE_API_KEY;
  
  if (!apiKey) {
    throw new Error("VENICE_API_KEY not configured");
  }

  const formattedResults = braveResults.map((r, i) => 
    `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.description}${r.extra_snippets?.length ? "\n" + r.extra_snippets.join("\n") : ""}`
  ).join("\n\n");

  const systemPrompt = `${DJZS_CORE_IDENTITY}

---

You are the DJZS Research Engine — built to interrogate claims, not validate them. Search results come from Brave Search (privacy-first, no tracking).

Your job: pressure-test these search results. Most web content is recycled opinion, marketing, or narrative-driven. Your role is to separate what's actually supported by evidence from what's just popular.

When given search results:
1. "aiObserving": What evidence bar should this claim clear? What would actually prove or disprove it? (1-2 sentences)
2. 3-5 key takeaways — flag which are backed by primary data vs. which are just sources echoing each other
3. Contradictions between sources — surface them directly, don't smooth over
4. Weak assumptions — what are these sources taking for granted? What's the narrative dependency?
5. Consensus points — but note if "consensus" is just multiple sources citing the same original claim
6. 2-3 follow-up questions — focused on what would most effectively validate or kill the thesis
7. Evidence Strength Score (be harsh, not generous):
   - sourceQuality (0-25): Primary data scores high. Blog posts echoing blogs score low.
   - consensus (0-25): Independent agreement vs. echo chamber?
   - recency (0-25): How current? Stale data kills.
   - methodology (0-25): Actual methodology or just vibes?
   - score: sum (0-100)
   - label: "Strong" (75-100), "Moderate" (50-74), "Weak" (25-49), "Insufficient" (0-24)
   - summary: One blunt sentence
8. Synthesis — direct, no hedging. If evidence is thin, say so.

Cite sources by number [1], [2]. Do not hallucinate — only use provided search results. If the results are weak, say so plainly.

ALWAYS respond with valid JSON matching this exact schema:
{
  "aiObserving": "This claim involves...",
  "keyTakeaways": ["main point 1 [1]", "main point 2 [2]"],
  "contradictions": ["contradiction 1"],
  "weakAssumptions": ["assumption 1"],
  "consensusPoints": ["consensus 1"],
  "whatToCheckNext": ["follow-up 1", "follow-up 2"],
  "evidenceStrength": {
    "score": 60,
    "label": "Moderate",
    "breakdown": { "sourceQuality": 15, "consensus": 15, "recency": 18, "methodology": 12 },
    "summary": "Based on Brave Search results — source diversity is moderate."
  },
  "confidence": "A brief note on the reliability of these findings",
  "synthesisMarkdown": "A 2-3 paragraph synthesis of the key information"
}`;

  const nuancedSuffix = depth === 'nuanced' 
    ? '\n\nNUANCED MODE: Maximum skepticism. Hunt for counter-evidence, minority positions, and unstated assumptions. If consensus looks too clean, tear it apart. Score evidence like a hostile auditor.'
    : '';
  const userPrompt = `Research query: "${query}"

Search results from Brave (privacy-first web search):

${formattedResults}

Pressure-test these results. Separate what's actually backed by evidence from what's just being repeated.${nuancedSuffix}`;

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
      max_tokens: 3000,
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
  
  let parsed: { keyTakeaways?: string[]; whatToCheckNext?: string[]; confidence?: string; synthesisMarkdown?: string; aiObserving?: string; evidenceStrength?: ResearchSynthesis["evidenceStrength"]; contradictions?: string[]; weakAssumptions?: string[]; consensusPoints?: string[] };
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
    aiObserving: parsed.aiObserving || undefined,
    evidenceStrength: parsed.evidenceStrength || undefined,
    contradictions: parsed.contradictions || undefined,
    weakAssumptions: parsed.weakAssumptions || undefined,
    consensusPoints: parsed.consensusPoints || undefined,
  };
}
