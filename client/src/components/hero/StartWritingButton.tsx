import { motion } from "framer-motion";
import { Link } from "wouter";

export function StartWritingButton() {
  return (
    <Link href="/chat">
      <motion.button
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: [0.96, 1, 1.02, 1] }}
        transition={{
          delay: 0.35,
          duration: 0.55,
          times: [0, 0.55, 0.8, 1],
          ease: "easeOut",
        }}
        whileHover={{ y: -2, boxShadow: "0 0 0 1px rgba(168,85,247,0.35), 0 18px 40px rgba(168,85,247,0.18)" }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 rounded-xl bg-purple-600/80 px-6 py-3 text-base font-medium text-white backdrop-blur hover:bg-purple-600"
        data-testid="button-start-writing"
      >
        <span className="opacity-90">✍️</span>
        Start Writing <span className="ml-1 text-white/70">→</span>
      </motion.button>
    </Link>
  );
}
