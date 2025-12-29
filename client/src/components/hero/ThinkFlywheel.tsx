import { motion } from "framer-motion";

const WORDS = [
  "BUILT FOR",
  "DECENTRALIZED",
  "THINKING"
];

export function ThinkFlywheel() {
  return (
    <div className="relative h-[200px] md:h-[300px] w-full flex items-center justify-center overflow-hidden mb-8">
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
              className="absolute text-5xl md:text-8xl font-black tracking-tighter uppercase pointer-events-none select-none text-white whitespace-nowrap"
              style={{
                zIndex: 10 - i,
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
