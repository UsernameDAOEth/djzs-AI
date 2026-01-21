import { motion } from "framer-motion";

const WORDS = [
  "BUILT FOR",
  "DECENTRALIZED",
  "THINKING"
];

export function ThinkFlywheel() {
  return (
    <div className="relative h-[200px] md:h-[300px] w-full flex items-center justify-center overflow-hidden mb-8 z-0">
      <div className="flex flex-col items-center">
        {WORDS.map((word, i) => {
          return (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 50 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [80, 0, -80],
                scale: [0.7, 1, 0.7],
                filter: ["blur(4px)", "blur(0px)", "blur(4px)"],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut",
              }}
              className={`absolute text-5xl md:text-8xl font-extrabold tracking-tight uppercase pointer-events-none select-none whitespace-nowrap ${word === "DECENTRALIZED" ? "text-purple-400" : "text-white"} drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]`}
              style={{
                zIndex: 1,
              }}
            >
              {word}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
