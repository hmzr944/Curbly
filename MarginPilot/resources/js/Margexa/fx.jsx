/* Margexa v2 — Effects & motion module
   Tasteful animation. Premium feel. Indigo-violet accent.
*/

const { useEffect, useRef, useState } = React;

// ── useMouse: track cursor inside element, return CSS vars on element
function useMouse(ref) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
      el.style.setProperty('--mxp', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--myp', `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    el.addEventListener('pointermove', onMove);
    return () => el.removeEventListener('pointermove', onMove);
  }, []);
}

// ── Animated mesh — subtle floating color blobs + film grain (light theme)
function AnimatedMesh({ palette = 'indigo', intensity = 0.6, children }) {
  const palettes = {
    indigo: ['#C7C5F3', '#E0DFFE', '#DDD6FE', '#EEEEFF'],
    rose:   ['#FBCFE8', '#FDE2E4', '#FFE4E6', '#FCE7F3'],
    mint:   ['#BBF7D0', '#D1FAE5', '#E0F2FE', '#E0FFFC'],
  };
  const colors = palettes[palette] || palettes.indigo;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <filter id="mesh-blur"><feGaussianBlur stdDeviation="60" /></filter>
      </svg>
      <div style={{ position: 'absolute', inset: '-25%', filter: 'url(#mesh-blur)', opacity: intensity }}>
        {colors.map((c, i) => (
          <div key={i} className={`mb mb-${i}`} style={{ background: c }} />
        ))}
      </div>
      {/* film grain */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.3, mixBlendMode: 'multiply',
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.06 0%22/></filter><rect width=%22180%22 height=%22180%22 filter=%22url(%23n)%22/></svg>")',
      }} />
      <style>{`
        .mb { position: absolute; border-radius: 50%; }
        .mb-0 { width: 60%; height: 65%; left: -10%; top: -15%; animation: meshA 26s ease-in-out infinite; }
        .mb-1 { width: 55%; height: 55%; right: -10%; top: 5%; animation: meshB 30s ease-in-out infinite; }
        .mb-2 { width: 50%; height: 55%; left: 20%; bottom: -20%; animation: meshC 34s ease-in-out infinite; }
        .mb-3 { width: 40%; height: 45%; right: 10%; bottom: 0%; animation: meshD 28s ease-in-out infinite; }
        @keyframes meshA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(8%,12%) scale(1.15)} }
        @keyframes meshB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-10%,8%) scale(1.1)} }
        @keyframes meshC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(6%,-10%) scale(1.2)} }
        @keyframes meshD { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-8%,-12%) scale(1.1)} }
      `}</style>
      {children}
    </div>
  );
}

// ── Hairline grid + cursor spotlight — interactive
function GridSpot({ children, accent = 'var(--accent)' }) {
  const ref = useRef();
  useMouse(ref);
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        opacity: .55,
        maskImage: 'radial-gradient(circle at var(--mxp, 50%) var(--myp, 50%), black 0%, transparent 50%)',
        WebkitMaskImage: 'radial-gradient(circle at var(--mxp, 50%) var(--myp, 50%), black 0%, transparent 50%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: .25,
        backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(400px circle at var(--mx, -9999px) var(--my, -9999px), ${accent}18, transparent 60%)`,
      }} />
      {children}
    </div>
  );
}

// ── Magnetic button — content lerps toward cursor
function Magnetic({ children, strength = 0.3 }) {
  const wrap = useRef();
  const inner = useRef();
  useEffect(() => {
    const w = wrap.current, ii = inner.current; if (!w || !ii) return;
    const onMove = (e) => {
      const r = w.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      ii.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => { ii.style.transform = 'translate(0,0)'; };
    w.addEventListener('pointermove', onMove);
    w.addEventListener('pointerleave', onLeave);
    return () => { w.removeEventListener('pointermove', onMove); w.removeEventListener('pointerleave', onLeave); };
  }, [strength]);
  return (
    <span ref={wrap} style={{ display: 'inline-block' }}>
      <span ref={inner} style={{ display: 'inline-block', transition: 'transform .4s cubic-bezier(.3,1.5,.5,1)' }}>
        {children}
      </span>
    </span>
  );
}

// ── Spotlight card — cursor-aware border + soft inner glow
function Spotlight({ children, accent = 'var(--accent)', style = {} }) {
  const ref = useRef();
  useMouse(ref);
  return (
    <div ref={ref} style={{
      position: 'relative',
      background: `radial-gradient(280px circle at var(--mx, -9999px) var(--my, -9999px), ${accent}22, transparent 60%) padding-box,
                   linear-gradient(var(--line), var(--line)) border-box`,
      border: '1px solid transparent',
      borderRadius: 'var(--r-lg)',
      ...style,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = `radial-gradient(280px circle at var(--mx, -9999px) var(--my, -9999px), ${accent}22, transparent 60%) padding-box,
                                          radial-gradient(400px circle at var(--mx, -9999px) var(--my, -9999px), ${accent}, var(--line)) border-box`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = `radial-gradient(280px circle at var(--mx, -9999px) var(--my, -9999px), ${accent}22, transparent 60%) padding-box,
                                          linear-gradient(var(--line), var(--line)) border-box`;
    }}>
      <div style={{
        position: 'relative', background: 'var(--surface)', borderRadius: 'calc(var(--r-lg) - 1px)',
        height: '100%', overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Flowing connection — SVG path + travelling dot
function Flow({ from, to, color = 'var(--accent)', duration = 2.4, delay = 0, curve = 30 }) {
  // from/to in viewport %
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + curve };
  const d = `M${from.x},${from.y} Q${mid.x},${mid.y} ${to.x},${to.y}`;
  const id = `flow-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeOpacity=".2" strokeWidth="1" strokeDasharray="2 3" />
      <circle r="3" fill={color}>
        <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} path={d} />
        <animate attributeName="opacity" values="0;1;1;0" dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} />
      </circle>
    </g>
  );
}

