const BRAVE_API_BASE = "https://api.search.brave.com/res/v1";

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  extra_snippets?: string[];
}

export interface BraveWebSearchResponse {
  query: {
    original: string;
    more_results_available: boolean;
  };
  web?: {
    results: BraveSearchResult[];
  };
}

export async function searchBrave(
  query: string,
  options?: {
    count?: number;
    freshness?: "pd" | "pw" | "pm" | "py";
    extra_snippets?: boolean;
  }
): Promise<BraveSearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY;
  
  if (!apiKey) {
    throw new Error("BRAVE_API_KEY not configured");
  }
  
  const params = new URLSearchParams({
    q: query,
    count: String(options?.count ?? 10),
  });
  
  if (options?.freshness) {
    params.set("freshness", options.freshness);
  }
  
  if (options?.extra_snippets) {
    params.set("extra_snippets", "true");
  }

  const response = await fetch(`${BRAVE_API_BASE}/web/search?${params}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brave Search API error:", response.status, errorText);
    throw new Error(`Brave Search API error: ${response.status}`);
  }

  const data: BraveWebSearchResponse = await response.json();
  return data.web?.results ?? [];
}
