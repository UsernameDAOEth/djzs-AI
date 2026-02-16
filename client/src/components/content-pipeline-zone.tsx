import { useState, useEffect, useCallback } from "react";
import { vault, type ContentPipelineItem, type ContentFormat, type ContentStatus, saveContentItem, updateContentItem, getAllContentItems, deleteContentItem } from "@/lib/vault";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pen, Sparkles, Clock, Loader2, ChevronDown, ChevronRight, Trash2, Plus, X, FileText, ExternalLink } from "lucide-react";

type TabId = "compose" | "refine" | "pipeline";

const TABS: { id: TabId; label: string; icon: typeof Pen }[] = [
  { id: "compose", label: "Compose", icon: Pen },
  { id: "refine", label: "AI Refine", icon: Sparkles },
  { id: "pipeline", label: "Pipeline", icon: Clock },
];

const INPUT_CLS =
  "w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-teal-500/50 transition-colors";

const FORMAT_OPTIONS: ContentFormat[] = ["article", "thread", "video", "newsletter", "podcast", "post"];
const STATUS_OPTIONS: ContentStatus[] = ["idea", "drafting", "refining", "ready", "published"];

const FORMAT_COLORS: Record<ContentFormat, string> = {
  article: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  thread: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  video: "bg-red-500/20 text-red-400 border-red-500/30",
  newsletter: "bg-green-500/20 text-green-400 border-green-500/30",
  podcast: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  post: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  drafting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  refining: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ready: "bg-green-500/20 text-green-400 border-green-500/30",
  published: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

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
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          data-testid={`${testIdPrefix}-${opt.toLowerCase()}`}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            value === opt
              ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
              : "bg-white/[0.03] text-gray-500 border border-white/[0.05] hover:text-gray-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-400 mb-1.5">{children}</label>;
}

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

