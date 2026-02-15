import { useState, useMemo } from "react";
import { useWalletClient } from "wagmi";
import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { vault } from "@/lib/vault";
import {
  createTradeArtifactV1,
  toTradeArtifactRow,
  computeRiskSummary,
  type TradeThesis,
  type ZoneRef,
  type StressTestReport,
  type RiskParameters,
  type TradeArtifactRow,
  type TradeArtifactV1,
} from "@/lib/trade-artifacts";
import {
  sendTradeArtifactOverXmtp,
  streamExecutionReports,
  type ExecutionReportV1,
} from "@/lib/trade-artifacts-xmtp";
import { useXmtp } from "@/hooks/use-xmtp";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Loader2,
  FileText,
  Hash,
  Pen,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock,
  X,
  Plus,
  Search,
  Send,
} from "lucide-react";

interface TradeArtifactZoneProps {
  walletAddress?: string;
}

type TabId = "compose" | "stress" | "risk" | "history";

const TABS: { id: TabId; label: string; icon: typeof Pen }[] = [
  { id: "compose", label: "Compose", icon: Pen },
  { id: "stress", label: "Stress Test", icon: BarChart3 },
  { id: "risk", label: "Risk & Sign", icon: Shield },
  { id: "history", label: "History", icon: Clock },
];

const INPUT_CLS =
  "w-full px-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 transition-colors";

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
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
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

