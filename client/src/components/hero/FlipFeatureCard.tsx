import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface FlipFeatureCardProps {
  icon: ReactNode;
  title: string;
  frontText: string;
  backItems: string[];
}

export function FlipFeatureCard({ icon, title, frontText, backItems }: FlipFeatureCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div
      className="relative h-[280px] w-full perspective-1000"
      style={{ perspective: "1000px" }}
    >
      <motion.button
        onClick={handleFlip}
        onHoverStart={() => setIsFlipped(true)}
        onHoverEnd={() => setIsFlipped(false)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
        style={{ transformStyle: "preserve-3d" }}
        data-testid={`flip-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
        aria-label={`${title}: ${frontText}. Click or hover to learn more.`}
      >
        {/* Front */}
        <div
          className="absolute inset-0 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-6">
            {icon}
          </div>
          <h4 className="text-xl font-black text-white mb-3 tracking-tight">{title}</h4>
          <p className="text-gray-500 font-medium leading-relaxed text-sm">{frontText}</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20 flex flex-col items-start justify-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-[10px] text-purple-400 font-black tracking-[0.3em] uppercase mb-4">How it works</p>
          <ul className="space-y-3 text-left">
            {backItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-purple-400 mt-1">•</span>
                <span className="text-gray-300 text-sm font-medium leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.button>
    </div>
  );
}
