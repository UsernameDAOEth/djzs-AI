import { motion } from "framer-motion";

const ZONES = [
  "ZONE",
  "JOURNAL",
  "RESEARCH",
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
                color: "white",
                zIndex: 10 - i,
              }}
            >
              {zone}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
