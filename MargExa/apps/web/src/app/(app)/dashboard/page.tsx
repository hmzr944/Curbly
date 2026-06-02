'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Overview = {
  total_requests: number
  total_cost_usd: number
  avg_latency_ms: number
  error_rate: number
}
type SpendPoint = { date: string; cost: number }
type ProviderRow = { model: string; count: number; cost_usd: number }
type RequestRow = {
  id: string; created_at: string; model: string
  prompt_tokens: number | null; completion_tokens: number | null
  cost_usd: number | null; latency_ms: number | null; status: number | null
}

/* ─── useFetch ────────────────────────────────────────────────────────────── */
function useFetch<T>(url: string, intervalMs?: number) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch(url)
      if (res.ok) setData(await res.json())
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    load()
    if (!intervalMs) return
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [load, intervalMs])

  return { data, loading }
}

/* ─── Sparkline ──────────────────────────────────────────────────────────── */
function Spark({ data, width = 120, height = 30, color = 'var(--accent)', fill = false }: {
  data: number[]; width?: number; height?: number; color?: string; fill?: boolean
}) {
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - 2 - ((d - min) / (max - min || 1)) * (height - 4)
    return [x, y] as [number, number]
  })
  const d = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ')
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {fill && <path d={`${d} L${width},${height} L0,${height} Z`} fill={color} opacity=".1" />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/* ─── CountUp ────────────────────────────────────────────────────────────── */
function CountUp({ to, prefix = '', suffix = '', duration = 1200, decimals = 0 }: {
  to: number; prefix?: string; suffix?: string; duration?: number; decimals?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [v, setV] = useState(0)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el); return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!seen) return
    let raf: number, start: number
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setV(to * ease(p))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, duration])
  const fmt = v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return <span ref={ref} className="tnum">{prefix}{fmt}{suffix}</span>
}

/* ─── PulseDot ───────────────────────────────────────────────────────────── */
function PulseDot({ color = 'var(--success)', size = 8 }: { color?: string; size?: number }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'pulseRing 1.8s ease-out infinite' }} />
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
    </span>
  )
}

/* ─── Spotlight wrapper ──────────────────────────────────────────────────── */
function Spot({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])
  return <div ref={ref} className="spotlight" style={{ ...style }}>{children}</div>
}

/* ─── SectionHead ────────────────────────────────────────────────────────── */
function SH({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{title}</div>
        {sub && <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{sub}</div>}
      </div>
      {action}
    </div>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function Skel({ w = '100%', h = 16 }: { w?: string | number; h?: number }) {
  return <span style={{ display: 'block', width: w, height: h, borderRadius: 4, background: 'var(--surface-2)', animation: 'shimmer 1.4s linear infinite' }} />
}

/* ─── EmptyState ─────────────────────────────────────────────────────────── */
function Empty({ label }: { label: string }) {
  return (
    <div style={{ padding: '40px 24px', textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-5)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>No data yet</div>
      <div style={{ fontSize: 13, color: 'var(--ink-4)', lineHeight: 1.6 }}>{label}</div>
    </div>
  )
}

/* ─── KPI Strip ──────────────────────────────────────────────────────────── */
function DashKPIs() {
  const { data, loading } = useFetch<Overview>('/api/analytics/overview')

  const cards = data ? [
    {
      k: 'AI spend · 30d', v: data.total_cost_usd, prefix: '$', decimals: 2,
      color: 'var(--accent)',
    },
    {
      k: 'Requests · 30d', v: data.total_requests, prefix: '', decimals: 0,
      color: 'var(--ink)',
    },
    {
      k: 'Avg latency', v: data.avg_latency_ms, suffix: ' ms', decimals: 0,
      color: 'var(--success)',
    },
    {
      k: 'Error rate', v: data.error_rate, suffix: '%', decimals: 1,
      color: data.error_rate > 5 ? 'var(--danger)' : 'var(--success)',
    },
  ] : null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 12 }}>
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <Spot key={i}><div style={{ padding: 18 }}><Skel h={14} w="60%" /><div style={{ height: 8 }} /><Skel h={28} w="80%" /></div></Spot>
          ))
        : cards
          ? cards.map((c, i) => (
              <Spot key={i}>
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="eyebrow">{c.k}</span>
                  </div>
                  <div className="tnum" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
                    <CountUp to={c.v} decimals={c.decimals} prefix={c.prefix ?? ''} suffix={c.suffix ?? ''} />
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Spark data={[c.v * 0.4, c.v * 0.6, c.v * 0.5, c.v * 0.8, c.v * 0.7, c.v]} width={220} height={32} color={c.color} fill />
                  </div>
                </div>
              </Spot>
            ))
          : <Empty label="Send your first proxied request to see metrics here." />
      }
    </div>
  )
}

