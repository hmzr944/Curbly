/* Margexa v2 — Auth pages
   Login · Register · Magic link · Forgot password · 2FA · Invitation
   Split layout: brand panel left + form right · serif headlines
*/

const { useEffect, useRef, useState } = React;

// ─── Brand panel (left) — used by all auth pages
function BrandPanel({ children }) {
  return (
    <aside style={{
      position: 'relative', overflow: 'hidden',
      background: 'var(--ink)', color: '#fff',
      display: 'flex', flexDirection: 'column',
      padding: '40px 48px',
    }}>
      {/* animated mesh on dark */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
          <filter id="ap-blur"><feGaussianBlur stdDeviation="80" /></filter>
        </svg>
        <div style={{ position: 'absolute', inset: '-30%', filter: 'url(#ap-blur)', opacity: .9 }}>
          <span style={{ position: 'absolute', width: '60%', height: '60%', left: '-10%', top: '-15%', borderRadius: '50%', background: 'rgba(91,91,214,.5)', animation: 'apA 26s ease-in-out infinite' }} />
          <span style={{ position: 'absolute', width: '55%', height: '60%', right: '-10%', bottom: '-10%', borderRadius: '50%', background: 'rgba(139,92,246,.35)', animation: 'apB 32s ease-in-out infinite' }} />
          <span style={{ position: 'absolute', width: '40%', height: '50%', left: '30%', bottom: '10%', borderRadius: '50%', background: 'rgba(14,159,110,.18)', animation: 'apC 28s ease-in-out infinite' }} />
        </div>
        <div style={{
          position: 'absolute', inset: 0, opacity: .12,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 70%)',
        }} />
      </div>

      {/* Top: logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em' }}>Margexa</span>
      </div>

      {/* Middle: headline & quote */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1, maxWidth: 460 }}>
        {children || (
          <>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 4vw, 56px)',
              fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.02em', margin: 0, color: '#fff',
            }}>
              The control plane<br />
              for your company's<br />
              <em style={{ color: 'var(--accent-soft)' }}>AI spend.</em>
            </h1>
            <p style={{ marginTop: 28, fontSize: 15, color: 'rgba(255,255,255,.65)', lineHeight: 1.55, maxWidth: 380 }}>
              Route, govern and observe every LLM call across your stack. Cut model cost by 30–60% without rewriting a line.
            </p>

            <div style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,.1)' }}>
              <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic', lineHeight: 1.4, color: '#fff', margin: 0, fontWeight: 400 }}>
                "Margexa paid for itself in week two. We found a $14k/month leak we didn't know we had."
              </blockquote>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: 14, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)' }} />
                <div>
                  <div style={{ fontSize: 12.5, color: '#fff', fontWeight: 500 }}>Mara Halvorsen</div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,.5)' }}>VP Engineering · Lattice AI</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom: stats strip */}
      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', justifyContent: 'space-between',
        paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.08)',
      }}>
        {[
          { v: '38%', l: 'avg savings' },
          { v: '99.99%', l: 'uptime SLA' },
          { v: '2.8ms', l: 'p50 latency' },
        ].map((s, i) => (
          <div key={i}>
            <div className="tnum" style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#fff' }}>{s.v}</div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes apA { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(10%,8%) scale(1.15)} }
        @keyframes apB { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-8%,-10%) scale(1.1)} }
        @keyframes apC { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(6%,-5%) scale(1.2)} }
      `}</style>
    </aside>
  );
}

// ─── Form field
function Field({ label, type = 'text', placeholder, hint, rightAction, value, onChange, autoFocus, name }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>{label}</label>
        {rightAction}
      </div>
      <input
        type={type} name={name} placeholder={placeholder}
        value={value} onChange={onChange} autoFocus={autoFocus}
        style={{
          padding: '10px 12px', border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-md)', background: 'var(--surface)',
          fontSize: 14, color: 'var(--ink)', outline: 'none',
          transition: 'border-color .15s, box-shadow .15s',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-tint)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--line-2)'; e.target.style.boxShadow = 'none'; }} />
      {hint && <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{hint}</div>}
    </div>
  );
}

// ─── Social row
function SocialRow() {
  const providers = [
    { n: 'Google', svg: <svg width="14" height="14" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.69-3.88 2.69-6.62z" fill="#4285F4"/><path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z" fill="#34A853"/><path d="M3.97 10.71a5.41 5.41 0 010-3.42V4.96H.96a9 9 0 000 8.08l3.01-2.33z" fill="#FBBC05"/><path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 00.96 4.96l3.01 2.33C4.68 5.18 6.66 3.58 9 3.58z" fill="#EA4335"/></svg> },
    { n: 'GitHub', svg: <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 1.5C6 1.5 1.5 6 1.5 12c0 4.5 3 8.4 7.2 9.7.5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.2-1.5-1.2-1.5-.9-.7.1-.7.1-.7 1.1.1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3.1.9.1-.7.4-1.1.6-1.4-2.3-.3-4.8-1.2-4.8-5.2 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1.8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.7 1.1 2.9 0 4-2.5 4.9-4.8 5.2.4.3.7 1 .7 1.9v2.9c0 .3.2.6.7.5 4.2-1.4 7.2-5.3 7.2-9.7 0-6-4.5-10.5-10.5-10.5z" fill="currentColor"/></svg> },
    { n: 'SSO · SAML' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {providers.map((p, i) => (
        <button key={i} style={{
          padding: '9px 10px', background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-md)', cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          transition: 'border-color .15s, background .15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--line-3)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.background = 'var(--surface)'; }}>
          {p.svg}
          <span>{p.n}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Common form chrome (centered card)
function FormShell({ title, sub, children, footer, narrow = false, animate = true }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: narrow ? 380 : 440, animation: animate ? 'authIn .5s var(--ease-out) both' : 'none' }}>
        <h2 className="h-display" style={{ fontSize: 'clamp(36px, 4vw, 48px)', color: 'var(--ink)', margin: 0, lineHeight: 1.04 }}>
          {title}
        </h2>
        {sub && <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 12, marginBottom: 0 }}>{sub}</p>}
        <div style={{ marginTop: 32 }}>{children}</div>
        {footer && <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)', textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>{footer}</div>}
      </div>
      <style>{`@keyframes authIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

