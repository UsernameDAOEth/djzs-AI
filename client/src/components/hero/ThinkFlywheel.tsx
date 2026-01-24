import { motion } from "framer-motion";

const WORDS = [
  { text: "BUILT FOR", isHighlight: false },
  { text: "DECENTRALIZED", isHighlight: true },
  { text: "THINKING", isHighlight: false }
];

export function ThinkFlywheel() {
  return (
    <div className="relative h-[200px] md:h-[300px] w-full flex items-center justify-center mb-8">
      <div className="flex flex-col items-center w-full">
        {WORDS.map((word, i) => {
          const isLongWord = word.text === "DECENTRALIZED";
          return (
            <motion.div
              key={word.text}
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
              className={`absolute font-extrabold tracking-tight uppercase pointer-events-none select-none whitespace-nowrap ${word.isHighlight ? "text-purple-400" : "text-white"} drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]`}
              style={{
                zIndex: 10 - i,
                fontSize: isLongWord 
                  ? "clamp(2rem, 6vw, 6rem)" 
                  : "clamp(3rem, 8vw, 8rem)",
              }}
            >
              {word.text}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
