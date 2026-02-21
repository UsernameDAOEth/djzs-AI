import { useState, useEffect, useCallback } from "react";
import { vault, type DecisionLog, type DecisionStakes, type DecisionStatus, type DecisionOutcome, saveDecisionLog, updateDecisionLog, getAllDecisionLogs, deleteDecisionLog } from "@/lib/vault";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pen, BarChart3, Clock, Loader2, ChevronDown, ChevronRight, Trash2, Plus, X, AlertCircle, CheckCircle, Brain } from "lucide-react";

type TabId = "compose" | "review" | "history";

const TABS: { id: TabId; label: string; icon: typeof Pen }[] = [
  { id: "compose", label: "Compose", icon: Pen },
  { id: "review", label: "AI Review", icon: Brain },
  { id: "history", label: "History", icon: Clock },
];

const INPUT_CLS =
  "w-full px-3 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-amber-500/50 transition-colors";

function ToggleGroup({
  options,
  value,
  onChange,
  testIdPrefix,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          data-testid={`${testIdPrefix}-${opt.toLowerCase()}`}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === opt
              ? "bg-[rgba(255,184,77,0.1)] text-amber-400 border border-[rgba(255,184,77,0.3)]"
              : "bg-muted text-muted-foreground border border-border hover:text-foreground hover:border-border"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground mb-1.5">{children}</label>;
}

const STAKES_COLORS: Record<DecisionStakes, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_COLORS: Record<DecisionStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  reviewed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  decided: "bg-green-500/20 text-green-400 border-green-500/30",
  revisited: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const OUTCOME_COLORS: Record<DecisionOutcome, string> = {
  pending: "bg-muted text-muted-foreground",
  positive: "bg-green-500/20 text-green-400",
  negative: "bg-red-500/20 text-red-400",
  mixed: "bg-yellow-500/20 text-yellow-400",
  too_early: "bg-blue-500/20 text-blue-400",
};

const formatDate = (d: Date) => {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export function DecisionLogZone() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("compose");

  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [options, setOptions] = useState<string[]>([""]);
  const [reasoning, setReasoning] = useState("");
  const [stakes, setStakes] = useState<DecisionStakes>("medium");

  const [savedDecisionId, setSavedDecisionId] = useState<number | null>(null);
  const [savedDecision, setSavedDecision] = useState<DecisionLog | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ said: string; matters: string; nextMove: string; question: string } | null>(null);

  const [historyLogs, setHistoryLogs] = useState<DecisionLog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    getAllDecisionLogs().then(setHistoryLogs).catch(() => {});
  }, [refreshKey]);

  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (idx: number) => setOptions((prev) => prev.filter((_, i) => i !== idx));
  const updateOption = (idx: number, val: string) =>
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Enter a decision title.", variant: "destructive" });
      return;
    }
    try {
      const filteredOptions = options.filter((o) => o.trim());
      const id = await saveDecisionLog({
        title: title.trim(),
        context: context.trim(),
        optionsConsidered: filteredOptions,
        reasoning: reasoning.trim(),
        stakes,
        status: "draft",
      });
      setSavedDecisionId(id);
      setSavedDecision({
        id,
        title: title.trim(),
        context: context.trim(),
        optionsConsidered: filteredOptions,
        reasoning: reasoning.trim(),
        stakes,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      setRefreshKey((k) => k + 1);
      toast({ title: "Decision saved", description: "Your decision has been logged." });
      setActiveTab("review");
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message || "Could not save decision.", variant: "destructive" });
    }
  };

  const handleAiReview = async () => {
    if (!savedDecision) return;
    setAiLoading(true);
    try {
      const entryText = `DECISION REVIEW REQUEST:\n\nTitle: ${savedDecision.title}\nStakes: ${savedDecision.stakes.toUpperCase()}\n\nContext:\n${savedDecision.context}\n\nOptions Considered:\n${savedDecision.optionsConsidered.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\nReasoning:\n${savedDecision.reasoning}\n\nPlease analyze this decision. Identify blind spots, counter-arguments, missing considerations, and whether this reasoning is sound.`;

      const res = await apiRequest("POST", "/api/agent/analyze", {
        mode: "journal",
        intent: "clarity",
        entry: entryText,
        pinnedMemory: [],
        priorEntries: [],
      });
      const data = await res.json();
      setAiResponse({
        said: data.said || "",
        matters: data.matters || "",
        nextMove: data.nextMove || "",
        question: data.question || "",
      });
    } catch (err: any) {
      toast({ title: "AI review failed", description: err.message || "Could not get AI analysis.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveAiReview = async () => {
    if (!savedDecisionId || !aiResponse) return;
    try {
      const reviewText = `Analysis: ${aiResponse.said}\n\nWhy it matters: ${aiResponse.matters}\n\nSuggested next move: ${aiResponse.nextMove}\n\nReflective question: ${aiResponse.question}`;
      await updateDecisionLog(savedDecisionId, {
        aiReview: reviewText,
        status: "reviewed",
      });
      setRefreshKey((k) => k + 1);
      toast({ title: "AI review saved", description: "Review attached to your decision." });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message || "Could not save review.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (logId: number, newStatus: DecisionStatus) => {
    try {
      await updateDecisionLog(logId, { status: newStatus });
      setRefreshKey((k) => k + 1);
      toast({ title: "Status updated", description: `Decision marked as ${newStatus}.` });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const handleOutcomeChange = async (logId: number, outcome: DecisionOutcome) => {
    try {
      await updateDecisionLog(logId, { outcome });
      setRefreshKey((k) => k + 1);
    } catch {}
  };

  const handleDelete = async (logId: number) => {
    try {
      await deleteDecisionLog(logId);
      setDeleteConfirmId(null);
      setRefreshKey((k) => k + 1);
      toast({ title: "Decision deleted" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="decision-log-zone">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={18} className="text-amber-400" />
        <h2 className="text-sm font-semibold text-foreground">Decision Log</h2>
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 bg-muted rounded-lg border border-border overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[rgba(255,184,77,0.1)] text-amber-400 border border-[rgba(255,184,77,0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === "compose" && (
        <div className="space-y-4" data-testid="compose-tab">
          <div className="p-4 rounded-lg bg-muted border border-border space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Pen size={16} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Log a Decision</h3>
            </div>

            <div>
              <SectionLabel>Title</SectionLabel>
              <input
                data-testid="input-decision-title"
                className={INPUT_CLS}
                placeholder="e.g., Pivot to B2B, Hire CTO, Raise Series A"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <SectionLabel>Context</SectionLabel>
              <textarea
                data-testid="input-decision-context"
                className={`${INPUT_CLS} min-h-[80px] resize-y`}
                placeholder="What's happening that requires this decision?"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <SectionLabel>Options Considered</SectionLabel>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      data-testid={`input-option-${idx}`}
                      className={`${INPUT_CLS} flex-1`}
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                    />
                    {options.length > 1 && (
                      <button
                        data-testid={`button-remove-option-${idx}`}
                        onClick={() => removeOption(idx)}
                        className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  data-testid="button-add-option"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Plus size={12} />
                  Add option
                </button>
              </div>
            </div>

            <div>
              <SectionLabel>Reasoning</SectionLabel>
              <textarea
                data-testid="input-decision-reasoning"
                className={`${INPUT_CLS} min-h-[80px] resize-y`}
                placeholder="Why are you leaning this direction?"
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <SectionLabel>Stakes</SectionLabel>
              <ToggleGroup
                options={["low", "medium", "high", "critical"]}
                value={stakes}
                onChange={(v) => setStakes(v as DecisionStakes)}
                testIdPrefix="toggle-stakes"
              />
            </div>

            <button
              data-testid="button-save-decision"
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Decision
            </button>
          </div>
        </div>
      )}

      {activeTab === "review" && (
        <div className="space-y-4" data-testid="review-tab">
          {!savedDecision ? (
            <div className="p-6 rounded-lg bg-muted border border-border text-center">
              <AlertCircle size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Compose and save a decision first before requesting AI review.</p>
              <button
                data-testid="button-go-compose"
                onClick={() => setActiveTab("compose")}
                className="mt-3 px-4 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
              >
                Go to Compose
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted border border-border space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-foreground">AI Review: {savedDecision.title}</h3>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Decision Summary</p>
                <p className="text-sm text-muted-foreground">{savedDecision.context || "No context provided."}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={`text-[10px] rounded-md ${STAKES_COLORS[savedDecision.stakes]}`}>
                    {savedDecision.stakes}
                  </Badge>
                </div>
              </div>

              {!aiResponse && !aiLoading && (
                <button
                  data-testid="button-ai-review"
                  onClick={handleAiReview}
                  className="w-full py-2.5 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Brain size={14} />
                  Review with AI
                </button>
              )}

              {aiLoading && (
                <div className="flex items-center justify-center gap-2 py-8 text-amber-400">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm">Analyzing your decision...</span>
                </div>
              )}

              {aiResponse && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <BarChart3 size={12} className="text-amber-400" />
                      <p className="text-xs font-medium text-amber-400">Analysis</p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResponse.said}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertCircle size={12} className="text-yellow-400" />
                      <p className="text-xs font-medium text-yellow-400">Why It Matters</p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResponse.matters}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CheckCircle size={12} className="text-green-400" />
                      <p className="text-xs font-medium text-green-400">Suggested Next Move</p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiResponse.nextMove}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Brain size={12} className="text-purple-400" />
                      <p className="text-xs font-medium text-purple-400">Reflective Question</p>
                    </div>
                    <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">{aiResponse.question}</p>
                  </div>

                  <button
                    data-testid="button-save-ai-review"
                    onClick={handleSaveAiReview}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} />
                    Save AI Review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3" data-testid="history-tab">
          {historyLogs.length === 0 ? (
            <div className="p-6 rounded-lg bg-muted border border-border text-center">
              <Clock size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No decisions logged yet.</p>
            </div>
          ) : (
            historyLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div
                  key={log.id}
                  data-testid={`card-decision-${log.id}`}
                  className="p-4 rounded-lg bg-muted border border-border hover:border-border transition-all"
                >
                  <div
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => setExpandedLogId(isExpanded ? null : (log.id ?? null))}
                    data-testid={`button-expand-${log.id}`}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">{log.title}</span>
                        <Badge className={`text-[10px] rounded-md ${STAKES_COLORS[log.stakes]}`}>
                          {log.stakes}
                        </Badge>
                        <Badge className={`text-[10px] rounded-md ${STATUS_COLORS[log.status]}`}>
                          {log.status}
                        </Badge>
                        {log.outcome && (
                          <Badge className={`text-[10px] rounded-md ${OUTCOME_COLORS[log.outcome]}`}>
                            {log.outcome.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(log.createdAt)}</p>
                      {!isExpanded && log.context && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.context}</p>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pl-6 space-y-3">
                      {log.context && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Context</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.context}</p>
                        </div>
                      )}

                      {log.optionsConsidered && log.optionsConsidered.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Options Considered</p>
                          <ul className="space-y-1">
                            {log.optionsConsidered.map((opt, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                                <span className="text-amber-400 text-xs mt-0.5">{i + 1}.</span>
                                {opt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {log.reasoning && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Reasoning</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.reasoning}</p>
                        </div>
                      )}

                      {log.aiReview && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Brain size={12} className="text-amber-400" />
                            <p className="text-xs font-medium text-amber-400">AI Review</p>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.aiReview}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 flex-wrap">
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Status</label>
                          <select
                            data-testid={`select-status-${log.id}`}
                            value={log.status}
                            onChange={(e) => log.id !== undefined && handleStatusChange(log.id, e.target.value as DecisionStatus)}
                            className="bg-muted border border-border rounded-md text-xs text-foreground px-2 py-1 outline-none"
                          >
                            <option value="draft">Draft</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="decided">Decided</option>
                            <option value="revisited">Revisited</option>
                          </select>
                        </div>

                        {(log.status === "decided" || log.status === "revisited") && (
                          <div>
                            <label className="text-[10px] text-muted-foreground block mb-0.5">Outcome</label>
                            <select
                              data-testid={`select-outcome-${log.id}`}
                              value={log.outcome || "pending"}
                              onChange={(e) => log.id !== undefined && handleOutcomeChange(log.id, e.target.value as DecisionOutcome)}
                              className="bg-muted border border-border rounded-md text-xs text-foreground px-2 py-1 outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="positive">Positive</option>
                              <option value="negative">Negative</option>
                              <option value="mixed">Mixed</option>
                              <option value="too_early">Too Early</option>
                            </select>
                          </div>
                        )}

                        <div className="ml-auto">
                          {deleteConfirmId === log.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-red-400">Delete?</span>
                              <button
                                data-testid={`button-confirm-delete-${log.id}`}
                                onClick={() => log.id !== undefined && handleDelete(log.id)}
                                className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                              >
                                Yes
                              </button>
                              <button
                                data-testid={`button-cancel-delete-${log.id}`}
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border hover:text-foreground"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              data-testid={`button-delete-${log.id}`}
                              onClick={() => setDeleteConfirmId(log.id ?? null)}
                              className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
