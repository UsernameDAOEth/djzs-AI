import { motion } from "framer-motion";
import { Zap, Briefcase, Shield, Check, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const tiers = [
  {
    name: "Micro",
    endpoint: "/api/audit/micro",
    price: "$2.50",
    color: "#22d3ee",
    borderColor: "border-cyan-500/30",
    bgGlow: "rgba(34,211,238,0.06)",
    icon: <Zap size={24} />,
    desc: "Fast, constrained operational audits for autonomous agents making real-time decisions.",
    limit: "1,000 char payload",
    features: [
      "Binary PASS/FAIL verdict",
      "Risk score (0–100)",
      "DJZS-LF failure codes",
      "< 3s response time",
    ],
    cta: "Best for: Trading bots, DeFi agents",
  },
  {
    name: "Founder",
    endpoint: "/api/audit/founder",
    price: "$5.00",
    color: "#a78bfa",
    borderColor: "border-purple-500/30",
    bgGlow: "rgba(167,139,250,0.06)",
    icon: <Briefcase size={24} />,
    desc: "Deep roadmap diligence for founders deploying capital or strategy against a thesis.",
    limit: "5,000 char payload",
    features: [
      "Everything in Micro",
      "Bias pattern detection",
      "Narrative drift analysis",
      "Counter-thesis generation",
    ],
    cta: "Best for: Founders, DAO proposals",
    featured: true,
  },
  {
    name: "Treasury",
    endpoint: "/api/audit/treasury",
    price: "$50.00",
    color: "#4ade80",
    borderColor: "border-green-500/30",
    bgGlow: "rgba(74,222,128,0.06)",
    icon: <Shield size={24} />,
    desc: "Exhaustive adversarial governance audits for treasuries and high-stakes execution.",
    limit: "Unlimited payload",
    features: [
      "Everything in Founder",
      "Multi-vector attack surface",
      "Governance risk modeling",
      "Proof of Logic certificate",
    ],
    cta: "Best for: DAO treasuries, protocols",
  },
];

export function ApiTiers() {
  return (
    <section className="py-24 border-t border-border bg-background dark:bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted dark:bg-white/5 mb-6">
            <span className="font-mono text-xs font-bold text-muted-foreground tracking-wider">x402 PROTOCOL</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="font-mono text-xs text-muted-foreground">USDC ON BASE</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4" data-testid="text-pricing-headline">
            Pay-per-Verify. No subscriptions.
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Every audit is a single atomic transaction. Send USDC on Base, receive a deterministic verdict. No accounts, no API keys, no monthly invoices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="grid-pricing-tiers">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative p-8 rounded-2xl border bg-card dark:bg-[#0a0a0a] transition-all hover:-translate-y-1 ${tier.borderColor} ${tier.featured ? 'ring-1 ring-purple-500/30' : ''}`}
              style={{ boxShadow: tier.featured ? `0 0 60px ${tier.bgGlow}` : undefined }}
              data-testid={`card-tier-${tier.name.toLowerCase()}`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold font-mono tracking-wider" style={{ background: tier.color, color: '#000' }}>
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-lg" style={{ background: tier.bgGlow, color: tier.color }}>
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{tier.name} Zone</h3>
                  <code className="text-xs font-mono text-muted-foreground">{tier.endpoint}</code>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black text-foreground">{tier.price}</span>
                <span className="text-muted-foreground ml-2 text-sm">USDC / audit</span>
              </div>

              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{tier.desc}</p>

              <div className="text-xs font-mono px-3 py-1.5 rounded-md border border-border bg-muted dark:bg-white/5 text-muted-foreground mb-6 inline-block">
                {tier.limit}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check size={16} className="shrink-0 mt-0.5" style={{ color: tier.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="text-xs text-muted-foreground font-mono border-t border-border pt-4" style={{ color: tier.color }}>
                {tier.cta}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/chat">
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: '#a78bfa', boxShadow: '0 6px 24px rgba(167,139,250,0.3)' }} data-testid="button-deploy-audit-pricing">
              Deploy an Audit
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
