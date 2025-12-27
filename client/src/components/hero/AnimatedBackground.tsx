import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Time-of-day color palettes
const getTimeBasedColors = () => {
  const hour = new Date().getHours();
  
  // Night (10pm - 5am): Deep blues and purples
  if (hour >= 22 || hour < 5) {
    return {
      primary: "rgba(80,60,180,0.3)",
      secondary: "rgba(40,80,160,0.25)",
      accent: "rgba(120,80,200,0.2)",
      name: "night"
    };
  }
  // Morning (5am - 11am): Warm golden & soft purples
  if (hour >= 5 && hour < 11) {
    return {
      primary: "rgba(200,140,80,0.25)",
      secondary: "rgba(160,100,180,0.2)",
      accent: "rgba(255,180,100,0.15)",
      name: "morning"
    };
  }
  // Afternoon (11am - 5pm): Bright purples & cyans
  if (hour >= 11 && hour < 17) {
    return {
      primary: "rgba(140,80,255,0.3)",
      secondary: "rgba(80,210,255,0.25)",
      accent: "rgba(255,255,255,0.1)",
      name: "afternoon"
    };
  }
  // Evening (5pm - 10pm): Warm sunset tones
  return {
    primary: "rgba(200,100,150,0.28)",
    secondary: "rgba(255,120,80,0.2)",
    accent: "rgba(180,80,200,0.22)",
    name: "evening"
  };
};

export function AnimatedBackground() {
  const [colors, setColors] = useState(getTimeBasedColors);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  
  // Transform scroll progress to subtle color shift
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.7, 0.5]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [0, 8]);

  // Update colors every minute (in case user is there at time boundary)
  useEffect(() => {
    const interval = setInterval(() => {
      setColors(getTimeBasedColors());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Track mouse for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Base gradient layer - time-of-day colors */}
      <motion.div
        style={{
          position: "absolute",
          inset: "-40%",
          opacity: scrollOpacity,
          scale: scrollScale,
          rotate: scrollRotate,
        }}
        animate={{
          background: [
            `
              radial-gradient(900px 400px at ${30 + (mousePos.x - 50) * 0.1}% ${35 + (mousePos.y - 50) * 0.1}%, ${colors.primary}, transparent 60%),
              radial-gradient(900px 450px at ${70 - (mousePos.x - 50) * 0.1}% ${55 - (mousePos.y - 50) * 0.1}%, ${colors.secondary}, transparent 60%),
              radial-gradient(1100px 550px at 50% 20%, ${colors.accent}, transparent 60%)
            `,
          ],
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="blur-[12px]"
      />

      {/* Floating orbs that drift slowly */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          left: "15%",
          top: "25%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}, transparent 70%)`,
          filter: "blur(60px)",
          opacity: 0.6,
        }}
      />
      
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -20, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          position: "absolute",
          right: "10%",
          bottom: "20%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.secondary}, transparent 70%)`,
          filter: "blur(80px)",
          opacity: 0.5,
        }}
      />

      {/* Subtle star field */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px, 160px 160px",
          backgroundPosition: "0 0, 50px 80px",
          opacity: colors.name === "night" ? 0.4 : 0.15,
        }}
      />

      {/* Soft vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(0,0,0,0.4) 100%)
          `,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
