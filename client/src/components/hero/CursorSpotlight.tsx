import { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CursorSpotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for cursor movement
  const springConfig = { damping: 25, stiffness: 200 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        background: "radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 5,
        x: smoothX,
        y: smoothY,
        translateX: "-50%",
        translateY: "-50%",
        filter: "blur(40px)",
      }}
    />
  );
}
