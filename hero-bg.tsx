// @ts-nocheck
/* TSX-driven animated aurora waves background for hero section */

const { useRef, useEffect, useMemo } = React;

const AuroraWaves: React.FC = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  // Static per-session palette for subtle variety
  const palette = useMemo(() => {
    const base = Math.random() * 60 + 180; // 180-240
    return [
      { hue: base, sat: 95, light: 65, alpha: 0.55, speed: 0.12, amp: 0.10, freq: 1.6 },
      { hue: base + 40, sat: 95, light: 60, alpha: 0.45, speed: 0.10, amp: 0.12, freq: 1.2 },
      { hue: base + 80, sat: 95, light: 58, alpha: 0.35, speed: 0.08, amp: 0.14, freq: 0.9 },
      { hue: base + 120, sat: 90, light: 55, alpha: 0.28, speed: 0.06, amp: 0.16, freq: 0.7 }
    ];
  }, []);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0, raf = 0;

    function resize(){
      const parent = canvas.parentElement!;
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, rect.width | 0);
      h = Math.max(1, rect.height | 0);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    let t = 0;
    function waveY(x: number, layerIdx: number, time: number){
      const p = palette[layerIdx % palette.length];
      const baseY = h * (0.35 + layerIdx * 0.12);
      const amp = h * p.amp;
      const y = baseY
        + Math.sin(x * p.freq * 0.004 + time * p.speed * 2.2 + layerIdx) * amp
        + Math.sin(x * (p.freq * 0.002) + time * p.speed * 1.1 + layerIdx * 2.1) * amp * 0.45;
      return y;
    }

    function step(){
      t += 1; // frame counter
      ctx.clearRect(0, 0, w, h);

      // Background gradient sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, 'rgba(0, 8, 20, 0.6)');
      sky.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Vignette for depth
      const vg = ctx.createRadialGradient(w * .5, h * .6, 0, w * .5, h * .6, Math.max(w, h) * .8);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';

      // Draw layered aurora ribbons
      for (let i = 0; i < palette.length; i++) {
        const p = palette[i];
        const grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, `hsla(${p.hue % 360}, ${p.sat}%, ${p.light}%, 0)`);
        grd.addColorStop(0.5, `hsla(${p.hue % 360}, ${p.sat}%, ${p.light}%, ${p.alpha})`);
        grd.addColorStop(1, `hsla(${(p.hue + 60) % 360}, ${p.sat}%, ${Math.max(40, p.light - 10)}%, 0)`);

        ctx.beginPath();
        ctx.moveTo(0, waveY(0, i, t * 0.01));
        const stepX = Math.max(8, w / 60);
        for (let x = stepX; x <= w + stepX; x += stepX) {
          const y = waveY(x, i, t * 0.01);
          const cx = x - stepX / 2;
          const cy = waveY(x - stepX / 2, i, t * 0.01);
          ctx.quadraticCurveTo(cx, cy, x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = grd;
        ctx.fill();

        // soft glow line along crest
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = `hsla(${(p.hue + 20) % 360}, ${p.sat}%, 70%, ${p.alpha * 0.6})`;
        ctx.beginPath();
        ctx.moveTo(0, waveY(0, i, t * 0.01) - 1.5);
        for (let x = stepX; x <= w + stepX; x += stepX) {
          const y = waveY(x, i, t * 0.01) - 1.5;
          const cx = x - stepX / 2;
          const cy = waveY(x - stepX / 2, i, t * 0.01) - 1.5;
          ctx.quadraticCurveTo(cx, cy, x, y);
        }
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [dpr, palette]);

  return <canvas ref={ref} role="img" aria-label="Animated aurora waves background" />;
};

(function mount(){
  const mountEl = document.getElementById('hero-tsx-mount');
  if (mountEl) {
    ReactDOM.createRoot(mountEl).render(<AuroraWaves />);
  }
})();
