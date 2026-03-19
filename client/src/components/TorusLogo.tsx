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
    const speed = hoveredRef.current ? 0.06 : 0.025;

    ctx.fillStyle = 'rgba(15, 17, 24, 0.12)';
    ctx.fillRect(0, 0, w, h);

    const R = w * 0.28;
    const r = w * 0.11;
    const uStep = 0.25;
    const vStep = 0.25;
    const t = timeRef.current;

    for (let u = 0; u < Math.PI * 2; u += uStep) {
      for (let v = 0; v < Math.PI * 2; v += vStep) {
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);

        const rotY = y * Math.cos(t) - z * Math.sin(t);
        const rotZ = y * Math.sin(t) + z * Math.cos(t);

        const scale = (w * 0.6) / (w * 0.6 + rotZ);
        const projX = cx + x * scale;
        const projY = cy + rotY * scale;

        const depth = (rotZ + r) / (2 * r);
        let alpha = 0.15 + depth * 0.7;
        const pointSize = Math.max(0.8, 1.2 * scale);

        let cr, cg, cb;
        if (depth > 0.6) {
          const mix = (depth - 0.6) / 0.4;
          cr = 243 + (255 - 243) * mix;
          cg = 126 + (184 - 126) * mix;
          cb = 32 + (77 - 32) * mix;
        } else if (depth > 0.3) {
          const mix = (depth - 0.3) / 0.3;
          cr = 46 + (243 - 46) * mix;
          cg = 139 + (126 - 139) * mix;
          cb = 139 + (32 - 139) * mix;
        } else {
          const mix = depth / 0.3;
          cr = 123 + (46 - 123) * mix;
          cg = 107 + (139 - 107) * mix;
          cb = 141 + (139 - 141) * mix;
          alpha *= 0.7;
        }

        ctx.beginPath();
        ctx.arc(projX, projY, pointSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr|0},${cg|0},${cb|0},${Math.min(1, alpha)})`;
        ctx.fill();
      }
    }

    const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
    g1.addColorStop(0, 'rgba(255, 220, 180, 0.18)');
    g1.addColorStop(0.3, 'rgba(243, 126, 32, 0.08)');
    g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const dotAlpha = 0.4 + Math.sin(t * 3) * 0.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 220, 180, ${dotAlpha})`;
    ctx.fill();

    timeRef.current += speed;
    animationRef.current = requestAnimationFrame(draw);
  }, [canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0F1118';
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