/* ─── Spend chart ────────────────────────────────────────────────────────── */
function SpendChart() {
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30')
  const { data, loading } = useFetch<SpendPoint[]>(`/api/analytics/spend-chart?days=${period}`, 60_000)

  const W = 1000, H = 240, P = 30
  const max = data && data.length ? Math.max(...data.map(d => d.cost), 0.01) : 1
  const xs = (i: number, len: number) => P + (i / (len - 1 || 1)) * (W - 2 * P)
  const ys = (v: number) => H - P - (v / max) * (H - 2 * P)
  const [hover, setHover] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current || !data?.length) return
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((x - P) / (W - 2 * P)) * (data.length - 1))
    if (i >= 0 && i < data.length) setHover(i)
  }

  const path = data && data.length > 1
    ? data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xs(i, data.length)},${ys(d.cost)}`).join(' ')
    : null
  const area = path && data ? `${path} L${xs(data.length - 1, data.length)},${H - P} L${P},${H - P} Z` : null
  const totalCost = data?.reduce((s, d) => s + d.cost, 0) ?? 0

  return (
    <Spot>
      <div style={{ padding: 22 }}>
        <SH
          title="AI spend"
          sub={`Last ${period} days`}
          action={
            <div style={{ display: 'flex', gap: 6 }}>
              {(['7', '30', '90'] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '5px 10px', fontSize: 11,
                  background: p === period ? 'var(--ink)' : 'var(--surface)',
                  color: p === period ? '#fff' : 'var(--ink-2)',
                  border: '1px solid', borderColor: p === period ? 'var(--ink)' : 'var(--line-2)',
                  borderRadius: 6, cursor: 'pointer', fontWeight: 500,
                }}>{p}d</button>
              ))}
            </div>
          }
        />
        {loading ? (
          <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skel w="100%" h={H} />
          </div>
        ) : !data || !data.length || totalCost === 0 ? (
          <Empty label="Spend data will appear once you route requests through Margexa." />
        ) : (
          <>
            <div style={{ display: 'flex', gap: 24, marginBottom: 14, fontSize: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 2, background: 'var(--accent)', borderRadius: 1 }} />
                <span style={{ color: 'var(--ink-2)' }}>Spend</span>
                <span className="mono tnum" style={{ color: 'var(--ink-4)' }}>${totalCost.toFixed(2)}</span>
              </span>
            </div>
            <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)} style={{ position: 'relative', cursor: 'crosshair' }}>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="sgrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#5B5BD6" stopOpacity=".22"/>
                    <stop offset="1" stopColor="#5B5BD6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((p) => (
                  <line key={p} x1={P} x2={W - P} y1={P + p * (H - 2 * P)} y2={P + p * (H - 2 * P)} stroke="var(--line)" strokeDasharray="2 4" />
                ))}
                {area && <path d={area} fill="url(#sgrad)" style={{ animation: 'chartIn 1s var(--ease-out) both' }} />}
                {path && <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.8" style={{ animation: 'chartIn 1.2s var(--ease-out) both' }} />}
                {hover != null && data && (
                  <g>
                    <line x1={xs(hover, data.length)} x2={xs(hover, data.length)} y1={P} y2={H - P} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 3" opacity=".4" />
                    <circle cx={xs(hover, data.length)} cy={ys(data[hover].cost)} r="5" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
                  </g>
                )}
              </svg>
              {hover != null && data && (
                <div style={{
                  position: 'absolute', left: `${(xs(hover, data.length) / W) * 100}%`, top: 8,
                  transform: 'translateX(-50%)', background: 'var(--ink)', color: '#fff',
                  borderRadius: 8, padding: '8px 12px', fontSize: 11,
                  fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', pointerEvents: 'none',
                  boxShadow: 'var(--sh-pop)',
                }}>
                  <div style={{ color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>{data[hover].date}</div>
                  <div>${data[hover].cost.toFixed(4)}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Spot>
  )
}

/* ─── Provider Mix ───────────────────────────────────────────────────────── */
function ProviderMix() {
  const { data: rows, loading } = useFetch<ProviderRow[]>('/api/analytics/providers')

  const COLORS = ['#5B5BD6', '#B97A0B', '#0E9F6E', '#8B5CF6', '#EC4899', '#64748B']
  const total = rows?.reduce((s, r) => s + r.cost_usd, 0) ?? 0
  const R = 60, IR = 40, C = 2 * Math.PI * R
  let offset = 0

  return (
    <Spot>
      <div style={{ padding: 22 }}>
        <SH title="Spend by model" sub="Last 30 days" />
        {loading ? (
          <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skel w={160} h={160} />
          </div>
        ) : !rows || rows.length === 0 ? (
          <Empty label="Route requests through Margexa to see model usage breakdown." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={R} fill="none" stroke="var(--surface-2)" strokeWidth={R - IR} />
                {rows.map((p, i) => {
                  const pct = total > 0 ? p.cost_usd / total : 0
                  const len = pct * C
                  const el = (
                    <circle key={i} cx="80" cy="80" r={R} fill="none" stroke={COLORS[i % COLORS.length]}
                      strokeWidth={R - IR} strokeDasharray={`${len} ${C}`} strokeDashoffset={-offset}
                      transform="rotate(-90 80 80)" />
                  )
                  offset += len
                  return el
                })}
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div className="tnum" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)' }}>${total.toFixed(2)}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.05em', textTransform: 'uppercase' }}>total spend</div>
              </div>
            </div>
            <div>
              {rows.map((p, i) => {
                const pct = total > 0 ? Math.round((p.cost_usd / total) * 100) : 0
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.model}</span>
                    <span className="mono tnum" style={{ fontSize: 12, color: 'var(--ink-3)', minWidth: 60, textAlign: 'right' }}>${p.cost_usd.toFixed(2)}</span>
                    <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-4)', minWidth: 36, textAlign: 'right' }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Spot>
  )
}

/* ─── Live Activity ──────────────────────────────────────────────────────── */
function LiveActivity() {
  const { data: rows, loading } = useFetch<RequestRow[]>('/api/analytics/live-requests', 5_000)

  function fmtTime(iso: string) {
    try { return new Date(iso).toLocaleTimeString('en-GB') } catch { return '—' }
  }

  return (
    <Spot>
      <div style={{ padding: 22 }}>
        <SH title="Live activity" sub="Last 20 requests" action={<Badge tone="success" dot>Live</Badge>} />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => <Skel key={i} h={20} />)}
          </div>
        ) : !rows || rows.length === 0 ? (
          <Empty label="Your proxied requests will stream in here in real time." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {rows.map((r, i) => {
              const ok = !r.status || r.status < 400
              return (
                <div key={r.id} style={{
                  display: 'grid', gridTemplateColumns: '76px 1fr 80px 70px',
                  gap: 12, alignItems: 'center',
                  padding: '8px 6px', borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  animation: i === 0 ? 'rowIn .35s var(--ease-out) both' : 'none',
                }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{fmtTime(r.created_at)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 3, background: ok ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />
                    <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.model}</span>
                  </span>
                  <span className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-3)', textAlign: 'right' }}>
                    {r.prompt_tokens != null ? `${(r.prompt_tokens + (r.completion_tokens ?? 0)).toLocaleString()} tok` : '—'}
                  </span>
                  <span className="mono tnum" style={{ fontSize: 11.5, color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>
                    {r.cost_usd != null ? `$${r.cost_usd.toFixed(4)}` : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Spot>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Header title="Dashboard" />

      <div style={{ padding: '24px 28px 80px' }}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.025em', margin: 0, color: 'var(--ink)' }}>Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>AI cost & usage · last 30 days</span>
              <Badge tone="outline">
                <PulseDot color="var(--success)" size={6} />
                <span style={{ marginLeft: 4 }}>Live</span>
              </Badge>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm">Export CSV</Button>
            <Button variant="default" size="sm">New policy</Button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="animate-fade-up delay-0">
          <DashKPIs />
        </div>

        <div style={{ height: 12 }} />

        {/* Spend chart */}
        <div className="animate-fade-up delay-50">
          <SpendChart />
        </div>

        <div style={{ height: 12 }} />

        {/* Provider mix + Live activity */}
        <div className="animate-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 12 }}>
          <ProviderMix />
          <LiveActivity />
        </div>
      </div>
    </div>
  )
}
