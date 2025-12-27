import { motion } from "framer-motion";

export function ScrollCue() {
  return (
    <div className="flex flex-col items-center gap-2 text-white/40">
      <span className="text-[10px] tracking-[0.25em] uppercase">Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 6, 0], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="text-lg"
      >
        ↓
      </motion.div>
    </div>
  );
}
