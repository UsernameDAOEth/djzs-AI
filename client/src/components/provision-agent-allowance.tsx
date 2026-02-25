import { useState } from "react";
import { AlertCircle } from "lucide-react";

export function ProvisionAgentAllowance() {
  const [usdcAmount, setUsdcAmount] = useState<string>("");

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl" data-testid="panel-provision-agent-allowance">
      <div>
        <h2
          className="text-lg font-black tracking-[0.15em] uppercase text-green-500 font-mono"
          data-testid="text-allowance-title"
        >
          PROTOCOL OVERSEER: X402 ALLOWANCE
        </h2>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed font-mono" data-testid="text-allowance-subtitle">
          Provision capital to execution agents. Autonomous tasks will deduct from this escrow per Logic Trace.
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-4 border border-zinc-800 bg-black p-4"
        data-testid="panel-metrics"
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
            Available Velocity (USDC)
          </p>
          <p className="text-2xl font-black font-mono text-green-500" data-testid="text-escrow-balance">
            0.00
          </p>
          <span
            className="inline-block mt-1 text-[9px] font-mono font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-700"
            data-testid="badge-network"
          >
            Base Mainnet
          </span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
            Pending Logic Traces
          </p>
          <p className="text-2xl font-black font-mono text-zinc-300" data-testid="text-pending-traces">
            0
          </p>
        </div>
      </div>

      <div>
        <input
          type="number"
          value={usdcAmount}
          onChange={(e) => setUsdcAmount(e.target.value)}
          placeholder="USDC Amount to Provision"
          className="w-full bg-black border border-zinc-800 text-green-500 font-mono p-2 focus:outline-none focus:border-green-400 placeholder:text-zinc-600"
          min="0"
          step="0.01"
          data-testid="input-usdc-amount"
        />
        <button
          className="w-full bg-zinc-900 text-white border border-zinc-700 hover:border-green-500 p-2 font-mono mt-4 transition-colors"
          data-testid="button-authorize-escrow"
        >
          AUTHORIZE AGENT ESCROW
        </button>
        <div className="flex items-center gap-2 mt-3">
          <AlertCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <p className="text-[11px] font-mono text-zinc-500" data-testid="text-minimum-warning">
            A minimum of $5.00 USDC is required to initialize the high-frequency API tollbooth.
          </p>
        </div>
      </div>
    </div>
  );
}
