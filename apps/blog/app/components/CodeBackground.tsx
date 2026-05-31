'use client';

import { useEffect, useRef } from 'react';

export interface FloatingItem {
  text?: string;
  content?: { text: string; font?: string; color?: string }[];
  color?: string;
  font?: string;
  hasBackground?: boolean;
}

interface CodeBackgroundProps {
  items?: FloatingItem[];
  className?: string;
}

const DEFAULT_ITEMS: FloatingItem[] = [
  {
    text: 'function contribute() {\n  const impact = await fork()\n  return impact.merge()\n}',
    color: '#3178C6',
  },
  {
    text: 'fn build_community() {\n  let members = gather();\n  members.empower()\n}',
    color: '#DEA584',
  },
  {
    text: 'func LearnAndGrow() {\n  skills := Practice()\n  return skills.Apply()\n}',
    color: '#00ADD8',
  },
  {
    text: 'def collaborate():\n  knowledge = learn()\n  return knowledge.share()',
    color: '#3776AB',
  },
];

export default function CodeBackground({ items = DEFAULT_ITEMS, className }: CodeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const activeItems = items.map((item) => ({
      ...item,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.3 + Math.random() * 0.4,
      opacity: 0.6 + Math.random() * 0.3,
    }));

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const item of activeItems) {
        ctx.save();
        ctx.globalAlpha = item.opacity;

        const lines = item.content
          ? item.content
          : (item.text?.split('\n').map((t) => ({ text: t, font: undefined, color: undefined })) ??
            []);

        if (lines.length === 0) {
          ctx.restore();
          continue;
        }

        const lineHeight = 20;
        const padding = 16;

        if (item.hasBackground) {
          let maxWidth = 0;
          for (const line of lines) {
            ctx.font = line.font || item.font || '14px "Courier New", monospace';
            const w = ctx.measureText(line.text).width;
            if (w > maxWidth) maxWidth = w;
          }
          const totalHeight = lines.length * lineHeight;
          ctx.beginPath();
          ctx.roundRect(
            item.x - padding,
            item.y - padding,
            maxWidth + padding * 2,
            totalHeight + padding * 2,
            8
          );
          ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.stroke();
        }

        lines.forEach((line, i) => {
          ctx.fillStyle = line.color || item.color || '#fff';
          ctx.font = line.font || item.font || '14px "Courier New", monospace';
          ctx.fillText(line.text, item.x, item.y + i * lineHeight + 6);
        });

        ctx.restore();

        item.y += item.speed;
        if (item.y > canvas.height + 100) {
          item.y = -100;
          item.x = Math.random() * canvas.width;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [items]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className ?? 'opacity-60'}`}
      style={{ zIndex: 0 }}
    />
  );
}
