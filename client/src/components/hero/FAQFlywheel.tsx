import { motion } from "framer-motion";

const WORDS = [
  "QUESTIONS",
  "ANSWERS",
  "FREQUENTLY ASKED"
];

export function FAQFlywheel() {
  return (
    <div className="relative h-[120px] md:h-[150px] w-full flex items-center justify-center overflow-hidden mb-4">
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
              className="absolute text-5xl md:text-7xl font-black tracking-tighter uppercase pointer-events-none select-none text-white whitespace-nowrap"
              style={{
                zIndex: 10 - i,
              }}
            >
              {word === "FREQUENTLY ASKED" ? (
                <span>FREQUENTLY <span className="text-purple-500">ASKED</span></span>
              ) : word}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
