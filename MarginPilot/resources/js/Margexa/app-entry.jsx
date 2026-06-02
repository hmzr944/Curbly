/* Margexa v2 — App entry + context provider + page router */

// ─── Global context: window.MARGEXA exposed to all page components
const MargexaContext = React.createContext(window.MARGEXA || {});
window.MargexaContext = MargexaContext;

// ─── Page registry
const PAGE_META = {
  dashboard: { title: 'Dashboard',       page: 'DashboardPage'  },
  gateway:   { title: 'AI Gateway',      page: 'GatewayPage'    },
  policies:  { title: 'Policies',        page: 'PoliciesPage'   },
  prompts:   { title: 'Prompts',         page: 'PromptsPage'    },
  leaks:     { title: 'Leak detection',  page: 'LeaksPage'      },
  alerts:    { title: 'Alerts',          page: 'AlertsPage'     },
  analytics: { title: 'Analytics',       page: 'AnalyticsPage'  },
  docs:      { title: 'Docs',            page: 'DocsPage'       },
  team:      { title: 'Team',            page: 'TeamPage'       },
  billing:   { title: 'Billing',         page: null             },
  settings:  { title: 'Settings',        page: null             },
};

function PlaceholderPage({ title }) {
  return (
    <div style={{
      minHeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 20, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 32, background: 'var(--accent-tint)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent)',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6"/><path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
      </div>
      <div>
        <h2 className="h-display" style={{ fontSize: 36, color: 'var(--ink)', margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, maxWidth: 380 }}>
          This page is in the design queue — wired up next chunk.
        </p>
      </div>
    </div>
  );
}

function AppRoot() {
  const [active, setActive] = React.useState('dashboard');
  const meta    = PAGE_META[active] || PAGE_META.dashboard;
  const PageComp = meta.page && window[meta.page];

  // Dynamic breadcrumb from window.MARGEXA
  const orgName = window.MARGEXA?.organization?.name ?? 'Workspace';
  const breadcrumb = active === 'docs' ? ['Margexa'] : [orgName];

  return (
    <MargexaContext.Provider value={window.MARGEXA || {}}>
      <AppShell active={active} onChange={setActive} title={meta.title} breadcrumb={breadcrumb}>
        {PageComp ? <PageComp /> : <PlaceholderPage title={meta.title} />}
      </AppShell>
    </MargexaContext.Provider>
  );
}

// SectionHead est défini dans components.jsx — ne pas ré-exporter ici pour éviter l'écrasement
Object.assign(window, { MargexaContext });

ReactDOM.createRoot(document.getElementById('root')).render(<AppRoot />);
