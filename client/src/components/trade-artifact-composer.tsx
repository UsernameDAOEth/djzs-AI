import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { vault, type VaultEntry, type ResearchDossier, type MarketAlert, type AlertCondition } from "@/lib/vault";
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
  RefreshCw,
  Bell,
  BellRing,
  Trash2,
  Eye,
} from "lucide-react";

interface TradeArtifactZoneProps {
  walletAddress?: string;
}

type TabId = "compose" | "stress" | "risk" | "execute" | "monitor" | "history";

const TABS: { id: TabId; label: string; icon: typeof Pen }[] = [
  { id: "compose", label: "Compose", icon: Pen },
  { id: "stress", label: "Stress Test", icon: BarChart3 },
  { id: "risk", label: "Risk & Sign", icon: Shield },
  { id: "execute", label: "Execute", icon: ArrowRight },
  { id: "monitor", label: "Monitor", icon: Bell },
  { id: "history", label: "History", icon: Clock },
];

const INPUT_CLS =
  "w-full px-3 py-2 bg-[#0F1115] border border-white/[0.06] rounded-md text-sm text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors";

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
              : "bg-[#14171D] text-gray-500 border border-white/[0.06] hover:text-gray-300"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[10px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">{children}</label>;
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

  const [marketLoading, setMarketLoading] = useState(false);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);

  const fetchMarketData = async (assetName: string) => {
    if (!assetName.trim()) return;
    setMarketLoading(true);
    try {
      const [priceRes, sentimentRes] = await Promise.all([
        fetch(`/api/market/price/${encodeURIComponent(assetName.trim())}`),
        fetch("/api/market/sentiment"),
      ]);
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        setCurrentPrice(String(priceData.priceUsd));
        setPriceChange24h(priceData.change24h);
      } else {
        toast({ title: "Price unavailable", description: `Could not find price for "${assetName.trim().toUpperCase()}"`, variant: "destructive" });
      }
      if (sentimentRes.ok) {
        const sentimentData = await sentimentRes.json();
        setSentiment(sentimentData.label);
      }
    } catch {
      toast({ title: "Market data unavailable", description: "Could not reach market data services", variant: "destructive" });
    } finally {
      setMarketLoading(false);
    }
  };

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

  const [execAmount, setExecAmount] = useState("");
  const [execMode, setExecMode] = useState<"paper" | "live">("paper");
  const [executing, setExecuting] = useState(false);
  const [execTxHash, setExecTxHash] = useState<string | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [paperExecutions, setPaperExecutions] = useState<Array<{ id: string; asset: string; side: string; amount: string; price: string; timestamp: number }>>([]);

  const [alertAsset, setAlertAsset] = useState("");
  const [alertCondition, setAlertCondition] = useState<AlertCondition>("price_above");
  const [alertThreshold, setAlertThreshold] = useState("");
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [triggeredAlerts, setTriggeredAlerts] = useState<Array<{ id: number; asset: string; condition: string; threshold: number; price: number; timestamp: number }>>([]);
  const monitorInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeAlerts = useLiveQuery(
    () => vault.marketAlerts.where("isActive").equals(1).toArray(),
    []
  );

  const checkAlerts = useCallback(async () => {
    const alerts = await vault.marketAlerts.where("isActive").equals(1).toArray();
    if (alerts.length === 0) return;
    const assets = [...new Set(alerts.map((a) => a.asset))];
    try {
      const res = await fetch("/api/market/batch-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets }),
      });
      if (!res.ok) return;
      const prices: Record<string, { priceUsd: number; change24h: number | null }> = await res.json();
      for (const alert of alerts) {
        const priceData = prices[alert.asset.toUpperCase()];
        if (!priceData) continue;
        let triggered = false;
        if (alert.condition === "price_above" && priceData.priceUsd >= alert.threshold) triggered = true;
        if (alert.condition === "price_below" && priceData.priceUsd <= alert.threshold) triggered = true;
        if (alert.condition === "change_above" && priceData.change24h !== null && priceData.change24h >= alert.threshold) triggered = true;
        if (alert.condition === "change_below" && priceData.change24h !== null && priceData.change24h <= alert.threshold) triggered = true;
        if (triggered && alert.id) {
          await vault.marketAlerts.update(alert.id, { isActive: 0, lastTriggered: new Date() });
          setTriggeredAlerts((prev) => [{
            id: alert.id!,
            asset: alert.asset,
            condition: alert.condition,
            threshold: alert.threshold,
            price: priceData.priceUsd,
            timestamp: Date.now(),
          }, ...prev]);
          toast({ title: `Alert triggered: ${alert.asset}`, description: `${alert.condition.replace(/_/g, " ")} ${alert.threshold} — current: $${priceData.priceUsd.toLocaleString()}` });
        }
      }
    } catch {}
  }, [toast]);

  useEffect(() => {
    if (monitoringActive) {
      checkAlerts();
      monitorInterval.current = setInterval(checkAlerts, 60_000);
    } else if (monitorInterval.current) {
      clearInterval(monitorInterval.current);
      monitorInterval.current = null;
    }
    return () => { if (monitorInterval.current) clearInterval(monitorInterval.current); };
  }, [monitoringActive, checkAlerts]);

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

  const recentClaims = useLiveQuery(
    () => vault.researchClaims.orderBy("createdAt").reverse().limit(50).toArray(),
    []
  );

  const assetLower = asset.trim().toLowerCase();

  const relevantJournal = useMemo(() => {
    const entries = recentJournal || [];
    if (!assetLower) return { matched: [] as VaultEntry[], rest: entries };
    const matched = entries.filter((e) => e.text.toLowerCase().includes(assetLower));
    const rest = entries.filter((e) => !e.text.toLowerCase().includes(assetLower));
    return { matched, rest };
  }, [recentJournal, assetLower]);

  const relevantDossiers = useMemo(() => {
    const dossiers = recentDossiers || [];
    if (!assetLower) return { matched: [] as ResearchDossier[], rest: dossiers };
    const matched = dossiers.filter((d) => d.name.toLowerCase().includes(assetLower) || (d.description || "").toLowerCase().includes(assetLower));
    const rest = dossiers.filter((d) => !d.name.toLowerCase().includes(assetLower) && !(d.description || "").toLowerCase().includes(assetLower));
    return { matched, rest };
  }, [recentDossiers, assetLower]);

  const relevantClaims = useMemo(() => {
    if (!recentClaims || !assetLower) return [];
    return recentClaims.filter((c) => c.claim.toLowerCase().includes(assetLower));
  }, [recentClaims, assetLower]);

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
      const entryText = `TRADE STRESS TEST REQUEST:\n\nAsset: ${thesis.asset}\nSide: ${thesis.side}\nTimeframe: ${thesis.timeframe}\nConviction: ${thesis.conviction}/10\nPosition Size: ${thesis.positionSizePct}%\nEntry Type: ${thesis.entry.type}${thesis.entry.limitPrice ? ` @ $${thesis.entry.limitPrice}` : ""}\nTake Profit: ${thesis.exits?.takeProfitPct ? thesis.exits.takeProfitPct + "%" : "N/A"}\nStop Loss: ${thesis.exits?.stopLossPct ? thesis.exits.stopLossPct + "%" : "N/A"}\nInvalidation: ${thesis.exits?.invalidation || "N/A"}\nCurrent Price: ${thesis.marketConditions?.currentPrice || "N/A"}\nSentiment: ${thesis.marketConditions?.sentiment || "N/A"}\nCatalysts: ${thesis.marketConditions?.catalysts?.join(", ") || "N/A"}\nNotes: ${thesis.notes || "N/A"}\n\nStress test this trade thesis like you're trying to kill it. Is this conviction or FOMO? Is the thesis driven by strategy or narrative? What's the weakest link? What information is missing that could blow this up? What would make you reject this outright? Be brutal — the market will be.`;

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
      <div className="flex items-center gap-1 mb-4 p-1 bg-[#14171D] rounded-lg border border-white/[0.06]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[rgba(243,126,32,0.1)] text-orange-400 border border-[rgba(243,126,32,0.3)]"
                  : "bg-[#14171D] text-gray-500 border border-white/[0.06] hover:text-gray-300 hover:border-white/[0.08]"
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
          <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-4">
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
                  onBlur={() => fetchMarketData(asset)}
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

          <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-teal-400" />
              <h3 className="text-sm font-semibold text-white">Market Conditions</h3>
              {priceChange24h !== null && (
                <span className={`text-[10px] font-medium ${priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`} data-testid="text-price-change">
                  {priceChange24h >= 0 ? "+" : ""}{priceChange24h.toFixed(1)}% 24h
                </span>
              )}
              <button
                data-testid="button-refresh-market"
                onClick={() => fetchMarketData(asset)}
                disabled={marketLoading || !asset.trim()}
                className="ml-auto p-1 rounded-lg hover:bg-white/[0.05] text-gray-500 hover:text-teal-400 transition-colors disabled:opacity-30"
                title="Refresh market data"
              >
                <RefreshCw size={14} className={marketLoading ? "animate-spin" : ""} />
              </button>
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

          <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-3">
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

          <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Link Evidence</h3>
              {assetLower && (relevantJournal.matched.length > 0 || relevantDossiers.matched.length > 0 || relevantClaims.length > 0) && (
                <span className="text-[10px] font-medium text-teal-400 ml-auto" data-testid="text-cross-zone-count">
                  {relevantJournal.matched.length + relevantDossiers.matched.length + relevantClaims.length} related to {asset.trim().toUpperCase()}
                </span>
              )}
            </div>

            {assetLower && relevantClaims.length > 0 && (
              <div>
                <p className="text-xs text-teal-400 mb-2 font-medium">Research Claims mentioning {asset.trim().toUpperCase()}</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {relevantClaims.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start gap-2 p-2 rounded-lg bg-teal-500/[0.05] border border-teal-500/10"
                      data-testid={`claim-relevant-${c.id}`}
                    >
                      <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5 border-teal-500/30 text-teal-400">
                        {c.trustLevel}
                      </Badge>
                      <span className="text-xs text-gray-300 line-clamp-2">{c.claim}</span>
                      <Badge variant="outline" className={`text-[9px] shrink-0 mt-0.5 ${c.status === "verified" ? "border-green-500/30 text-green-400" : c.status === "uncertain" ? "border-yellow-500/30 text-yellow-400" : "border-gray-500/30 text-gray-400"}`}>
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(() => {
              const journalEntries = assetLower ? [...relevantJournal.matched, ...relevantJournal.rest] : (recentJournal || []);
              const matchedIds = new Set(relevantJournal.matched.map((e) => e.id));
              if (journalEntries.length === 0) return null;
              return (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Journal Entries</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {journalEntries.map((e) => {
                      const isRelevant = assetLower && matchedIds.has(e.id);
                      return (
                        <label
                          key={e.id}
                          className={`flex items-start gap-2 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.015)] cursor-pointer ${isRelevant ? "bg-orange-500/[0.05] border border-orange-500/10" : ""}`}
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
                          {isRelevant && (
                            <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5 border-orange-500/30 text-orange-400">match</Badge>
                          )}
                          <span className="text-xs text-gray-400 line-clamp-2">
                            {e.text.slice(0, 100)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const dossiers = assetLower ? [...relevantDossiers.matched, ...relevantDossiers.rest] : (recentDossiers || []);
              const matchedIds = new Set(relevantDossiers.matched.map((d) => d.id));
              if (dossiers.length === 0) return null;
              return (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Research Dossiers</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {dossiers.map((d) => {
                      const isRelevant = assetLower && matchedIds.has(d.id);
                      return (
                        <label
                          key={d.id}
                          className={`flex items-start gap-2 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.015)] cursor-pointer ${isRelevant ? "bg-teal-500/[0.05] border border-teal-500/10" : ""}`}
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
                          {isRelevant && (
                            <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5 border-teal-500/30 text-teal-400">match</Badge>
                          )}
                          <span className="text-xs text-gray-400">{d.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {(!recentJournal || recentJournal.length === 0) &&
              (!recentDossiers || recentDossiers.length === 0) &&
              relevantClaims.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">
                  No journal entries or research dossiers to link yet.
                </p>
              )}
          </div>

          <button
            data-testid="button-next-stress"
            onClick={() => setActiveTab("stress")}
            disabled={!asset.trim()}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Next: Stress Test <ArrowRight size={14} />
          </button>
        </div>
      )}

      {activeTab === "stress" && (
        <div className="space-y-4" data-testid="stress-tab">
          <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06]">
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
              className="w-full py-2.5 rounded-lg text-sm font-medium bg-teal-600/20 text-teal-400 border border-teal-500/20 hover:bg-teal-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
            <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-4">
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
                  <p className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Analysis</p>
                  {stressReport.reasons.map((r, i) => (
                    <p key={i} className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {r}
                    </p>
                  ))}
                </div>
              )}

              {stressReport.counterArguments.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Counter Arguments</p>
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
                  <p className="text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">Missing Info</p>
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
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 transition-all flex items-center justify-center gap-2"
          >
            Next: Risk & Sign <ArrowRight size={14} />
          </button>
        </div>
      )}

      {activeTab === "risk" && (
        <div className="space-y-4" data-testid="risk-tab">
          <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-4">
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
            <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Risk Summary</h4>
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
                <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                  <p className="text-[10px] text-gray-500">Position Size</p>
                  <p className="text-sm text-white font-mono">{riskSummary.computed.proposedPositionSizePct}%</p>
                </div>
                <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                  <p className="text-[10px] text-gray-500">Daily Loss</p>
                  <p className="text-sm text-white font-mono">{riskSummary.computed.dailyLossPct.toFixed(1)}%</p>
                </div>
                <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
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
            <div className="p-4 rounded-lg bg-green-500/[0.05] border border-green-500/20 space-y-3" data-testid="success-state">
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
                          <div key={i} className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)] border border-white/[0.06] text-xs">
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
                      className="px-3 py-2 rounded-lg text-xs font-medium bg-teal-500/20 text-teal-400 border border-teal-500/20 hover:bg-teal-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
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
                className="w-full py-2 rounded-lg text-xs font-medium bg-white/[0.05] text-gray-300 hover:bg-white/[0.08] transition-all"
              >
                View in History
              </button>
            </div>
          ) : (
            <button
              data-testid="button-create-sign"
              onClick={handleCreateAndSign}
              disabled={signing || !asset.trim()}
              className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-orange-500/20 to-teal-500/20 text-white border border-orange-500/20 hover:from-orange-500/30 hover:to-teal-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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

      {activeTab === "execute" && (
        <div className="space-y-4" data-testid="execute-tab">
          {!createdArtifact ? (
            <div className="p-6 rounded-lg bg-[#14171D] border border-white/[0.06] text-center">
              <Shield size={24} className="mx-auto mb-2 text-gray-600" />
              <p className="text-sm text-gray-400 mb-1">No signed artifact</p>
              <p className="text-xs text-gray-600">Create and sign an artifact in the Risk & Sign tab first.</p>
              <button
                data-testid="button-go-to-risk"
                onClick={() => setActiveTab("risk")}
                className="mt-3 px-4 py-2 rounded-lg text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 transition-colors"
              >
                Go to Risk & Sign
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowRight size={16} className="text-orange-400" />
                  <h3 className="text-sm font-semibold text-white">Execution Details</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                    <p className="text-[10px] text-gray-500">Asset</p>
                    <p className="text-sm text-white font-mono">{createdArtifact.thesis.asset}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                    <p className="text-[10px] text-gray-500">Direction</p>
                    <p className={`text-sm font-mono ${createdArtifact.thesis.side === "BUY" ? "text-green-400" : "text-red-400"}`}>
                      {createdArtifact.thesis.side}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                    <p className="text-[10px] text-gray-500">Entry Type</p>
                    <p className="text-sm text-white font-mono">{createdArtifact.thesis.entry.type}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                    <p className="text-[10px] text-gray-500">Conviction</p>
                    <p className="text-sm text-white font-mono">{createdArtifact.thesis.conviction}</p>
                  </div>
                </div>

                {createdArtifact.thesis.exits && (
                  <div className="grid grid-cols-2 gap-2">
                    {createdArtifact.thesis.exits.takeProfitPct && (
                      <div className="p-2 rounded-lg bg-green-500/[0.05] border border-green-500/10">
                        <p className="text-[10px] text-green-600">Take Profit</p>
                        <p className="text-sm text-green-400 font-mono">+{createdArtifact.thesis.exits.takeProfitPct}%</p>
                      </div>
                    )}
                    {createdArtifact.thesis.exits.stopLossPct && (
                      <div className="p-2 rounded-lg bg-red-500/[0.05] border border-red-500/10">
                        <p className="text-[10px] text-red-600">Stop Loss</p>
                        <p className="text-sm text-red-400 font-mono">-{createdArtifact.thesis.exits.stopLossPct}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-3">
                <SectionLabel>Execution Mode</SectionLabel>
                <ToggleGroup
                  options={["paper", "live"]}
                  value={execMode}
                  onChange={(v) => setExecMode(v as "paper" | "live")}
                  testIdPrefix="toggle-exec-mode"
                />
                {execMode === "live" && (
                  <div className="flex items-center gap-1.5 text-[10px] text-yellow-500 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/15">
                    <AlertCircle size={12} />
                    <span>Live execution will send a real transaction from your connected wallet.</span>
                  </div>
                )}

                <div>
                  <SectionLabel>Amount (USD)</SectionLabel>
                  <input
                    data-testid="input-exec-amount"
                    type="number"
                    className={INPUT_CLS}
                    placeholder="e.g. 100"
                    value={execAmount}
                    onChange={(e) => setExecAmount(e.target.value)}
                  />
                </div>

                {execError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/15">
                    <AlertCircle size={12} />
                    <span>{execError}</span>
                  </div>
                )}

                {execTxHash && (
                  <div className="p-3 rounded-lg bg-green-500/[0.05] border border-green-500/20 space-y-2" data-testid="exec-tx-success">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-400" />
                      <span className="text-xs font-medium text-green-400">Transaction Submitted</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono break-all">{execTxHash}</p>
                    <a
                      href={`https://basescan.org/tx/${execTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-teal-400 hover:text-teal-300 underline"
                      data-testid="link-basescan"
                    >
                      View on BaseScan
                    </a>
                  </div>
                )}

                <button
                  data-testid="button-execute-trade"
                  disabled={executing || !execAmount.trim() || parseFloat(execAmount) <= 0 || (!walletClient && execMode === "live")}
                  onClick={async () => {
                    setExecuting(true);
                    setExecError(null);
                    setExecTxHash(null);
                    try {
                      if (execMode === "paper") {
                        await new Promise((r) => setTimeout(r, 1200));
                        const paperExec = {
                          id: nanoid(),
                          asset: createdArtifact!.thesis.asset,
                          side: createdArtifact!.thesis.side,
                          amount: execAmount,
                          price: currentPrice || "N/A",
                          timestamp: Date.now(),
                        };
                        setPaperExecutions((prev) => [paperExec, ...prev]);
                        toast({ title: "Paper trade executed", description: `${createdArtifact!.thesis.side} ${createdArtifact!.thesis.asset} — $${execAmount} at $${currentPrice || "market"}` });
                      } else {
                        if (!walletClient) { setExecError("Connect wallet to execute live trades"); return; }
                        const txHash = await walletClient.sendTransaction({
                          to: walletAddress as `0x${string}`,
                          value: BigInt(0),
                          data: `0x${Buffer.from(JSON.stringify({
                            type: "DJZS_TRADE_EXEC",
                            artifact: createdArtifact!.hash,
                            asset: createdArtifact!.thesis.asset,
                            side: createdArtifact!.thesis.side,
                            amount: execAmount,
                            timestamp: Date.now(),
                          })).toString("hex")}` as `0x${string}`,
                        });
                        setExecTxHash(txHash);
                        toast({ title: "Transaction submitted", description: `TX: ${txHash.slice(0, 10)}...` });
                      }
                    } catch (err: any) {
                      setExecError(err?.message || "Execution failed");
                    } finally {
                      setExecuting(false);
                    }
                  }}
                  className={`w-full py-3 rounded-lg text-sm font-semibold border transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                    execMode === "live"
                      ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border-red-500/20 hover:from-red-500/30 hover:to-orange-500/30"
                      : "bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-white border-teal-500/20 hover:from-teal-500/30 hover:to-blue-500/30"
                  }`}
                >
                  {executing ? (
                    <><Loader2 size={14} className="animate-spin" /> Executing...</>
                  ) : execMode === "live" ? (
                    <><ArrowRight size={14} /> Execute Live Trade</>
                  ) : (
                    <><FileText size={14} /> Execute Paper Trade</>
                  )}
                </button>
              </div>

              {paperExecutions.length > 0 && (
                <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-teal-400" />
                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Paper Executions</h4>
                  </div>
                  {paperExecutions.map((pe) => (
                    <div key={pe.id} className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.015)] border border-white/[0.06] space-y-1" data-testid={`paper-exec-${pe.id}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{pe.side} {pe.asset}</span>
                        <span className="text-[10px] text-gray-500">{new Date(pe.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>Amount: ${pe.amount}</span>
                        <span>Price: ${pe.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "monitor" && (
        <div className="space-y-4" data-testid="monitor-tab">
          <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-orange-400" />
                <h3 className="text-sm font-semibold text-white">Market Alerts</h3>
              </div>
              <button
                data-testid="button-toggle-monitoring"
                onClick={() => setMonitoringActive(!monitoringActive)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                  monitoringActive
                    ? "bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/25"
                    : "bg-white/[0.05] text-gray-400 border-white/[0.08] hover:bg-white/[0.08]"
                }`}
              >
                {monitoringActive ? (
                  <><Eye size={10} className="inline mr-1" />Watching</>
                ) : (
                  "Start Watching"
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-600">
              {monitoringActive
                ? "Checking prices every 60 seconds. Alerts fire once and auto-deactivate."
                : "Set price or change alerts. Start watching to enable autonomous monitoring."}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-3">
            <SectionLabel>New Alert</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              <input
                data-testid="input-alert-asset"
                className={INPUT_CLS}
                placeholder="Asset (e.g. BTC)"
                value={alertAsset}
                onChange={(e) => setAlertAsset(e.target.value)}
              />
              <select
                data-testid="select-alert-condition"
                className={`${INPUT_CLS} appearance-none`}
                value={alertCondition}
                onChange={(e) => setAlertCondition(e.target.value as AlertCondition)}
              >
                <option value="price_above">Price Above</option>
                <option value="price_below">Price Below</option>
                <option value="change_above">24h Change Above %</option>
                <option value="change_below">24h Change Below %</option>
              </select>
            </div>
            <input
              data-testid="input-alert-threshold"
              type="number"
              className={INPUT_CLS}
              placeholder={alertCondition.includes("change") ? "e.g. 5 (percent)" : "e.g. 100000 (USD)"}
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
            />
            <button
              data-testid="button-create-alert"
              disabled={!alertAsset.trim() || !alertThreshold.trim()}
              onClick={async () => {
                await vault.marketAlerts.add({
                  asset: alertAsset.toUpperCase().trim(),
                  condition: alertCondition,
                  threshold: parseFloat(alertThreshold),
                  artifactHash: createdHash || undefined,
                  isActive: 1,
                  createdAt: new Date(),
                });
                toast({ title: "Alert created", description: `${alertAsset.toUpperCase()} ${alertCondition.replace(/_/g, " ")} ${alertThreshold}` });
                setAlertAsset("");
                setAlertThreshold("");
              }}
              className="w-full py-2.5 rounded-lg text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus size={12} /> Add Alert
            </button>
          </div>

          {(activeAlerts?.length ?? 0) > 0 && (
            <div className="p-4 rounded-lg bg-[#14171D] border border-white/[0.06] space-y-2">
              <SectionLabel>Active Alerts ({activeAlerts?.length})</SectionLabel>
              {activeAlerts?.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[rgba(255,255,255,0.015)] border border-white/[0.06]" data-testid={`alert-${alert.id}`}>
                  <div className="flex items-center gap-2">
                    <BellRing size={12} className="text-orange-400" />
                    <div>
                      <p className="text-xs text-white font-medium">{alert.asset}</p>
                      <p className="text-[10px] text-gray-500">
                        {alert.condition.replace(/_/g, " ")} {alert.condition.includes("change") ? `${alert.threshold}%` : `$${alert.threshold.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <button
                    data-testid={`button-delete-alert-${alert.id}`}
                    onClick={async () => {
                      if (alert.id) await vault.marketAlerts.delete(alert.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {triggeredAlerts.length > 0 && (
            <div className="p-4 rounded-lg bg-green-500/[0.03] border border-green-500/15 space-y-2">
              <SectionLabel>Triggered Alerts</SectionLabel>
              {triggeredAlerts.map((ta) => (
                <div key={ta.id} className="p-2.5 rounded-lg bg-[rgba(255,255,255,0.015)] border border-green-500/10 space-y-1" data-testid={`triggered-${ta.id}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-400">{ta.asset}</span>
                    <span className="text-[10px] text-gray-500">{new Date(ta.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    {ta.condition.replace(/_/g, " ")} {ta.threshold} — price was ${ta.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
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
                className="rounded-lg bg-[#14171D] border border-white/[0.06] overflow-hidden"
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
                  <div className="p-3 pt-0 space-y-3 border-t border-white/[0.06]" data-testid={`artifact-details-${a.id}`}>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                        <p className="text-[10px] text-gray-500">Conviction</p>
                        <p className="text-sm text-white">{a.thesis.conviction}/10</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                        <p className="text-[10px] text-gray-500">Size</p>
                        <p className="text-sm text-white">{a.thesis.positionSizePct}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                        <p className="text-[10px] text-gray-500">Entry</p>
                        <p className="text-sm text-white">{a.thesis.entry.type}</p>
                      </div>
                    </div>

                    {a.thesis.exits && (
                      <div className="grid grid-cols-3 gap-2">
                        {a.thesis.exits.takeProfitPct !== undefined && (
                          <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                            <p className="text-[10px] text-gray-500">TP</p>
                            <p className="text-sm text-green-400">{a.thesis.exits.takeProfitPct}%</p>
                          </div>
                        )}
                        {a.thesis.exits.stopLossPct !== undefined && (
                          <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)]">
                            <p className="text-[10px] text-gray-500">SL</p>
                            <p className="text-sm text-red-400">{a.thesis.exits.stopLossPct}%</p>
                          </div>
                        )}
                        {a.thesis.exits.invalidation && (
                          <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.015)] col-span-full">
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
