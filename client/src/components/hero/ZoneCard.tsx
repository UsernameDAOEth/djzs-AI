import { motion } from "framer-motion";
import { Link } from "wouter";

export function ZoneCard({
  title,
  desc,
  startHere,
  href = "/chat",
}: {
  title: string;
  desc: string;
  startHere?: boolean;
  href?: string;
}) {
  const isLink = href && href !== "#";

  const content = (
    <motion.div
      whileHover={isLink ? {
        y: -4,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.12), 0 22px 60px rgba(168,85,247,0.15)",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
      } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all ${
        isLink ? "cursor-pointer group" : "cursor-default opacity-80"
      }`}
    >
      {startHere && (
        <div className="absolute right-4 top-4 rounded-full bg-purple-600/20 px-3 py-1 text-[10px] font-bold text-purple-300 ring-1 ring-purple-500/30 z-10 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
          Start here
        </div>
      )}

      <h3 className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-sm text-white/50 leading-relaxed font-medium group-hover:text-white/70 transition-colors">
        {desc}
      </p>
    </motion.div>
  );

  if (!isLink) {
    return content;
  }

  return (
    <Link href={href}>
      <a className="block h-full no-underline outline-none focus:ring-2 focus:ring-purple-500/50 rounded-2xl">
        {content}
      </a>
    </Link>
  );
}
