import { motion } from "framer-motion";

const WORDS = [
  "CLARITY",
  "PRIVATE",
  "OWNED",
  "AI-ASSISTED"
];

export function ClarityFlywheel() {
  return (
    <div className="relative h-[150px] md:h-[200px] w-full flex items-center justify-center overflow-hidden mb-8">
      <div className="flex flex-col items-center">
        {WORDS.map((word, i) => {
          return (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [60, 0, -60],
                scale: [0.9, 1.1, 0.9],
                filter: ["blur(4px)", "blur(0px)", "blur(4px)"],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut",
              }}
              className="absolute text-5xl md:text-7xl font-extrabold tracking-tight uppercase pointer-events-none select-none text-white whitespace-nowrap drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]"
              style={{
                zIndex: 10 - i,
              }}
            >
              {word === "CLARITY" ? (
                <span>BUILT FOR <span className="text-purple-500">CLARITY</span></span>
              ) : word}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
