import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";
import { motion } from "framer-motion";

const curlCommand = `curl -X POST https://djzs.ai/api/audit/micro \\
  -H "Content-Type: application/json" \\
  -H "x-payment-proof: 0x_your_base_tx_hash" \\
  -d '{
    "strategy_memo": "Your reasoning trace here."
  }'`;

export function FinalCTA() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand.replace(/\\\n\s*/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-24 border-t border-border bg-background dark:bg-[#050505] overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted dark:bg-white/5 mb-6">
            <Terminal size={14} className="text-muted-foreground" />
            <span className="font-mono text-xs font-bold text-muted-foreground tracking-wider">LIVE ENDPOINT</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4" data-testid="text-final-cta-headline">
            Hit the tollbooth. Get a verdict.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Copy this command into your terminal. Replace the payment proof with your Base transaction hash. That's it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="relative rounded-2xl border border-border overflow-hidden shadow-2xl"
          style={{ background: '#0a0a0a' }}
          data-testid="terminal-final-cta"
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]" style={{ background: '#111214' }}>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(239,68,68,0.8)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(234,179,8,0.8)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(34,197,94,0.8)' }} />
              </div>
              <span className="text-xs font-mono text-white/30">bash</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all hover:bg-white/10"
              style={{ color: copied ? '#4ade80' : 'rgba(255,255,255,0.5)' }}
              data-testid="button-copy-curl"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="p-6 sm:p-8 font-mono text-sm leading-relaxed overflow-x-auto">
            <span style={{ color: '#4ade80' }}>$</span>{" "}
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>curl</span>{" "}
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>-X POST</span>{" "}
            <span style={{ color: '#22d3ee' }}>https://djzs.ai/api/audit/micro</span>{" \\\n"}
            {"  "}<span style={{ color: 'rgba(255,255,255,0.5)' }}>-H</span>{" "}
            <span style={{ color: '#a78bfa' }}>"Content-Type: application/json"</span>{" \\\n"}
            {"  "}<span style={{ color: 'rgba(255,255,255,0.5)' }}>-H</span>{" "}
            <span style={{ color: '#a78bfa' }}>"<span style={{ color: '#F37E20' }}>x-payment-proof</span>: 0x_your_base_tx_hash"</span>{" \\\n"}
            {"  "}<span style={{ color: 'rgba(255,255,255,0.5)' }}>-d</span>{" "}
            <span style={{ color: '#a78bfa' }}>{"'"}</span>{"{\n"}
            {"    "}<span style={{ color: '#22d3ee' }}>"strategy_memo"</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>:</span>{" "}
            <span style={{ color: '#4ade80' }}>"Your reasoning trace here."</span>{"\n"}
            {"  }"}<span style={{ color: '#a78bfa' }}>{"'"}</span>
          </pre>
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-muted-foreground/60" data-testid="text-final-cta-note">
            x402 · USDC on Base · Deterministic Verdicts · Zero Accounts Required
          </p>
        </div>
      </div>
    </section>
  );
}