// ── LiveDigit — number that bumps periodically (live feel)
function LiveDigit({ base, jitter = 12, interval = 2200, prefix = '', suffix = '', decimals = 0 }) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      const dx = (Math.random() - 0.45) * jitter;
      setV((cur) => Math.max(0, cur + dx));
    }, interval);
    return () => clearInterval(id);
  }, [jitter, interval]);
  return <span className="tnum">{prefix}{v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

// ── PulseDot — animated status dot
function PulseDot({ color = 'var(--success)', size = 8 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'pulseRing 1.8s ease-out infinite' }} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
      <style>{`@keyframes pulseRing { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(3);opacity:0} }`}</style>
    </span>
  );
}

// ── Stagger — children fade up sequentially when visible
function Stagger({ children, gap = 80 }) {
  const ref = useRef();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const arr = React.Children.toArray(children);
  return (
    <div ref={ref}>
      {arr.map((child, i) => (
        <div key={i} style={{
          opacity: seen ? 1 : 0,
          transform: seen ? 'translateY(0)' : 'translateY(14px)',
          transition: `opacity .7s ${i * gap}ms var(--ease-out), transform .7s ${i * gap}ms var(--ease-out)`,
        }}>{child}</div>
      ))}
    </div>
  );
}

// ── Typewriter — caret + reveal char by char
function Typewriter({ text, speed = 28, delay = 0 }) {
  const [i, setI] = useState(0);
  const [start, setStart] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStart(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!start || i >= text.length) return;
    const t = setTimeout(() => setI((x) => x + 1), speed);
    return () => clearTimeout(t);
  }, [start, i, text, speed]);
  return (
    <span>{text.slice(0, i)}<span style={{ opacity: i < text.length ? 1 : 0, animation: 'caret 1s steps(2) infinite' }}>▎</span>
    <style>{`@keyframes caret { 50%{opacity:0} }`}</style>
    </span>
  );
}

// ── ParticleNet — light cursor-reactive dot network (canvas)
function ParticleNet({ density = 50, color = '#5B5BD6' }) {
  const ref = useRef();
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, parts = [], mouse = { x: -9999, y: -9999 };
    const resize = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const init = () => {
      parts = Array.from({ length: density }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4,
      }));
    };
    resize(); init();
    const ro = new ResizeObserver(() => { resize(); init(); }); ro.observe(cv);
    const onMove = (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerleave', onLeave);
    let raf;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const md = Math.hypot(dx, dy);
        if (md < 100) { p.x += dx / md * 0.5; p.y += dy / md * 0.5; }
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const dd = Math.hypot(p.x - q.x, p.y - q.y);
          if (dd < 90) {
            ctx.strokeStyle = `rgba(91,91,214,${(1 - dd / 90) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = color;
      for (const p of parts) { ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave); };
  }, [density, color]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'auto' }} />;
}

// Spotlight et PulseDot sont définis dans components.jsx (chargé avant) — ne pas ré-exporter ici
Object.assign(window, { useMouse, AnimatedMesh, GridSpot, Magnetic, Flow, LiveDigit, Stagger, Typewriter, ParticleNet });