export function TradeArtifactZone({ walletAddress }: TradeArtifactZoneProps) {
  const { toast } = useToast();
  const { data: walletClient } = useWalletClient();

  const [activeTab, setActiveTab] = useState<TabId>("compose");

  const [asset, setAsset] = useState("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [timeframe, setTimeframe] = useState<"SHORT" | "MEDIUM" | "LONG">("SHORT");
  const [conviction, setConviction] = useState(5);
  const [positionSizePct, setPositionSizePct] = useState(2);
  const [entryType, setEntryType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [takeProfitPct, setTakeProfitPct] = useState<string>("");
  const [stopLossPct, setStopLossPct] = useState<string>("");
  const [invalidation, setInvalidation] = useState("");
  const [currentPrice, setCurrentPrice] = useState<string>("");
  const [sentiment, setSentiment] = useState<"FEAR" | "NEUTRAL" | "GREED" | "">(""); 
  const [catalysts, setCatalysts] = useState("");
  const [notes, setNotes] = useState("");
  const [memo, setMemo] = useState("");

  const [selectedJournalIds, setSelectedJournalIds] = useState<Set<number>>(new Set());
  const [selectedDossierIds, setSelectedDossierIds] = useState<Set<number>>(new Set());

  const [stressReport, setStressReport] = useState<StressTestReport | null>(null);
  const [stressLoading, setStressLoading] = useState(false);

  const [maxPositionSizePct, setMaxPositionSizePct] = useState(5);
  const [maxDailyLossPct, setMaxDailyLossPct] = useState(2);
  const [signing, setSigning] = useState(false);
  const [createdHash, setCreatedHash] = useState<string | null>(null);
  const [createdSignature, setCreatedSignature] = useState<string | null>(null);
  const [createdArtifact, setCreatedArtifact] = useState<TradeArtifactV1 | null>(null);

  const [agentAddress, setAgentAddress] = useState("");
  const [xmtpSending, setXmtpSending] = useState(false);
  const [xmtpSent, setXmtpSent] = useState(false);
  const [execReports, setExecReports] = useState<ExecutionReportV1[]>([]);

  const { client: xmtpClient, isConnected: xmtpConnected, connect: connectXmtp, isConnecting: xmtpConnecting } = useXmtp();

  const [historyFilter, setHistoryFilter] = useState("");
  const [expandedArtifactId, setExpandedArtifactId] = useState<number | null>(null);

  const recentJournal = useLiveQuery(
    () =>
      vault.entries
        .where("type")
        .equals("journal")
        .reverse()
        .sortBy("createdAt")
        .then((e) => e.slice(0, 20)),
    []
  );

  const recentDossiers = useLiveQuery(
    () =>
      vault.researchDossiers
        .where("isArchived")
        .equals(0)
        .reverse()
        .sortBy("updatedAt")
        .then((d) => d.slice(0, 20)),
    []
  );

  const allArtifacts = useLiveQuery(
    () => vault.tradeArtifacts.orderBy("createdAt").reverse().toArray(),
    []
  );

  const filteredArtifacts = useMemo(() => {
    if (!allArtifacts) return [];
    if (!historyFilter.trim()) return allArtifacts;
    const q = historyFilter.trim().toUpperCase();
    return allArtifacts.filter((a) => a.thesisAsset.toUpperCase().includes(q));
  }, [allArtifacts, historyFilter]);

  const buildThesis = (): TradeThesis => ({
    id: nanoid(),
    asset: asset.toUpperCase().trim(),
    side,
    timeframe,
    conviction,
    positionSizePct,
    entry: {
      type: entryType,
      ...(entryType === "LIMIT" && limitPrice ? { limitPrice: parseFloat(limitPrice) } : {}),
    },
    exits: {
      ...(takeProfitPct ? { takeProfitPct: parseFloat(takeProfitPct) } : {}),
      ...(stopLossPct ? { stopLossPct: parseFloat(stopLossPct) } : {}),
      ...(invalidation ? { invalidation } : {}),
    },
    marketConditions: {
      ...(currentPrice ? { currentPrice: parseFloat(currentPrice) } : {}),
      ...(sentiment ? { sentiment: sentiment as "FEAR" | "NEUTRAL" | "GREED" } : {}),
      ...(catalysts.trim()
        ? { catalysts: catalysts.split(",").map((c) => c.trim()).filter(Boolean) }
        : {}),
    },
    notes: notes || undefined,
    createdAt: Date.now(),
  });

  const buildEvidence = (): ZoneRef[] => {
    const refs: ZoneRef[] = [];
    if (recentJournal) {
      for (const e of recentJournal) {
        if (e.id !== undefined && selectedJournalIds.has(e.id)) {
          refs.push({
            kind: "journal",
            id: String(e.id),
            title: e.text.slice(0, 60),
          });
        }
      }
    }
    if (recentDossiers) {
      for (const d of recentDossiers) {
        if (d.id !== undefined && selectedDossierIds.has(d.id)) {
          refs.push({
            kind: "research",
            id: String(d.id),
            title: d.name,
          });
        }
      }
    }
    return refs;
  };

  const riskSummary = useMemo(() => {
    if (!asset.trim()) return null;
    const thesis = buildThesis();
    const params: RiskParameters = { maxPositionSizePct, maxDailyLossPct };
    return computeRiskSummary({ thesis, params });
  }, [asset, positionSizePct, stopLossPct, maxPositionSizePct, maxDailyLossPct, side, timeframe, conviction, entryType, limitPrice, takeProfitPct]);

  const handleStressTest = async () => {
    if (!asset.trim()) {
      toast({ title: "Missing asset", description: "Enter an asset symbol first.", variant: "destructive" });
      return;
    }
    setStressLoading(true);
    try {
      const thesis = buildThesis();
      const entryText = `TRADE STRESS TEST REQUEST:\n\nAsset: ${thesis.asset}\nSide: ${thesis.side}\nTimeframe: ${thesis.timeframe}\nConviction: ${thesis.conviction}/10\nPosition Size: ${thesis.positionSizePct}%\nEntry Type: ${thesis.entry.type}${thesis.entry.limitPrice ? ` @ $${thesis.entry.limitPrice}` : ""}\nTake Profit: ${thesis.exits?.takeProfitPct ? thesis.exits.takeProfitPct + "%" : "N/A"}\nStop Loss: ${thesis.exits?.stopLossPct ? thesis.exits.stopLossPct + "%" : "N/A"}\nInvalidation: ${thesis.exits?.invalidation || "N/A"}\nCurrent Price: ${thesis.marketConditions?.currentPrice || "N/A"}\nSentiment: ${thesis.marketConditions?.sentiment || "N/A"}\nCatalysts: ${thesis.marketConditions?.catalysts?.join(", ") || "N/A"}\nNotes: ${thesis.notes || "N/A"}\n\nPlease stress test this trade thesis. Identify weaknesses, counter-arguments, missing information, and whether you would approve or reject this thesis.`;

      const res = await apiRequest("POST", "/api/agent/analyze", {
        mode: "journal",
        intent: "clarity",
        entry: entryText,
        pinnedMemory: [],
        priorEntries: [],
      });
      const data = await res.json();

      const report: StressTestReport = {
        approved: !data.said?.toLowerCase().includes("reject") && !data.said?.toLowerCase().includes("caution"),
        reasons: data.said ? [data.said] : [],
        counterArguments: data.reflectiveQuestions || [],
        missingInfo: data.nextMove ? [data.nextMove] : [],
        suggestedMemoryPins: data.memorySuggestion?.shouldSuggest
          ? [{ title: data.memorySuggestion.kind, content: data.memorySuggestion.content }]
          : [],
      };
      setStressReport(report);
    } catch (err: any) {
      toast({ title: "Stress test failed", description: err.message || "Could not run analysis", variant: "destructive" });
    } finally {
      setStressLoading(false);
    }
  };

  const handleCreateAndSign = async () => {
    if (!asset.trim()) {
      toast({ title: "Missing asset", description: "Enter an asset symbol first.", variant: "destructive" });
      return;
    }
    if (!stressReport) {
      toast({ title: "Stress test required", description: "Run the stress test first.", variant: "destructive" });
      return;
    }

    setSigning(true);
    try {
      const thesis = buildThesis();
      const evidence = buildEvidence();
      const params: RiskParameters = { maxPositionSizePct, maxDailyLossPct };
      const risk = computeRiskSummary({ thesis, params });

      const artifact = await createTradeArtifactV1({
        thesis,
        evidence,
        stressTest: stressReport,
        risk,
        memo: memo || undefined,
        walletClient: walletClient ?? undefined,
        account: walletAddress as `0x${string}` | undefined,
      });

      const row = toTradeArtifactRow(artifact);

      const existing = await vault.tradeArtifacts.where("hash").equals(artifact.hash).first();
      if (existing) {
        toast({ title: "Duplicate artifact", description: "An artifact with the same hash already exists." });
        setCreatedHash(artifact.hash);
        setSigning(false);
        return;
      }

      await vault.tradeArtifacts.add(row);
      setCreatedHash(artifact.hash);
      setCreatedSignature(artifact.author.signature ?? null);
      setCreatedArtifact(artifact);
      toast({ title: "Artifact created", description: `Hash: ${artifact.hash.slice(0, 16)}...` });
    } catch (err: any) {
      toast({ title: "Failed to create artifact", description: err.message || "Unknown error", variant: "destructive" });
    } finally {
      setSigning(false);
    }
  };

  const handleSendXmtp = async () => {
    if (!createdArtifact || !agentAddress.trim()) return;

    let activeClient = xmtpClient;
    if (!activeClient) {
      activeClient = await connectXmtp();
      if (!activeClient) {
        toast({ title: "XMTP not connected", description: "Connect your wallet and try again.", variant: "destructive" });
        return;
      }
    }

    setXmtpSending(true);
    try {
      await sendTradeArtifactOverXmtp({
        xmtpClient: activeClient as any,
        agentAddress: agentAddress.trim() as `0x${string}`,
        artifact: createdArtifact,
      });

      setXmtpSent(true);
      toast({ title: "Artifact sent", description: "Sent to trader agent via XMTP (E2E encrypted)." });

      const stopStream = await streamExecutionReports({
        xmtpClient: activeClient as any,
        agentAddress: agentAddress.trim() as `0x${string}`,
        onReport: (report) => {
          setExecReports((prev) => [...prev, report]);
        },
      });

      setTimeout(() => stopStream(), 5 * 60 * 1000);
    } catch (err: any) {
      toast({ title: "XMTP send failed", description: err.message || "Could not send artifact", variant: "destructive" });
    } finally {
      setXmtpSending(false);
    }
  };

  const formatDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleDateString("en-US", {
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

  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="trade-artifact-zone">
      <div className="flex items-center gap-1 mb-4 p-1 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
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
              <Pen size={16} className="text-orange-400" />
              <h3 className="text-sm font-semibold text-white">Build Trade Thesis</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SectionLabel>Asset</SectionLabel>
                <input
                  data-testid="input-asset"
                  className={INPUT_CLS}
                  placeholder="ETH, BTC, SOL..."
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                />
              </div>
              <div>
                <SectionLabel>Position Size %</SectionLabel>
                <input
                  data-testid="input-position-size"
                  type="number"
                  min={0}
                  max={100}
                  className={INPUT_CLS}
                  placeholder="2"
                  value={positionSizePct}
                  onChange={(e) => setPositionSizePct(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <SectionLabel>Side</SectionLabel>
              <ToggleGroup
                options={["BUY", "SELL"]}
                value={side}
                onChange={(v) => setSide(v as "BUY" | "SELL")}
                testIdPrefix="toggle-side"
              />
            </div>

            <div>
              <SectionLabel>Timeframe</SectionLabel>
              <ToggleGroup
                options={["SHORT", "MEDIUM", "LONG"]}
                value={timeframe}
                onChange={(v) => setTimeframe(v as "SHORT" | "MEDIUM" | "LONG")}
                testIdPrefix="toggle-timeframe"
              />
            </div>

            <div>
              <SectionLabel>Conviction ({conviction}/10)</SectionLabel>
              <input
                data-testid="slider-conviction"
                type="range"
                min={1}
                max={10}
                value={conviction}
                onChange={(e) => setConviction(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-gray-600">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div>
              <SectionLabel>Entry Type</SectionLabel>
              <ToggleGroup
                options={["MARKET", "LIMIT"]}
                value={entryType}
                onChange={(v) => setEntryType(v as "MARKET" | "LIMIT")}
                testIdPrefix="toggle-entry"
              />
            </div>

            {entryType === "LIMIT" && (
              <div>
                <SectionLabel>Limit Price</SectionLabel>
                <input
                  data-testid="input-limit-price"
                  type="number"
                  className={INPUT_CLS}
                  placeholder="0.00"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SectionLabel>Take Profit %</SectionLabel>
                <input
                  data-testid="input-take-profit"
                  type="number"
                  className={INPUT_CLS}
                  placeholder="Optional"
                  value={takeProfitPct}
                  onChange={(e) => setTakeProfitPct(e.target.value)}
                />
              </div>
              <div>
                <SectionLabel>Stop Loss %</SectionLabel>
                <input
                  data-testid="input-stop-loss"
                  type="number"
                  className={INPUT_CLS}
                  placeholder="Optional"
                  value={stopLossPct}
                  onChange={(e) => setStopLossPct(e.target.value)}
                />
              </div>
            </div>

            <div>
              <SectionLabel>Invalidation</SectionLabel>
              <input
                data-testid="input-invalidation"
                className={INPUT_CLS}
                placeholder="What would invalidate this thesis? (optional)"
                value={invalidation}
                onChange={(e) => setInvalidation(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-teal-400" />
              <h3 className="text-sm font-semibold text-white">Market Conditions</h3>
              <span className="text-[10px] text-gray-600 ml-auto">Optional</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SectionLabel>Current Price</SectionLabel>
                <input
                  data-testid="input-current-price"
                  type="number"
                  className={INPUT_CLS}
                  placeholder="0.00"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                />
              </div>
              <div>
                <SectionLabel>Sentiment</SectionLabel>
                <ToggleGroup
                  options={["FEAR", "NEUTRAL", "GREED"]}
                  value={sentiment}
                  onChange={(v) => setSentiment(v as "FEAR" | "NEUTRAL" | "GREED")}
                  testIdPrefix="toggle-sentiment"
                />
              </div>
            </div>

            <div>
              <SectionLabel>Catalysts (comma-separated)</SectionLabel>
              <input
                data-testid="input-catalysts"
                className={INPUT_CLS}
                placeholder="e.g. ETF approval, halving, protocol upgrade"
                value={catalysts}
                onChange={(e) => setCatalysts(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <SectionLabel>Notes</SectionLabel>
            <textarea
              data-testid="input-notes"
              className={`${INPUT_CLS} min-h-[80px] resize-none`}
              placeholder="Your reasoning, thoughts, context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <SectionLabel>Memo</SectionLabel>
            <input
              data-testid="input-memo"
              className={INPUT_CLS}
              placeholder="Short description (optional)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Link Evidence</h3>
            </div>

            {recentJournal && recentJournal.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Journal Entries</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {recentJournal.map((e) => (
                    <label
                      key={e.id}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/[0.03] cursor-pointer"
                      data-testid={`evidence-journal-${e.id}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-orange-500"
                        checked={e.id !== undefined && selectedJournalIds.has(e.id)}
                        onChange={() => {
                          if (e.id === undefined) return;
                          setSelectedJournalIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(e.id!)) next.delete(e.id!);
                            else next.add(e.id!);
                            return next;
                          });
                        }}
                      />
                      <span className="text-xs text-gray-400 line-clamp-2">
                        {e.text.slice(0, 100)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {recentDossiers && recentDossiers.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Research Dossiers</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {recentDossiers.map((d) => (
                    <label
                      key={d.id}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/[0.03] cursor-pointer"
                      data-testid={`evidence-dossier-${d.id}`}
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 accent-teal-500"
                        checked={d.id !== undefined && selectedDossierIds.has(d.id)}
                        onChange={() => {
                          if (d.id === undefined) return;
                          setSelectedDossierIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(d.id!)) next.delete(d.id!);
                            else next.add(d.id!);
                            return next;
                          });
                        }}
                      />
                      <span className="text-xs text-gray-400">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {(!recentJournal || recentJournal.length === 0) &&
              (!recentDossiers || recentDossiers.length === 0) && (
                <p className="text-xs text-gray-600 text-center py-4">
                  No journal entries or research dossiers to link yet.
                </p>
              )}
          </div>

          <button
            data-testid="button-next-stress"
            onClick={() => setActiveTab("stress")}
            disabled={!asset.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Next: Stress Test <ArrowRight size={14} />
          </button>
        </div>
      )}

      {activeTab === "stress" && (
        <div className="space-y-4" data-testid="stress-tab">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-orange-400" />
              <h3 className="text-sm font-semibold text-white">AI Stress Test</h3>
            </div>

            {!asset.trim() && (
              <p className="text-xs text-gray-500 mb-3">
                Go back to Compose and fill in your thesis first.
              </p>
            )}

            <button
              data-testid="button-run-stress-test"
              onClick={handleStressTest}
              disabled={stressLoading || !asset.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-teal-600/20 text-teal-400 border border-teal-500/20 hover:bg-teal-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {stressLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Running...
                </>
              ) : (
                <>
                  <BarChart3 size={14} /> Run Stress Test
                </>
              )}
            </button>
          </div>

          {stressReport && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
              <div className="flex items-center gap-2">
                {stressReport.approved ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30" data-testid="badge-approved">
                    <CheckCircle size={12} className="mr-1" /> Approved
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30" data-testid="badge-rejected">
                    <AlertCircle size={12} className="mr-1" /> Needs Review
                  </Badge>
                )}
              </div>

              {stressReport.reasons.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Analysis</p>
                  {stressReport.reasons.map((r, i) => (
                    <p key={i} className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {r}
                    </p>
                  ))}
                </div>
              )}

              {stressReport.counterArguments.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Counter Arguments</p>
                  <ul className="space-y-1">
                    {stressReport.counterArguments.map((c, i) => (
                      <li key={i} className="text-xs text-gray-400 flex gap-1.5">
                        <AlertCircle size={12} className="text-yellow-500 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {stressReport.missingInfo.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Missing Info</p>
                  <ul className="space-y-1">
                    {stressReport.missingInfo.map((m, i) => (
                      <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                        <Search size={12} className="text-gray-600 mt-0.5 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[10px] text-gray-600 italic">
                This is a recommendation only — you can proceed regardless.
              </p>
            </div>
          )}

          <button
            data-testid="button-next-risk"
            onClick={() => setActiveTab("risk")}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 transition-all flex items-center justify-center gap-2"
          >
            Next: Risk & Sign <ArrowRight size={14} />
          </button>
        </div>
      )}

      {activeTab === "risk" && (
        <div className="space-y-4" data-testid="risk-tab">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} className="text-orange-400" />
              <h3 className="text-sm font-semibold text-white">Risk Parameters</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SectionLabel>Max Position Size %</SectionLabel>
                <input
                  data-testid="input-max-position"
                  type="number"
                  className={INPUT_CLS}
                  value={maxPositionSizePct}
                  onChange={(e) => setMaxPositionSizePct(Number(e.target.value))}
                />
              </div>
              <div>
                <SectionLabel>Max Daily Loss %</SectionLabel>
                <input
                  data-testid="input-max-daily-loss"
                  type="number"
                  className={INPUT_CLS}
                  value={maxDailyLossPct}
                  onChange={(e) => setMaxDailyLossPct(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {riskSummary && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-medium text-gray-400">Risk Summary</h4>
                {riskSummary.withinLimits ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]" data-testid="badge-within-limits">
                    Within Limits
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]" data-testid="badge-violations">
                    Violations
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-[10px] text-gray-500">Position Size</p>
                  <p className="text-sm text-white font-mono">{riskSummary.computed.proposedPositionSizePct}%</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-[10px] text-gray-500">Daily Loss</p>
                  <p className="text-sm text-white font-mono">{riskSummary.computed.dailyLossPct.toFixed(1)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03]">
                  <p className="text-[10px] text-gray-500">Worst Case</p>
                  <p className="text-sm text-white font-mono">{riskSummary.computed.estWorstCaseLossPct}%</p>
                </div>
              </div>

              {riskSummary.violations.length > 0 && (
                <div className="space-y-1">
                  {riskSummary.violations.map((v, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-red-400">
                      <AlertCircle size={12} /> {v}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {createdHash ? (
            <div className="p-4 rounded-2xl bg-green-500/[0.05] border border-green-500/20 space-y-3" data-testid="success-state">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <h3 className="text-sm font-semibold text-green-400">Artifact Created</h3>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Hash</p>
                <p className="text-xs text-white font-mono break-all" data-testid="text-artifact-hash">
                  {createdHash}
                </p>
              </div>
              {createdSignature && (
                <div>
                  <p className="text-[10px] text-gray-500 mb-1">Signature</p>
                  <p className="text-xs text-gray-400 font-mono break-all" data-testid="text-artifact-signature">
                    {createdSignature.slice(0, 20)}...{createdSignature.slice(-8)}
                  </p>
                </div>
              )}
              <div className="pt-2 border-t border-white/[0.06] space-y-2">
                <p className="text-[10px] text-gray-500">Send to trader agent via XMTP (E2E encrypted)</p>
                {xmtpSent ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-teal-400">
                      <CheckCircle size={12} /> Sent via XMTP
                    </div>
                    {execReports.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-gray-500">Execution Reports</p>
                        {execReports.map((r, i) => (
                          <div key={i} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs">
                            <span className={`font-medium ${r.status === "LIVE_CONFIRMED" || r.status === "PAPER_EXECUTED" ? "text-green-400" : r.status === "REJECTED" || r.status === "FAILED" ? "text-red-400" : "text-yellow-400"}`}>
                              {r.status}
                            </span>
                            {r.reason && <span className="text-gray-500 ml-1.5">— {r.reason}</span>}
                            {r.venue && <span className="text-gray-600 ml-1.5">({r.venue})</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      data-testid="input-agent-address"
                      className={`${INPUT_CLS} flex-1 text-[11px]`}
                      placeholder="0x... agent address"
                      value={agentAddress}
                      onChange={(e) => setAgentAddress(e.target.value)}
                    />
                    <button
                      data-testid="button-send-xmtp"
                      onClick={handleSendXmtp}
                      disabled={xmtpSending || !agentAddress.trim() || xmtpConnecting}
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/20 hover:bg-teal-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                    >
                      {xmtpSending || xmtpConnecting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Send
                    </button>
                  </div>
                )}
              </div>

              <button
                data-testid="button-view-history"
                onClick={() => setActiveTab("history")}
                className="w-full py-2 rounded-xl text-xs font-medium bg-white/[0.05] text-gray-300 hover:bg-white/[0.08] transition-all"
              >
                View in History
              </button>
            </div>
          ) : (
            <button
              data-testid="button-create-sign"
              onClick={handleCreateAndSign}
              disabled={signing || !asset.trim()}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500/20 to-teal-500/20 text-white border border-orange-500/20 hover:from-orange-500/30 hover:to-teal-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {signing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Signing...
                </>
              ) : (
                <>
                  <Shield size={14} /> Create & Sign Artifact
                </>
              )}
            </button>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-3" data-testid="history-tab">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              data-testid="input-history-filter"
              className={`${INPUT_CLS} pl-9`}
              placeholder="Filter by asset..."
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
            />
          </div>

          {(!filteredArtifacts || filteredArtifacts.length === 0) && (
            <div className="text-center py-12">
              <Hash size={24} className="mx-auto text-gray-700 mb-2" />
              <p className="text-sm text-gray-500">No artifacts yet</p>
              <p className="text-xs text-gray-600">Create your first trade artifact in the Compose tab.</p>
            </div>
          )}

          {filteredArtifacts.map((a) => {
            const expanded = expandedArtifactId === a.id;
            return (
              <div
                key={a.id ?? a.hash}
                className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden"
                data-testid={`artifact-card-${a.id}`}
              >
                <button
                  data-testid={`button-expand-${a.id}`}
                  onClick={() => setExpandedArtifactId(expanded ? null : (a.id ?? null))}
                  className="w-full p-3 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="shrink-0">
                    {a.thesisSide === "BUY" ? (
                      <TrendingUp size={16} className="text-green-400" />
                    ) : (
                      <TrendingDown size={16} className="text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{a.thesisAsset}</span>
                      <Badge
                        className={`text-[10px] ${
                          a.thesisSide === "BUY"
                            ? "bg-green-500/15 text-green-400 border-green-500/20"
                            : "bg-red-500/15 text-red-400 border-red-500/20"
                        }`}
                      >
                        {a.thesisSide}
                      </Badge>
                      <Badge className="text-[10px] bg-white/[0.05] text-gray-400 border-white/[0.08]">
                        {a.thesisTimeframe}
                      </Badge>
                      {a.author?.signature && (
                        <Badge className="text-[10px] bg-teal-500/15 text-teal-400 border-teal-500/20" data-testid={`badge-signed-${a.id}`}>
                          Signed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-600 font-mono">
                        {a.hash.slice(0, 12)}...
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {formatDate(a.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {expanded ? (
                      <ChevronDown size={14} className="text-gray-600" />
                    ) : (
                      <ChevronRight size={14} className="text-gray-600" />
                    )}
                  </div>
                </button>

                {expanded && (
                  <div className="p-3 pt-0 space-y-3 border-t border-white/[0.05]" data-testid={`artifact-details-${a.id}`}>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="p-2 rounded-lg bg-white/[0.03]">
                        <p className="text-[10px] text-gray-500">Conviction</p>
                        <p className="text-sm text-white">{a.thesis.conviction}/10</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.03]">
                        <p className="text-[10px] text-gray-500">Size</p>
                        <p className="text-sm text-white">{a.thesis.positionSizePct}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.03]">
                        <p className="text-[10px] text-gray-500">Entry</p>
                        <p className="text-sm text-white">{a.thesis.entry.type}</p>
                      </div>
                    </div>

                    {a.thesis.exits && (
                      <div className="grid grid-cols-3 gap-2">
                        {a.thesis.exits.takeProfitPct !== undefined && (
                          <div className="p-2 rounded-lg bg-white/[0.03]">
                            <p className="text-[10px] text-gray-500">TP</p>
                            <p className="text-sm text-green-400">{a.thesis.exits.takeProfitPct}%</p>
                          </div>
                        )}
                        {a.thesis.exits.stopLossPct !== undefined && (
                          <div className="p-2 rounded-lg bg-white/[0.03]">
                            <p className="text-[10px] text-gray-500">SL</p>
                            <p className="text-sm text-red-400">{a.thesis.exits.stopLossPct}%</p>
                          </div>
                        )}
                        {a.thesis.exits.invalidation && (
                          <div className="p-2 rounded-lg bg-white/[0.03] col-span-full">
                            <p className="text-[10px] text-gray-500">Invalidation</p>
                            <p className="text-xs text-gray-400">{a.thesis.exits.invalidation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {a.risk && (
                      <div className="flex items-center gap-2">
                        <Shield size={12} className="text-gray-500" />
                        <span className="text-[10px] text-gray-500">
                          Risk: {a.risk.withinLimits ? "Within limits" : `${a.risk.violations.length} violation(s)`}
                        </span>
                      </div>
                    )}

                    {a.stressTest && (
                      <div className="flex items-center gap-2">
                        {a.stressTest.approved ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <AlertCircle size={12} className="text-yellow-500" />
                        )}
                        <span className="text-[10px] text-gray-500">
                          Stress test: {a.stressTest.approved ? "Approved" : "Needs review"}
                        </span>
                      </div>
                    )}

                    {a.memo && (
                      <p className="text-xs text-gray-400 italic">{a.memo}</p>
                    )}

                    {a.thesis.notes && (
                      <div>
                        <p className="text-[10px] text-gray-500 mb-1">Notes</p>
                        <p className="text-xs text-gray-400 whitespace-pre-wrap">{a.thesis.notes}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Full Hash</p>
                      <p className="text-[10px] text-gray-600 font-mono break-all">{a.hash}</p>
                    </div>

                    {a.author?.address && (
                      <div>
                        <p className="text-[10px] text-gray-500 mb-1">Author</p>
                        <p className="text-[10px] text-gray-600 font-mono">{a.author.address}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
