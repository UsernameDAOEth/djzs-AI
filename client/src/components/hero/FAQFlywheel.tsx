import { motion } from "framer-motion";

const WORDS = [
  "QUESTIONS",
  "SYSTEM",
  "ANSWERS"
];

export function FAQFlywheel() {
  return (
    <div className="relative h-[120px] md:h-[150px] w-full flex items-center justify-center overflow-hidden mb-4 z-0">
      <div className="flex flex-col items-center">
        {WORDS.map((word, i) => {
          return (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [40, 0, -40],
                scale: [0.95, 1.05, 0.95],
                filter: ["blur(4px)", "blur(0px)", "blur(4px)"],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut",
              }}
              className="absolute text-4xl md:text-6xl font-extrabold tracking-tight uppercase pointer-events-none select-none text-white whitespace-nowrap drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              style={{
                zIndex: 1,
              }}
            >
              {word === "SYSTEM" ? (
                <span className="text-purple-400">{word}</span>
              ) : word}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