export function ContentPipelineZone() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("compose");

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [format, setFormat] = useState<ContentFormat>("article");
  const [audience, setAudience] = useState("");
  const [hook, setHook] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([""]);

  const [savedItemId, setSavedItemId] = useState<number | null>(null);

  const [refineLoading, setRefineLoading] = useState(false);
  const [refineResult, setRefineResult] = useState<{
    said: string;
    matters: string;
    nextMove: string;
    question: string;
  } | null>(null);

  const [pipelineItems, setPipelineItems] = useState<ContentPipelineItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [publishedUrlInputs, setPublishedUrlInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    getAllContentItems().then(setPipelineItems).catch(() => {});
  }, [refreshKey]);

  const addKeyPoint = () => setKeyPoints((prev) => [...prev, ""]);
  const removeKeyPoint = (idx: number) => setKeyPoints((prev) => prev.filter((_, i) => i !== idx));
  const updateKeyPoint = (idx: number, val: string) =>
    setKeyPoints((prev) => prev.map((p, i) => (i === idx ? val : p)));

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Enter a title for your content idea.", variant: "destructive" });
      return;
    }
    try {
      const filteredPoints = keyPoints.filter((p) => p.trim());
      const id = await saveContentItem({
        title: title.trim(),
        topic: topic.trim(),
        angle: angle.trim(),
        format,
        audience: audience.trim(),
        hook: hook.trim(),
        keyPoints: filteredPoints,
        status: "idea",
      });
      setSavedItemId(id);
      setRefreshKey((k) => k + 1);
      toast({ title: "Saved to pipeline", description: `"${title.trim()}" added as an idea.` });
      setActiveTab("refine");
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message || "Could not save content item.", variant: "destructive" });
    }
  };

  const handleRefine = async () => {
    if (!savedItemId) return;
    setRefineLoading(true);
    setRefineResult(null);
    try {
      const filteredPoints = keyPoints.filter((p) => p.trim());
      const entryText = `CONTENT IDEA REFINEMENT REQUEST:\n\nTitle: ${title}\nTopic: ${topic}\nAngle: ${angle}\nFormat: ${format}\nAudience: ${audience}\nHook: ${hook}\nKey Points:\n${filteredPoints.map((p, i) => `  ${i + 1}. ${p}`).join("\n")}\n\nPlease refine this content idea. Analyze the hook strength, suggest improvements to the angle, identify gaps in the key points, and provide actionable next steps to make this content stand out.`;

      const res = await apiRequest("POST", "/api/agent/analyze", {
        mode: "journal",
        intent: "clarity",
        entry: entryText,
        pinnedMemory: [],
        priorEntries: [],
      });
      const data = await res.json();
      setRefineResult({
        said: data.said || "",
        matters: data.matters || "",
        nextMove: data.nextMove || "",
        question: data.question || "",
      });
    } catch (err: any) {
      toast({ title: "Refinement failed", description: err.message || "Could not refine content.", variant: "destructive" });
    } finally {
      setRefineLoading(false);
    }
  };

  const handleSaveRefinement = async () => {
    if (!savedItemId || !refineResult) return;
    try {
      const refinementText = `Analysis: ${refineResult.said}\n\nWhy it matters: ${refineResult.matters}\n\nNext move: ${refineResult.nextMove}\n\nQuestion: ${refineResult.question}`;
      await updateContentItem(savedItemId, { aiRefinement: refinementText });
      setRefreshKey((k) => k + 1);
      toast({ title: "Refinement saved", description: "AI refinement attached to your content idea." });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message || "Could not save refinement.", variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: number, newStatus: ContentStatus) => {
    try {
      await updateContentItem(id, { status: newStatus });
      setRefreshKey((k) => k + 1);
      toast({ title: "Status updated", description: `Changed to "${newStatus}".` });
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message || "Could not update status.", variant: "destructive" });
    }
  };

  const handleSavePublishedUrl = async (id: number) => {
    const url = publishedUrlInputs[id];
    if (!url?.trim()) return;
    try {
      await updateContentItem(id, { publishedUrl: url.trim() });
      setRefreshKey((k) => k + 1);
      toast({ title: "URL saved", description: "Published URL attached." });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message || "Could not save URL.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContentItem(id);
      setDeleteConfirmId(null);
      setRefreshKey((k) => k + 1);
      toast({ title: "Deleted", description: "Content item removed from pipeline." });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message || "Could not delete item.", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="content-pipeline-zone">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={18} className="text-teal-400" />
        <h2 className="text-sm font-semibold text-white">Content Pipeline</h2>
      </div>

      <div className="flex items-center gap-1 mb-4 p-1 bg-white/[0.02] rounded-2xl border border-white/[0.05] overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                  : "text-gray-500 hover:text-gray-300"
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
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Pen size={16} className="text-teal-400" />
              <h3 className="text-sm font-semibold text-white">Compose Content Idea</h3>
            </div>

            <div>
              <SectionLabel>Title</SectionLabel>
              <input
                data-testid="input-content-title"
                className={INPUT_CLS}
                placeholder="e.g., Why DAOs Need Better Tooling"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <SectionLabel>Topic</SectionLabel>
              <input
                data-testid="input-content-topic"
                className={INPUT_CLS}
                placeholder="What's the core topic?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <SectionLabel>Angle</SectionLabel>
              <textarea
                data-testid="input-content-angle"
                className={`${INPUT_CLS} resize-none`}
                rows={2}
                placeholder="What's your unique take or perspective?"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
              />
            </div>

            <div>
              <SectionLabel>Format</SectionLabel>
              <ToggleGroup
                options={FORMAT_OPTIONS}
                value={format}
                onChange={(v) => setFormat(v as ContentFormat)}
                testIdPrefix="toggle-format"
              />
            </div>

            <div>
              <SectionLabel>Audience</SectionLabel>
              <input
                data-testid="input-content-audience"
                className={INPUT_CLS}
                placeholder="Who is this for? e.g., Crypto founders, DeFi users"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            <div>
              <SectionLabel>Hook</SectionLabel>
              <textarea
                data-testid="input-content-hook"
                className={`${INPUT_CLS} resize-none`}
                rows={3}
                placeholder="Opening line or hook that grabs attention"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
              />
            </div>

            <div>
              <SectionLabel>Key Points</SectionLabel>
              <div className="space-y-2">
                {keyPoints.map((point, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      data-testid={`input-key-point-${idx}`}
                      className={`${INPUT_CLS} flex-1`}
                      placeholder={`Point ${idx + 1}`}
                      value={point}
                      onChange={(e) => updateKeyPoint(idx, e.target.value)}
                    />
                    {keyPoints.length > 1 && (
                      <button
                        data-testid={`button-remove-point-${idx}`}
                        onClick={() => removeKeyPoint(idx)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  data-testid="button-add-point"
                  onClick={addKeyPoint}
                  className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                >
                  <Plus size={12} />
                  Add point
                </button>
              </div>
            </div>

            <button
              data-testid="button-save-content"
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 text-sm font-medium hover:bg-teal-500/30 transition-all"
            >
              Save to Pipeline
            </button>
          </div>
        </div>
      )}

      {activeTab === "refine" && (
        <div className="space-y-4" data-testid="refine-tab">
          {!savedItemId ? (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
              <Sparkles size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500" data-testid="text-compose-first">
                Compose and save a content idea first to refine it with AI.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-teal-400" />
                <h3 className="text-sm font-semibold text-white">AI Refinement</h3>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xs text-gray-400 mb-1">Content idea:</p>
                <p className="text-sm text-white font-medium" data-testid="text-refine-title">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{format} · {audience || "General audience"}</p>
              </div>

              {!refineResult && !refineLoading && (
                <button
                  data-testid="button-refine-ai"
                  onClick={handleRefine}
                  className="w-full py-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 text-sm font-medium hover:bg-teal-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Refine with AI
                </button>
              )}

              {refineLoading && (
                <div className="flex items-center justify-center gap-2 py-6" data-testid="refine-loading">
                  <Loader2 size={16} className="animate-spin text-teal-400" />
                  <span className="text-sm text-gray-400">Refining your content idea...</span>
                </div>
              )}

              {refineResult && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-xs font-medium text-teal-400 mb-1">Analysis</p>
                    <p className="text-sm text-gray-300" data-testid="text-refine-said">{refineResult.said}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-xs font-medium text-teal-400 mb-1">Why It Matters</p>
                    <p className="text-sm text-gray-300" data-testid="text-refine-matters">{refineResult.matters}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-xs font-medium text-teal-400 mb-1">Suggested Next Move</p>
                    <p className="text-sm text-gray-300" data-testid="text-refine-nextmove">{refineResult.nextMove}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-xs font-medium text-teal-400 mb-1">Reflective Question</p>
                    <p className="text-sm text-gray-300 italic" data-testid="text-refine-question">{refineResult.question}</p>
                  </div>

                  <button
                    data-testid="button-save-refinement"
                    onClick={handleSaveRefinement}
                    className="w-full py-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 text-sm font-medium hover:bg-teal-500/30 transition-all"
                  >
                    Save AI Refinement
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "pipeline" && (
        <div className="space-y-3" data-testid="pipeline-tab">
          {pipelineItems.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-center">
              <Clock size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500" data-testid="text-empty-pipeline">No content ideas in your pipeline yet.</p>
            </div>
          ) : (
            pipelineItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden"
                  data-testid={`card-content-${item.id}`}
                >
                  <button
                    data-testid={`button-expand-${item.id}`}
                    onClick={() => setExpandedId(isExpanded ? null : (item.id ?? null))}
                    className="w-full p-4 flex items-start gap-3 text-left"
                  >
                    <div className="mt-0.5">
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={14} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-white truncate" data-testid={`text-title-${item.id}`}>
                          {item.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 border ${FORMAT_COLORS[item.format]}`}
                          data-testid={`badge-format-${item.id}`}
                        >
                          {item.format}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 border ${STATUS_COLORS[item.status]}`}
                          data-testid={`badge-status-${item.id}`}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                      {item.hook && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1" data-testid={`text-hook-${item.id}`}>
                          {item.hook}
                        </p>
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/[0.05] space-y-3">
                      {item.topic && (
                        <div className="pt-3">
                          <p className="text-xs font-medium text-gray-400 mb-0.5">Topic</p>
                          <p className="text-sm text-gray-300" data-testid={`text-topic-${item.id}`}>{item.topic}</p>
                        </div>
                      )}
                      {item.angle && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-0.5">Angle</p>
                          <p className="text-sm text-gray-300" data-testid={`text-angle-${item.id}`}>{item.angle}</p>
                        </div>
                      )}
                      {item.audience && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-0.5">Audience</p>
                          <p className="text-sm text-gray-300" data-testid={`text-audience-${item.id}`}>{item.audience}</p>
                        </div>
                      )}
                      {item.hook && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-0.5">Hook</p>
                          <p className="text-sm text-gray-300" data-testid={`text-hook-full-${item.id}`}>{item.hook}</p>
                        </div>
                      )}
                      {item.keyPoints && item.keyPoints.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-400 mb-0.5">Key Points</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {item.keyPoints.map((pt, i) => (
                              <li key={i} className="text-sm text-gray-300">{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.aiRefinement && (
                        <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10">
                          <p className="text-xs font-medium text-teal-400 mb-1">AI Refinement</p>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap" data-testid={`text-refinement-${item.id}`}>
                            {item.aiRefinement}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <SectionLabel>Status</SectionLabel>
                        <select
                          data-testid={`select-status-${item.id}`}
                          value={item.status}
                          onChange={(e) => item.id !== undefined && handleStatusChange(item.id, e.target.value as ContentStatus)}
                          className="px-2 py-1 bg-white/[0.05] border border-white/[0.08] rounded-lg text-xs text-white outline-none"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-gray-900">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {item.status === "published" && (
                        <div className="flex gap-2 items-center">
                          <input
                            data-testid={`input-published-url-${item.id}`}
                            className={`${INPUT_CLS} flex-1`}
                            placeholder="Published URL"
                            value={publishedUrlInputs[item.id!] ?? item.publishedUrl ?? ""}
                            onChange={(e) =>
                              setPublishedUrlInputs((prev) => ({ ...prev, [item.id!]: e.target.value }))
                            }
                          />
                          <button
                            data-testid={`button-save-url-${item.id}`}
                            onClick={() => item.id !== undefined && handleSavePublishedUrl(item.id)}
                            className="p-2 text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-400">Delete?</span>
                            <button
                              data-testid={`button-confirm-delete-${item.id}`}
                              onClick={() => item.id !== undefined && handleDelete(item.id)}
                              className="px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                            >
                              Yes
                            </button>
                            <button
                              data-testid={`button-cancel-delete-${item.id}`}
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-xs bg-white/[0.05] text-gray-400 border border-white/[0.08] rounded-lg hover:text-white transition-all"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            data-testid={`button-delete-${item.id}`}
                            onClick={() => setDeleteConfirmId(item.id ?? null)}
                            className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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