import { motion } from "framer-motion";
import { Briefcase, BarChart3, FlaskConical, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const users = [
  {
    title: "Founders",
    icon: <Briefcase size={24} />,
    color: "#a78bfa",
    borderColor: "border-purple-500/30",
    bgGlow: "rgba(167,139,250,0.06)",
    hook: "Kill your echo chamber before it kills your company.",
    bullets: [
      "Audits roadmaps for confirmation bias and narrative drift",
      "Flags when pivots are driven by Twitter hype, not data",
      "Returns a binary verdict your board can't argue with",
    ],
  },
  {
    title: "Traders",
    icon: <BarChart3 size={24} />,
    color: "#22d3ee",
    borderColor: "border-cyan-500/30",
    bgGlow: "rgba(34,211,238,0.06)",
    hook: "Is it conviction or FOMO? Get a deterministic answer.",
    bullets: [
      "Stress-tests trade theses against adversarial counter-arguments",
      "Detects FOMO loops and social momentum dependency",
      "Separates signal from noise before capital moves",
    ],
  },
  {
    title: "Researchers",
    icon: <FlaskConical size={24} />,
    color: "#4ade80",
    borderColor: "border-green-500/30",
    bgGlow: "rgba(74,222,128,0.06)",
    hook: "Find the flaw before peer review does.",
    bullets: [
      "Attacks your thesis harder than any reviewer will",
      "Flags hallucinated references and stale assumptions",
      "Forces you to defend methodology, not just conclusions",
    ],
  },
];

export function WhoUsesOracle() {
  return (
    <section className="py-24 border-t border-border bg-background dark:bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted dark:bg-white/5 mb-6">
            <span className="font-mono text-xs font-bold text-muted-foreground tracking-wider">USE CASES</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-4" data-testid="text-who-uses-headline">
            Who Uses the Oracle
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Three client archetypes. One adversarial primitive. Every audit returns a machine-readable verdict — no soothing, no validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="grid-who-uses">
          {users.map((user, i) => (
            <motion.div
              key={user.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`p-8 rounded-2xl border bg-card dark:bg-[#0a0a0a] hover:bg-muted dark:hover:bg-[#111] transition-colors ${user.borderColor}`}
              data-testid={`card-usecase-${user.title.toLowerCase()}`}
            >
              <div className="p-3 rounded-lg inline-flex mb-6" style={{ background: user.bgGlow, color: user.color }}>
                {user.icon}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{user.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{user.hook}</p>
              <ul className="space-y-3">
                {user.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: user.color }} />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/chat">
            <button className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: '#F37E20', boxShadow: '0 6px 24px rgba(243,126,32,0.3)' }} data-testid="button-deploy-audit-usecase">
              Deploy an Audit
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
