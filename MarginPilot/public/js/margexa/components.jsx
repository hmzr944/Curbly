/* Margexa v3 — Base UI atoms
   Cold precision · Stripe density philosophy
   DESIGN_VARIANCE 5 / MOTION_INTENSITY 3 / VISUAL_DENSITY 8
   All component names preserved for backward compat.
*/

const { useEffect, useRef, useState, useCallback } = React;

// ─── Button
// primary   → accent fill (new: blue, not black)
// secondary → transparent, border line-2
// ghost     → transparent, no border
// accent    → accent fill (alias for primary)
function Button({
  children, variant = 'primary', size = 'md',
  icon, iconRight, onClick, href, disabled, loading,
  style = {}, ...rest
}) {
  const s = {
    sm: { padding: '0 12px', fontSize: 12, height: 30, gap: 6, borderRadius: 'var(--r-sm)' },
    md: { padding: '0 14px', fontSize: 13, height: 34, gap: 7, borderRadius: 'var(--r-sm)' },
    lg: { padding: '0 20px', fontSize: 14, height: 42, gap: 8, borderRadius: 'var(--r-sm)' },
  }[size] || {};

  const v = {
    primary:   { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
    accent:    { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
    secondary: { background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line-2)' },
    ghost:     { background: 'transparent', color: 'var(--ink-3)', border: '1px solid transparent' },
    danger:    { background: 'var(--danger)', color: '#fff', border: '1px solid var(--danger)' },
  }[variant] || {};

  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: s.gap, height: s.height, padding: s.padding, fontSize: s.fontSize,
    fontWeight: 500, letterSpacing: '-0.005em', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: s.borderRadius, textDecoration: 'none', whiteSpace: 'nowrap',
    fontFamily: 'var(--font-sans)',
    transition: `background var(--dur-micro) var(--ease), border-color var(--dur-micro) var(--ease), color var(--dur-micro) var(--ease)`,
    opacity: disabled ? 0.4 : 1,
    ...v, ...style,
  };

  const hoverMap = {
    primary:   { background: 'var(--accent-hover)', borderColor: 'var(--accent-hover)' },
    accent:    { background: 'var(--accent-hover)', borderColor: 'var(--accent-hover)' },
    secondary: { borderColor: 'var(--line-3)', background: 'var(--surface-2)' },
    ghost:     { background: 'var(--surface-2)', color: 'var(--ink)' },
    danger:    { background: '#B91C1C', borderColor: '#B91C1C' },
  };

  const props = {
    onClick: disabled || loading ? undefined : onClick,
    style: baseStyle,
    onMouseEnter: disabled ? undefined : (e) => {
      const h = hoverMap[variant] || {};
      Object.keys(h).forEach((k) => (e.currentTarget.style[k] = h[k]));
    },
    onMouseLeave: disabled ? undefined : (e) => {
      Object.keys(v).forEach((k) => (e.currentTarget.style[k] = v[k]));
    },
    ...rest,
  };

  const content = (
    <>
      {loading && (
        <span style={{
          width: 12, height: 12, borderRadius: 6,
          border: '1.5px solid currentColor', borderTopColor: 'transparent',
          display: 'inline-block', flexShrink: 0,
          animation: 'btnSpin 600ms linear infinite',
        }} />
      )}
      {!loading && icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      <span style={{ opacity: loading ? 0.5 : 1 }}>{children}</span>
      {!loading && iconRight && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{iconRight}</span>}
    </>
  );

  return href
    ? <a href={href} {...props}>{content}</a>
    : <button {...props}>{content}</button>;
}

// ─── Badge
// Font Geist Mono mandatory — badges carry data
function Badge({ children, tone = 'neutral', dot, style = {} }) {
  const tones = {
    accent:   { bg: 'var(--accent-tint)',   color: 'var(--accent)',   border: 'var(--accent-soft)' },
    success:  { bg: 'var(--success-tint)',  color: 'var(--success)',  border: 'rgba(5,150,105,.2)' },
    warning:  { bg: 'var(--warning-tint)',  color: 'var(--warning)',  border: 'rgba(217,119,6,.2)' },
    danger:   { bg: 'var(--danger-tint)',   color: 'var(--danger)',   border: 'rgba(220,38,38,.2)' },
    outline:  { bg: 'transparent',          color: 'var(--ink-3)',    border: 'var(--line-2)' },
    neutral:  { bg: 'var(--surface-2)',     color: 'var(--ink-3)',    border: 'var(--line)' },
  };
  const t = tones[tone] || tones.neutral;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 'var(--r-pill)',
      background: t.bg, color: t.color, border: `1px solid ${t.border}`,
      fontFamily: 'var(--font-mono)', fontSize: 10.5,
      fontWeight: 500, letterSpacing: '.04em', whiteSpace: 'nowrap',
      ...style,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: 3, background: 'currentColor', flexShrink: 0 }} />}
      {children}
    </span>
  );
}

