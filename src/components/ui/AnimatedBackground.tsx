import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface AnimatedBackgroundProps {
  variant?: 'particles' | 'grid' | 'aurora';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const COLORS = [
  'rgba(0, 240, 255, ',   // cyan
  'rgba(180, 142, 255, ', // lavender
  'rgba(255, 61, 113, ',  // coral
  'rgba(255, 170, 0, ',   // amber
];

export default function AnimatedBackground({
  variant = 'particles',
  intensity = 'medium',
  className = '',
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    const counts = { low: 30, medium: 55, high: 90 };
    const count = counts[intensity];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.4 + 0.1,
      decay: 0,
    });

    const init = () => {
      resize();
      particles = Array.from({ length: count }, createParticle);
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        // Subtle pulsing
        p.decay += 0.008;
        const pulse = Math.sin(p.decay) * 0.15 + 0.85;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (p.alpha * pulse) + ')';
        ctx.fill();
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(drawParticles);
    };

    const drawAurora = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const t = Date.now() * 0.0005;

      // Aurora bands
      const bands = [
        { color: 'rgba(0, 240, 255, 0.03)', offset: 0 },
        { color: 'rgba(180, 142, 255, 0.025)', offset: 2 },
        { color: 'rgba(255, 61, 113, 0.02)', offset: 4 },
      ];

      for (const band of bands) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 4) {
          const y = h * 0.3 +
            Math.sin(x * 0.003 + t + band.offset) * h * 0.15 +
            Math.sin(x * 0.007 + t * 1.5 + band.offset) * h * 0.08;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = band.color;
        ctx.fill();
      }

      animationId = requestAnimationFrame(drawAurora);
    };

    init();

    if (variant === 'aurora') {
      drawAurora();
    } else {
      drawParticles();
    }

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [variant, intensity]);

  if (variant === 'grid') {
    return (
      <div
        className={`absolute inset-0 bg-grid opacity-40 pointer-events-none ${className}`}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
