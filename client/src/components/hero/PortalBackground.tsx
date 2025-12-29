import { motion } from "framer-motion";

interface PortalBackgroundProps {
  variant?: "hero" | "zone" | "clarity" | "faq";
}

export function PortalBackground({ variant = "hero" }: PortalBackgroundProps) {
  const configs = {
    hero: {
      circles: [
        { size: 600, color: "bg-purple-500/10", blur: "blur-3xl", x: 0, y: -20, duration: 12 },
        { size: 800, color: "bg-indigo-400/5", blur: "blur-2xl", x: 80, y: 40, duration: 15 },
        { size: 1000, color: "bg-purple-300/5", blur: "blur-3xl", x: -100, y: -80, duration: 18 },
      ],
    },
    zone: {
      circles: [
        { size: 500, color: "bg-blue-500/8", blur: "blur-3xl", x: -40, y: -30, duration: 14 },
        { size: 700, color: "bg-purple-400/5", blur: "blur-2xl", x: 60, y: 20, duration: 16 },
      ],
    },
    clarity: {
      circles: [
        { size: 550, color: "bg-indigo-500/8", blur: "blur-3xl", x: 20, y: -40, duration: 13 },
        { size: 750, color: "bg-purple-300/5", blur: "blur-2xl", x: -80, y: 30, duration: 17 },
        { size: 900, color: "bg-blue-400/3", blur: "blur-3xl", x: 40, y: -60, duration: 20 },
      ],
    },
    faq: {
      circles: [
        { size: 450, color: "bg-purple-500/6", blur: "blur-3xl", x: 0, y: -20, duration: 15 },
        { size: 600, color: "bg-indigo-400/4", blur: "blur-2xl", x: -50, y: 30, duration: 18 },
      ],
    },
  };

  const config = configs[variant];

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {config.circles.map((circle, i) => (
        <motion.div
          key={i}
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
            x: circle.x,
            y: circle.y,
          }}
          transition={{ 
            duration: circle.duration, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: i * 2,
          }}
          className={`absolute rounded-full ${circle.color} ${circle.blur}`}
          style={{
            width: circle.size,
            height: circle.size,
            left: '50%',
            top: '50%',
            marginLeft: -circle.size / 2,
            marginTop: -circle.size / 2,
          }}
        />
      ))}
    </div>
  );
}