// ─── 1. LOGIN
function Login({ go }) {
  return (
    <FormShell
      title={<>Welcome <em className="serif" style={{ color: 'var(--accent)' }}>back.</em></>}
      sub="Sign in to your Margexa workspace."
      footer={<span>No account? <a href="#" onClick={(e) => { e.preventDefault(); go('register'); }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Create one →</a></span>}>
      <SocialRow />
      <Divider>or with email</Divider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email" type="email" placeholder="you@company.com" autoFocus />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          rightAction={<a href="#" onClick={(e) => { e.preventDefault(); go('forgot'); }} style={{ fontSize: 12, color: 'var(--ink-4)', textDecoration: 'none' }}>Forgot?</a>} />
        <Button variant="primary" size="md" style={{ marginTop: 6 }} onClick={() => go('twofa')}>Sign in</Button>
        <button onClick={() => go('magic')} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'center',
          color: 'var(--ink-3)', fontSize: 13, padding: '6px 0', textDecoration: 'underline', textUnderlineOffset: 3,
        }}>Email me a magic link instead</button>
      </div>
    </FormShell>
  );
}

// ─── 2. REGISTER
function Register({ go }) {
  return (
    <FormShell
      title={<>Start using <em className="serif" style={{ color: 'var(--accent)' }}>Margexa.</em></>}
      sub="14 days free. No credit card. Cancel anytime."
      footer={<span>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); go('login'); }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in →</a></span>}>
      <SocialRow />
      <Divider>or with email</Divider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="First name" placeholder="Jamie" autoFocus />
          <Field label="Last name" placeholder="Doe" />
        </div>
        <Field label="Work email" type="email" placeholder="you@company.com" hint="Use your work email — no Gmail/Yahoo." />
        <Field label="Password" type="password" placeholder="At least 12 characters" />
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'var(--ink-3)', cursor: 'pointer', lineHeight: 1.5 }}>
          <input type="checkbox" style={{ marginTop: 3, accentColor: 'var(--accent)' }} defaultChecked />
          I agree to the <a href="#" style={{ color: 'var(--accent)' }}>Terms</a> and <a href="#" style={{ color: 'var(--accent)' }}>Privacy</a> policy. I'm at least 16 years old.
        </label>
        <Button variant="primary" size="md" style={{ marginTop: 6 }} onClick={() => go('onboarding')}>Create account</Button>
      </div>
    </FormShell>
  );
}

