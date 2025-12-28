import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ZONES = [
  "ZONE",
  "JOURNAL",
  "RESEARCH",
  "DATA OWNERSHIP"
];

export function ZoneFlow() {
  const [index, setIndex] = useState(0);

  const nextZone = () => {
    setIndex((prev) => (prev + 1) % ZONES.length);
  };

  return (
    <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={ZONES[index]}
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
            transition={{ 
              duration: 0.5, 
              ease: [0.23, 1, 0.32, 1] 
            }}
            className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-white pointer-events-none select-none text-center"
          >
            {ZONES[index]}
          </motion.div>
        </AnimatePresence>
        
        {/* Ghost words for depth */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`prev-${ZONES[(index - 1 + ZONES.length) % ZONES.length]}`}
              initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              animate={{ opacity: 0.05, y: -180, filter: "blur(4px)" }}
              exit={{ opacity: 0, y: -220, filter: "blur(10px)" }}
              className="absolute text-4xl md:text-6xl font-black uppercase"
            >
              {ZONES[(index - 1 + ZONES.length) % ZONES.length]}
            </motion.div>
            <motion.div
              key={`next-${ZONES[(index + 1) % ZONES.length]}`}
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 0.05, y: 180, filter: "blur(4px)" }}
              exit={{ opacity: 0, y: 220, filter: "blur(10px)" }}
              className="absolute text-4xl md:text-6xl font-black uppercase"
            >
              {ZONES[(index + 1) % ZONES.length]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Visual Indicator - Now Controls the words */}
      <button 
        onClick={nextZone}
        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-4 group z-20 cursor-pointer active:scale-95 transition-transform"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:border-white/40 transition-colors">
          <div className="w-3 h-5 md:w-4 md:h-6 bg-white/90 rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse group-hover:animate-none group-hover:scale-110 transition-transform" />
        </div>
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white/60 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
