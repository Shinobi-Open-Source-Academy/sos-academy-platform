'use client';

import { useEffect, useRef } from 'react';

export interface FloatingItem {
  text?: string;
  content?: { text: string; font?: string; color?: string }[];
  color?: string;
  font?: string;
  hasBackground?: boolean;
}

const DEFAULT_SNIPPETS: FloatingItem[] = [
  {
    text: `function contribute() {
  const impact = await fork()
  return impact.merge()
}`,
    color: '#3178C6',
  },
  {
    text: `fn build_community() {
  let members = gather_ninjas();
  members.empower()
}`,
    color: '#DEA584',
  },
  {
    text: `func LearnAndGrow() {
  skills := Practice()
  return skills.Apply()
}`,
    color: '#00ADD8',
  },
  {
    text: `def collaborate():
  knowledge = learn()
  return knowledge.share()`,
    color: '#3776AB',
  },
];

interface CodeBackgroundProps {
  items?: FloatingItem[];
  className?: string;
}

export default function CodeBackground({
  items = DEFAULT_SNIPPETS,
  className,
}: CodeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

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

      activeItems.forEach((item) => {
        ctx.save();
        ctx.globalAlpha = item.opacity;

        // Determine content lines
        const lines = item.content
          ? item.content
          : item.text?.split('\n').map((t) => ({ text: t, font: undefined, color: undefined })) ||
            [];

        if (lines.length === 0) {
          ctx.restore();
          return;
        }

        const lineHeight = 20;
        const padding = 16;

        // Calculate dimensions if background is needed
        if (item.hasBackground) {
          let maxWidth = 0;
          lines.forEach((line) => {
            ctx.font = line.font || item.font || '14px "Courier New", monospace';
            const width = ctx.measureText(line.text).width;
            if (width > maxWidth) maxWidth = width;
          });

          const totalHeight = lines.length * lineHeight;

          // Draw Background
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

        // Draw Text
        lines.forEach((line, i) => {
          ctx.fillStyle = line.color || item.color || '#fff';
          ctx.font = line.font || item.font || '14px "Courier New", monospace';
          ctx.fillText(line.text, item.x, item.y + i * lineHeight + 6); // +6 adjustment for baseline
        });

        ctx.restore();

        item.y += item.speed;
        if (item.y > canvas.height + 100) {
          item.y = -100;
          item.x = Math.random() * canvas.width;
        }
      });

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
      className={`fixed inset-0 pointer-events-none ${className || 'opacity-60'}`}
      style={{ zIndex: 0 }}
    />
  );
}
