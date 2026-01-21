import { motion } from "framer-motion";

const WORDS = [
  "YOUR SPACE",
  "JOURNALING",
  "PRIVATE"
];

export function ZoneFlywheel() {
  return (
    <div className="relative h-[150px] md:h-[200px] w-full flex items-center justify-center overflow-hidden mb-6" style={{ isolation: "isolate", zIndex: 0 }}>
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
                duration: 3.5,
                repeat: Infinity,
                delay: i * 1.2,
                ease: "easeInOut",
              }}
              className="absolute text-5xl md:text-7xl font-extrabold tracking-tight uppercase pointer-events-none select-none text-white whitespace-nowrap drop-shadow-[0_0_25px_rgba(59,130,246,0.4)]"
              style={{
                zIndex: 1,
              }}
            >
              {word === "JOURNALING" ? (
                <span className="text-purple-400">{word}</span>
              ) : word}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
