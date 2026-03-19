import { useEffect, useRef, useCallback } from 'react';

interface TorusLogoProps {
  size?: 'sm' | 'md';
  className?: string;
  'data-testid'?: string;
}

export function TorusLogo({
  size = 'md',
  className = '',
  'data-testid': testId,
}: TorusLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const hoveredRef = useRef(false);
  const timeRef = useRef(0);

  const displaySize = size === 'sm' ? 24 : 36;
  const canvasSize = displaySize * 2;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvasSize;
    const h = canvasSize;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(0, 0, w, h);

    const R = w * 0.28;
    const r = w * 0.11;
    const speed = hoveredRef.current ? 0.06 : 0.025;

    const uStep = 0.25;
    const vStep = 0.25;

    for (let u = 0; u < Math.PI * 2; u += uStep) {
      for (let v = 0; v < Math.PI * 2; v += vStep) {
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);

        const rotY = y * Math.cos(timeRef.current) - z * Math.sin(timeRef.current);
        const rotZ = y * Math.sin(timeRef.current) + z * Math.cos(timeRef.current);

        const scale = (w * 0.6) / (w * 0.6 + rotZ);
        const projX = cx + x * scale;
        const projY = cy + rotY * scale;

        const depth = (rotZ + r) / (2 * r);
        const alpha = 0.15 + depth * 0.7;

        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(0.8, 1.2 * scale), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 126, 32, ${alpha})`;
        ctx.fill();
      }
    }

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    gradient.addColorStop(0.4, 'rgba(243, 126, 32, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const dotAlpha = 0.3 + Math.sin(timeRef.current * 3) * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 200, 140, ${dotAlpha})`;
    ctx.fill();

    timeRef.current += speed;
    animationRef.current = requestAnimationFrame(draw);
  }, [canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
      }
    }

    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      data-testid={testId}
      className={`rounded-lg ${className}`}
      style={{
        width: displaySize,
        height: displaySize,
        cursor: 'pointer',
        filter: 'drop-shadow(0 0 6px rgba(243, 126, 32, 0.25))',
      }}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
    />
  );
}

export default TorusLogo;