// ─── 3. MAGIC LINK SENT
function MagicSent({ go }) {
  return (
    <FormShell
      title={<>Check your <em className="serif" style={{ color: 'var(--accent)' }}>inbox.</em></>}
      sub={<>We sent a one-time link to <span className="mono" style={{ color: 'var(--ink)', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>jamie@acme.com</span>. It expires in 10 minutes.</>}
      footer={<span>Wrong email? <a href="#" onClick={(e) => { e.preventDefault(); go('login'); }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Try again</a></span>}>
      <div style={{
        border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: 24,
        background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        {/* Envelope visual */}
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: 'var(--accent-tint)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
          position: 'relative',
        }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="3" y="6" width="22" height="16" rx="3" stroke="var(--accent)" strokeWidth="1.6"/>
            <path d="M3 8l11 8 11-8" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ position: 'absolute', top: -4, right: -4 }}><PulseDot color="var(--success)" size={10} /></span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          Click the link in the email to sign in.<br />
          <span style={{ color: 'var(--ink-4)' }}>You can close this tab.</span>
        </div>
      </div>
      <button style={{
        marginTop: 16, width: '100%', background: 'transparent', border: '1px solid var(--line-2)',
        borderRadius: 'var(--r-md)', padding: '10px 14px', cursor: 'pointer',
        fontSize: 13, color: 'var(--ink-2)',
      }}>Resend in 32s</button>
    </FormShell>
  );
}

// ─── 4. FORGOT
function Forgot({ go }) {
  return (
    <FormShell
      title={<>Reset your <em className="serif" style={{ color: 'var(--accent)' }}>password.</em></>}
      sub="We'll email you a link to set a new one."
      footer={<a href="#" onClick={(e) => { e.preventDefault(); go('login'); }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>← Back to sign in</a>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email" type="email" placeholder="you@company.com" autoFocus />
        <Button variant="primary" size="md" onClick={() => go('magic')}>Send reset link</Button>
      </div>
    </FormShell>
  );
}

// ─── 5. 2FA
function TwoFA({ go }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const refs = useRef([]);
  const onChange = (i, v) => {
    const c = [...code];
    c[i] = v.slice(-1);
    setCode(c);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  return (
    <FormShell
      title={<>Two-factor <em className="serif" style={{ color: 'var(--accent)' }}>verification.</em></>}
      sub="Enter the 6-digit code from your authenticator app."
      footer={<a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Use a recovery code instead →</a>}
      narrow>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {code.map((v, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={v}
              onChange={(e) => onChange(i, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !v && i > 0) refs.current[i - 1]?.focus();
              }}
              maxLength={1}
              inputMode="numeric"
              autoFocus={i === 0}
              style={{
                width: 44, height: 56, textAlign: 'center', fontSize: 22,
                fontFamily: 'var(--font-mono)', fontWeight: 500,
                background: 'var(--surface)', border: '1px solid var(--line-2)',
                borderRadius: 'var(--r-md)', outline: 'none',
                color: 'var(--ink)', transition: 'all .15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-tint)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--line-2)'; e.target.style.boxShadow = 'none'; }}
            />
          ))}
        </div>
        <Button variant="primary" size="md" style={{ width: '100%' }} onClick={() => go('login')}>Verify and continue</Button>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '.05em' }}>
          Didn't get a code? <a href="#" style={{ color: 'var(--accent)' }}>Resend</a>
        </div>
      </div>
    </FormShell>
  );
}

// ─── 6. INVITATION
function Invite({ go }) {
  return (
    <FormShell
      title={<>Join the <em className="serif" style={{ color: 'var(--accent)' }}>Acme Inc.</em> workspace</>}
      sub={<>You've been invited by <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Mara Halvorsen</span> as <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Developer</span>.</>}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)',
        padding: 20, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
      }}>
        <span style={{ width: 44, height: 44, borderRadius: 11, background: 'linear-gradient(135deg, #5B5BD6, #8B5CF6)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>Acme Inc.</div>
          <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>14 members · Business plan · Production</div>
        </div>
        <Badge tone="accent" dot>Developer</Badge>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Your name" placeholder="Jamie Doe" autoFocus />
        <Field label="Password" type="password" placeholder="At least 12 characters" />
        <Button variant="primary" size="md" style={{ marginTop: 6 }} onClick={() => go('onboarding')}>Accept and continue</Button>
        <a href="#" style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}>Decline invitation</a>
      </div>
    </FormShell>
  );
}

function Divider({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '.05em', textTransform: 'uppercase' }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}

// ─── Root: view switcher + tiny demo toolbar
function AuthRoot() {
  const [view, setView] = useState('login');
  const views = {
    login: <Login go={setView} />,
    register: <Register go={setView} />,
    magic: <MagicSent go={setView} />,
    forgot: <Forgot go={setView} />,
    twofa: <TwoFA go={setView} />,
    invite: <Invite go={setView} />,
    onboarding: <Login go={setView} />, // placeholder
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', minHeight: '100vh' }}>
      <BrandPanel />
      <section style={{ position: 'relative', background: 'var(--bg)' }}>
        {views[view]}

        {/* Floating view switcher (demo only) */}
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 50,
          background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 10,
          padding: 6, display: 'flex', gap: 4, boxShadow: 'var(--sh-3)',
        }}>
          {[
            { id: 'login', l: 'Login' },
            { id: 'register', l: 'Register' },
            { id: 'magic', l: 'Magic' },
            { id: 'forgot', l: 'Forgot' },
            { id: 'twofa', l: '2FA' },
            { id: 'invite', l: 'Invite' },
          ].map((v) => (
            <button key={v.id} onClick={() => setView(v.id)} style={{
              padding: '5px 9px', fontSize: 11, fontWeight: 500,
              background: view === v.id ? 'var(--ink)' : 'transparent', color: view === v.id ? '#fff' : 'var(--ink-2)',
              border: 'none', borderRadius: 6, cursor: 'pointer',
            }}>{v.l}</button>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { AuthRoot });
