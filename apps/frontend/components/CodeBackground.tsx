'use client';

import { useEffect, useRef } from 'react';

const CODE_SNIPPETS = [
  {
    code: `function contribute() {
  const impact = await fork()
  return impact.merge()
}`,
    color: '#3178C6',
    lang: 'typescript',
  },
  {
    code: `fn build_community() {
  let members = gather_ninjas();
  members.empower()
}`,
    color: '#DEA584',
    lang: 'rust',
  },
  {
    code: `func LearnAndGrow() {
  skills := Practice()
  return skills.Apply()
}`,
    color: '#00ADD8',
    lang: 'go',
  },
  {
    code: `def collaborate():
  knowledge = learn()
  return knowledge.share()`,
    color: '#3776AB',
    lang: 'python',
  },
];

export default function CodeBackground() {
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

    const snippets = CODE_SNIPPETS.map((snippet) => ({
      ...snippet,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.2 + Math.random() * 0.3,
      opacity: 0.1 + Math.random() * 0.15,
    }));

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // biome-ignore lint/complexity/noForEach: <explanation>
      snippets.forEach((snippet) => {
        ctx.save();
        ctx.globalAlpha = snippet.opacity;
        ctx.fillStyle = snippet.color;
        ctx.font = '12px "Fira Code", monospace';

        const lines = snippet.code.split('\n');
        lines.forEach((line, i) => {
          ctx.fillText(line, snippet.x, snippet.y + i * 16);
        });

        ctx.restore();

        snippet.y += snippet.speed;
        if (snippet.y > canvas.height + 100) {
          snippet.y = -100;
          snippet.x = Math.random() * canvas.width;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
}
