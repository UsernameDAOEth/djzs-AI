import { motion } from "framer-motion";

const ZONES = [
  "ZONE",
  "JOURNAL",
  "RESEARCH",
  "E2E ENCRYPTION",
  "DATA OWNERSHIP"
];

export function ZoneFlow() {
  return (
    <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center">
        {ZONES.map((zone, i) => {
          return (
            <motion.div
              key={zone}
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [100, 0, -100],
                scale: [0.8, 1.2, 0.8],
                filter: ["blur(4px)", "blur(0px)", "blur(4px)"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
              className="absolute text-5xl md:text-7xl font-black tracking-tighter uppercase pointer-events-none select-none"
              style={{
                color: i === 0 ? "white" : "rgba(255,255,255,0.1)",
                zIndex: 10 - i,
              }}
            >
              {zone}
            </motion.div>
          );
        })}
      </div>
      
      {/* Visual Indicator like in the image */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
          <div className="w-4 h-6 bg-white/80 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>
        <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-white/40" />
      </div>
    </div>
  );
}
