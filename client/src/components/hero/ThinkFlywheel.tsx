import { motion } from "framer-motion";

const WORDS = [
  "THINK",
  "CLEARLY",
  "EVERYDAY"
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
                scale: [0.8, 1.1, 0.8],
                filter: ["blur(4px)", "blur(0px)", "blur(4px)"],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "easeInOut",
              }}
              className="absolute text-7xl md:text-9xl font-black tracking-tighter uppercase pointer-events-none select-none text-white whitespace-nowrap"
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
