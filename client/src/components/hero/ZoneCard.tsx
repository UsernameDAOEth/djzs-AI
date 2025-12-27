import { motion } from "framer-motion";

export function ZoneCard({
  title,
  desc,
  startHere,
}: {
  title: string;
  desc: string;
  startHere?: boolean;
}) {
  return (
    <motion.div
      whileHover={{
        y: -4,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 22px 60px rgba(168,85,247,0.10)",
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
    >
      {startHere && (
        <div className="absolute right-4 top-4 rounded-full bg-purple-600/20 px-3 py-1 text-[10px] font-medium text-purple-200 ring-1 ring-purple-400/20">
          Start here
        </div>
      )}

      <motion.h3
        whileHover={{ color: "rgba(255,255,255,0.95)" }}
        className="text-base font-semibold text-white/85"
      >
        {title}
      </motion.h3>
      <p className="mt-2 text-sm text-white/60">{desc}</p>
    </motion.div>
  );
}