// ─── Spotlight
// Card with subtle hover border — prefer border over shadow
function Spotlight({ children, style = {}, accent }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hov ? 'var(--line-2)' : 'var(--line)'}`,
        borderRadius: 'var(--r-md)',
        transition: `border-color var(--dur-micro) var(--ease)`,
        position: 'relative', overflow: 'hidden',
        ...style,
      }}>
      {accent && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent }} />
      )}
      {children}
    </div>
  );
}

// ─── SectionHead
function SectionHead({ title, sub, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{title}</div>
        {sub && (
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{sub}</div>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── PulseDot
function PulseDot({ color = 'var(--success)', size = 6 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color,
        opacity: 0.6, animation: 'pulse 2s cubic-bezier(0,0,.2,1) infinite',
      }} />
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, position: 'relative' }} />
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(2);opacity:0}}`}</style>
    </span>
  );
}

// ─── CountUp
function CountUp({ to = 0, duration = 1200, decimals = 0 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const run = (now) => {
      const pct = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - pct, 3);
      setVal(to * ease);
      if (pct < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);
  return <>{val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</>;
}

// ─── Spark (mini sparkline)
function Spark({ data = [], width = 120, height = 28, color = 'var(--accent)', fill }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * (height - 2) - 1,
  ]);
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      {fill && (
        <defs>
          <linearGradient id={`sg${color.replace(/[^a-z]/gi,'')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".14"/>
            <stop offset="1" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#sg${color.replace(/[^a-z]/gi,'')})`}/>}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Skeleton loader — replaces all spinners
function Skeleton({ width = '100%', height = 16, radius = 'var(--r-xs)', circle, style = {} }) {
  return (
    <div style={{
      width: circle ? height : width,
      height,
      borderRadius: circle ? '50%' : radius,
      background: 'var(--surface-2)',
      overflow: 'hidden',
      flexShrink: 0,
      ...style,
    }}>
      <div style={{
        width: '200%', height: '100%',
        background: `linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 50%, var(--surface-2) 100%)`,
        animation: 'skelShimmer 1.4s infinite linear',
      }} />
      <style>{`@keyframes skelShimmer{from{transform:translateX(-50%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}

// ─── Toast system
// Usage: window.MARGEXA_TOAST.show({ message, tone: 'success'|'danger'|'warning'|'neutral', duration: 4000 })
function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);

  useEffect(() => {
    const show = ({ message, tone = 'neutral', duration = 4000 }) => {
      const key = ++id.current;
      setToasts((prev) => [...prev.slice(-2), { key, message, tone }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.key !== key)), duration);
    };
    window.MARGEXA_TOAST = { show };
    return () => delete window.MARGEXA_TOAST;
  }, []);

  const dismiss = (key) => setToasts((prev) => prev.filter((t) => t.key !== key));

  const dotColor = {
    success: 'var(--success)', danger: 'var(--danger)',
    warning: 'var(--warning)', neutral: 'var(--ink-4)',
  };

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9000,
      display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div key={t.key} onClick={() => dismiss(t.key)} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', minWidth: 280, maxWidth: 400,
          background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-md)', boxShadow: 'var(--sh-2)',
          cursor: 'pointer', pointerEvents: 'auto',
          animation: 'toastIn var(--dur-standard) var(--ease) both',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: dotColor[t.tone], flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--ink)', flex: 1, lineHeight: 1.4 }}>{t.message}</span>
        </div>
      ))}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <style>{`@keyframes btnSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Modal
function Modal({ open, onClose, title, children, footer, width = 560 }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(15,17,23,.5)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn var(--dur-micro) var(--ease) both',
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: '92vw', maxHeight: '90vh',
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-3)',
          display: 'flex', flexDirection: 'column',
          animation: 'modalIn var(--dur-standard) var(--ease) both',
        }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--line)', flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{title}</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 'var(--r-sm)',
            border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-4)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background var(--dur-micro) var(--ease)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>{children}</div>
        {/* Footer */}
        {footer && (
          <div style={{
            padding: '14px 20px', borderTop: '1px solid var(--line)',
            display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes modalIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
      `}</style>
    </div>
  );
}

// ─── DataTable
// Enforces 44px row height, mono for numbers, proper column alignment
function DataTable({ columns = [], rows = [], loading, emptyIcon, emptyTitle = 'No data', emptyDesc }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            {columns.map((col, i) => (
              <th key={col.key || i} style={{
                padding: '8px 12px', textAlign: col.align || 'left',
                fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-4)',
                letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500,
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--line)', height: 44 }}>
              {columns.map((col, j) => (
                <td key={j} style={{ padding: '0 12px' }}>
                  <Skeleton width="70%" height={12} />
                </td>
              ))}
            </tr>
          ))}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: '40px 12px', textAlign: 'center' }}>
                {emptyIcon && (
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: 'var(--ink-4)' }}>
                    {emptyIcon}
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}>{emptyTitle}</div>
                {emptyDesc && <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>{emptyDesc}</div>}
              </td>
            </tr>
          )}
          {!loading && rows.map((row, i) => (
            <tr key={i} style={{
              borderBottom: i === rows.length - 1 ? 'none' : '1px solid var(--line)',
              minHeight: 44,
              transition: 'background var(--dur-micro) var(--ease)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              {columns.map((col, j) => (
                <td key={j} style={{
                  padding: '0 12px', height: 44, textAlign: col.align || 'left',
                  color: col.mono ? 'var(--ink-2)' : 'var(--ink)',
                  fontFamily: col.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                  fontVariantNumeric: col.mono ? 'tabular-nums' : undefined,
                  fontWeight: col.bold ? 500 : 400,
                  fontSize: col.mono ? 12 : 13,
                }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── KPI Strip — horizontal with dividers, Instrument Serif for values
function KPIStrip({ metrics = [], loading }) {
  return (
    <div style={{
      display: 'flex', background: 'var(--surface)',
      border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
      overflow: 'hidden',
    }}>
      {metrics.map((m, i) => (
        <div key={i} style={{
          flex: 1, padding: '20px 22px',
          borderLeft: i === 0 ? 'none' : '1px solid var(--line)',
          opacity: loading ? 0.35 : 1,
          transition: `opacity var(--dur-standard) var(--ease)`,
          position: 'relative',
        }}>
          {m.accent && !loading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: m.accent }} />
          )}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em',
            textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 12,
          }}>
            {m.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 36, letterSpacing: '-0.04em', lineHeight: 1,
            color: 'var(--ink)', marginBottom: 10,
          }}>
            {loading ? <span style={{ color: 'var(--ink-5)' }}>—</span> : m.value}
          </div>
          {m.delta != null && !loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: m.delta < 0 ? 'var(--success)' : m.deltaBad ? 'var(--danger)' : 'var(--ink-4)',
              }}>
                {m.delta > 0 ? '+' : ''}{m.delta}%
              </span>
              <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>vs prev</span>
            </div>
          )}
          {m.spark && !loading && (
            <div style={{ marginTop: 12 }}>
              <Spark data={m.spark} width={120} height={20} color={m.sparkColor || 'var(--accent)'} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Global styles injection
const _globalStyle = document.createElement('style');
_globalStyle.textContent = `
  @keyframes btnSpin  { to { transform: rotate(360deg); } }
  @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
  @keyframes toastIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes modalIn  { from { opacity: 0; transform: scale(.97); } to { opacity: 1; transform: scale(1); } }
  @keyframes rowIn    { from { opacity: 0; transform: translateY(-4px); background: var(--accent-tint); } to { opacity: 1; transform: translateY(0); background: transparent; } }
  @keyframes chartIn  { from { opacity: 0; } to { opacity: 1; } }
`;
document.head.appendChild(_globalStyle);

Object.assign(window, {
  Button, Badge, Spotlight, SectionHead, PulseDot,
  CountUp, Spark, Skeleton, ToastContainer, Modal,
  DataTable, KPIStrip,
});
