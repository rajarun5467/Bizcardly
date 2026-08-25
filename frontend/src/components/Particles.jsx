import { useEffect, useRef } from 'react';

/**
 * Lightweight canvas-based particle system.
 * Replicates the particles.js effect from the reference business card project.
 * Particles drift randomly, react to mouse hover (gentle attraction),
 * and cluster toward click points briefly.
 */
const Particles = ({ theme = 'dark' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, active: false });
  const clickRef = useRef({ x: null, y: null, time: 0 });
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
    // Update particle colors when theme changes
    const color = theme === 'dark' ? '#ffffff' : '#7C3AED';
    const opacity = theme === 'dark' ? 0.5 : 0.35;
    particlesRef.current.forEach(p => {
      p.color = color;
      p.opacity = opacity;
    });
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const PARTICLE_COUNT = 160;
    const HOVER_RADIUS = 120;
    const HOVER_STRENGTH = 0.03;
    const CLICK_RADIUS = 150;
    const CLICK_STRENGTH = 0.08;
    const CLICK_DURATION = 500;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const color = themeRef.current === 'dark' ? '#ffffff' : '#7C3AED';
      const baseOpacity = themeRef.current === 'dark' ? 0.5 : 0.35;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 3 + 1,
          color: color,
          opacity: Math.max(0.2, Math.random() * baseOpacity),
          baseOpacity: baseOpacity,
        });
      }
    };
    initParticles();

    // Mouse tracking
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    const handleClick = (e) => {
      clickRef.current.x = e.clientX;
      clickRef.current.y = e.clientY;
      clickRef.current.time = performance.now();
    };
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length) {
        clickRef.current.x = e.touches[0].clientX;
        clickRef.current.y = e.touches[0].clientY;
        clickRef.current.time = performance.now();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', handleClick);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();
      const clickActive = clickRef.current.x !== null && (now - clickRef.current.time) < CLICK_DURATION;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active && mx !== null;

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];

        // Base movement
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse hover attraction
        if (mouseActive) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < HOVER_RADIUS) {
            p.x += dx * HOVER_STRENGTH;
            p.y += dy * HOVER_STRENGTH;
          }
        }

        // Click attraction
        if (clickActive) {
          const cdx = clickRef.current.x - p.x;
          const cdy = clickRef.current.y - p.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist > 0 && cdist < CLICK_RADIUS) {
            p.x += cdx * CLICK_STRENGTH;
            p.y += cdy * CLICK_STRENGTH;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleTouchStart);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
};

export default Particles;
