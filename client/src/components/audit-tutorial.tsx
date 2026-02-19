import { useState, useEffect, useCallback } from "react";
import { Zap, Activity, Shield, ScrollText, ArrowRight, ArrowLeft, X, Target, FileText, BarChart3 } from "lucide-react";

const TUTORIAL_STEPS = [
  {
    id: "welcome",
    title: "Welcome to the Audit Zone",
    description: "DJZS is an adversarial auditing system. You submit strategy memos, and the System pressure-tests them for bias, logic flaws, and blind spots.",
    icon: Target,
    color: "#F37E20",
    highlight: null,
    tip: "This is not a validation tool. It exists to find what's wrong with your thinking.",
  },
  {
    id: "zones",
    title: "Three Execution Zones",
    description: "Each zone offers a different depth of adversarial audit. Choose based on the stakes of your decision.",
    icon: BarChart3,
    color: "#2dd4bf",
    highlight: "sidebar-zones",
    tip: "Start with Micro-Zone for quick sanity checks. Upgrade to Founder or Treasury when the stakes are higher.",
    zones: [
      { name: "Micro-Zone", price: "$2.50", color: "#2dd4bf", desc: "Fast binary risk scoring for operational decisions" },
      { name: "Founder Zone", price: "$5.00", color: "#F37E20", desc: "Deep bias detection for strategic roadmap decisions" },
      { name: "Treasury Zone", price: "$50.00", color: "#a855f7", desc: "Exhaustive adversarial breakdown for governance proposals" },
    ],
  },
  {
    id: "payload",
    title: "Write Your Strategy Memo",
    description: "Type or paste your strategy, trade thesis, or decision rationale into the terminal. Be specific — the more detail you provide, the sharper the audit.",
    icon: FileText,
    color: "#2dd4bf",
    highlight: "textarea-audit-payload",
    tip: "Include your reasoning, assumptions, and what you expect to happen. The System will attack all of it.",
  },
  {
    id: "deploy",
    title: "Deploy to Zone",
    description: "Hit the deploy button to send your memo through adversarial analysis. The System will return a risk score, detected biases, logic flaws, and structural recommendations.",
    icon: Zap,
    color: "#F37E20",
    highlight: "button-deploy",
    tip: "Payment is via x402 protocol — USDC on Base Mainnet. Each deployment is priced per zone tier.",
  },
  {
    id: "results",
    title: "Read Your Audit Report",
    description: "Every audit returns a structured verdict: risk score (0-100), primary bias detected, individual logic flaws with severity ratings, and actionable recommendations.",
    icon: BarChart3,
    color: "#ef4444",
    highlight: null,
    tip: "Risk scores: 0-24 LOW (green), 25-49 MODERATE (teal), 50-74 ELEVATED (amber), 75-100 CRITICAL (red).",
    riskLevels: [
      { label: "LOW", range: "0-24", color: "#34d399" },
      { label: "MODERATE", range: "25-49", color: "#2dd4bf" },
      { label: "ELEVATED", range: "50-74", color: "#f59e0b" },
      { label: "CRITICAL", range: "75-100", color: "#ef4444" },
    ],
  },
  {
    id: "ledger",
    title: "Cryptographic Ledger",
    description: "Every audit is saved locally with a cryptographic hash. Your Ledger is your immutable audit trail — review past results, compare risk scores, and re-deploy memos to different zones.",
    icon: ScrollText,
    color: "#f59e0b",
    highlight: "button-ledger",
    tip: "All data stays on your device. Nothing leaves unless you choose to share it.",
  },
];

const STORAGE_KEY = "djzs_tutorial_completed";

interface AuditTutorialProps {
  onComplete: () => void;
  isOpen: boolean;
}

export function AuditTutorial({ onComplete, isOpen }: AuditTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const goNext = useCallback(() => {
    if (isAnimating) return;
    if (isLast) {
      localStorage.setItem(STORAGE_KEY, "true");
      onComplete();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => s + 1);
      setIsAnimating(false);
    }, 150);
  }, [isLast, isAnimating, onComplete]);

  const goBack = useCallback(() => {
    if (isAnimating || isFirst) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => s - 1);
      setIsAnimating(false);
    }, 150);
  }, [isFirst, isAnimating]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight" || e.key === "Enter") goNext();
      if (e.key === "ArrowLeft") goBack();
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goNext, goBack, handleSkip]);

  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !step.highlight) return;
    const el = document.querySelector(`[data-testid="${step.highlight}"]`) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.position = "relative";
    el.style.zIndex = "101";
    el.style.boxShadow = `0 0 0 4px ${step.color}40, 0 0 20px ${step.color}20`;
    el.style.borderRadius = "8px";
    el.style.transition = "box-shadow 0.3s ease";
    return () => {
      el.style.zIndex = "";
      el.style.boxShadow = "";
      el.style.borderRadius = "";
      el.style.position = "";
    };
  }, [isOpen, currentStep, step.highlight, step.color]);

  if (!isOpen) return null;

  const StepIcon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" data-testid="tutorial-overlay">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleSkip} />

      <div
        className="relative w-[90%] max-w-lg mx-auto rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{ background: '#1a1d26', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
        data-testid="tutorial-card"
      >
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: step.color }}
          />
        </div>

        <div className="flex items-center justify-between px-5 pt-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-gray-600 hover:text-gray-300 transition-colors p-1"
            data-testid="button-skip-tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={`px-6 pt-4 pb-6 transition-opacity duration-150 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}
            >
              <StepIcon className="w-5 h-5" style={{ color: step.color }} />
            </div>
            <h3 className="text-lg font-black text-white">{step.title}</h3>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed mb-4">{step.description}</p>

          {"zones" in step && step.zones && (
            <div className="space-y-2 mb-4">
              {step.zones.map((zone) => (
                <div
                  key={zone.name}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: zone.color }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{zone.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: zone.color }}>{zone.price}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{zone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {"riskLevels" in step && step.riskLevels && (
            <div className="flex gap-2 mb-4">
              {step.riskLevels.map((level) => (
                <div
                  key={level.label}
                  className="flex-1 p-2.5 rounded-lg text-center"
                  style={{ background: `${level.color}10`, border: `1px solid ${level.color}25` }}
                >
                  <span className="text-xs font-black block" style={{ color: level.color }}>{level.label}</span>
                  <span className="text-[10px] font-mono text-gray-500">{level.range}</span>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-lg mb-5" style={{ background: 'rgba(243,126,32,0.05)', border: '1px solid rgba(243,126,32,0.12)' }}>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              <span className="font-bold text-orange-400/80 mr-1">TIP:</span>
              {step.tip}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={isFirst}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-0 disabled:pointer-events-none text-gray-400 hover:text-white hover:bg-white/[0.03]"
              data-testid="button-tutorial-back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-black transition-all"
              style={{
                background: isLast ? step.color : `${step.color}15`,
                color: isLast ? '#fff' : step.color,
                border: `1px solid ${step.color}${isLast ? '' : '30'}`,
              }}
              data-testid="button-tutorial-next"
            >
              {isLast ? "Start Auditing" : "Next"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 pb-4">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { if (!isAnimating) setCurrentStep(idx); }}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: idx === currentStep ? step.color : 'rgba(255,255,255,0.1)',
                width: idx === currentStep ? '16px' : '6px',
              }}
              data-testid={`tutorial-dot-${idx}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setShowTutorial(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const openTutorial = useCallback(() => setShowTutorial(true), []);
  const closeTutorial = useCallback(() => setShowTutorial(false), []);

  return { showTutorial, openTutorial, closeTutorial };
}
