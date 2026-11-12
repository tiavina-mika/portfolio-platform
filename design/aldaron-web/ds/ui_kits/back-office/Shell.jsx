(() => {
const DS = window.AldaronDesignSystem_1daf3c; const L = window.LucideReact || {};
const Ic = (n, s = 18) => { const C = L[n]; return C ? <C size={s} strokeWidth={1.75} /> : null; };
const shellStyles = {
  wrap: { display: 'grid', gridTemplateColumns: '248px minmax(0,1fr)', minHeight: '100vh', background: 'var(--background)' },
  side: { position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 12px', background: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' },
  logo: { padding: '0 10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  group: { font: '500 11px/1 var(--font-mono)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)', padding: '18px 10px 8px' },
  top: { position: 'sticky', top: 0, zIndex: 10, height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 32px', background: 'color-mix(in oklab, var(--background) 92%, transparent)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border)' },
};
const NAV = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'LayoutDashboard' },
  { id: 'content', label: 'Contenus', icon: 'FileText' },
  { id: 'contacts', label: 'Contacts reçus', icon: 'Inbox', count: 4 },
  { group: 'Administration' },
  { id: 'users', label: 'Utilisateurs', icon: 'Users' },
  { id: 'roles', label: 'Rôles et droits', icon: 'KeyRound' },
  { id: 'audit', label: "Journal d'audit", icon: 'ScrollText' },
  { id: 'settings', label: 'Paramètres', icon: 'Settings' },
];
function NavItem({ item, active, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 40, padding: '0 10px', border: 0, borderRadius: 'var(--radius-md)', cursor: 'pointer', font: '500 15px/1 var(--font-sans)', textAlign: 'left', background: active ? 'var(--sidebar-accent)' : h ? 'color-mix(in oklab, var(--sidebar-accent) 60%, transparent)' : 'transparent', color: active ? 'var(--foreground)' : 'var(--muted-foreground)', position: 'relative' }}>
      {active && <span style={{ position: 'absolute', left: -12, top: 10, bottom: 10, width: 3, background: 'var(--brand)', borderRadius: '0 2px 2px 0' }} />}
      {Ic(item.icon, 18)}<span style={{ flex: 1, color: active ? 'var(--foreground)' : undefined }}>{item.label}</span>
      {item.count && <span style={{ font: '500 12px/1 var(--font-mono)', padding: '3px 6px', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-foreground)' }}>{item.count}</span>}
    </button>
  );
}
function Shell({ page, setPage, title, actions, children, onLogout, dark, setDark }) {
  const { Button, DropdownMenu, Input } = DS;
  return (
    <div style={shellStyles.wrap}>
      <aside style={shellStyles.side}>
        <div style={shellStyles.logo}><img src={dark ? '../../assets/logo/aldaron-horizontal-dark.svg' : '../../assets/logo/aldaron-horizontal.svg'} alt="Aldaron" style={{ height: 26 }} /><span style={{ font: '500 11px var(--font-mono)', color: 'var(--muted-foreground)' }}>admin</span></div>
        {NAV.map((n, i) => n.group ? <div key={i} style={shellStyles.group}>{n.group}</div> : <NavItem key={n.id} item={n} active={page === n.id} onClick={() => setPage(n.id)} />)}
        <div style={{ marginTop: 'auto' }}>
          <DropdownMenu trigger={<button style={{ display: 'flex', alignItems: 'center', gap: 10, width: 224, padding: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: 'var(--primary-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 13px var(--font-sans)' }}>MR</span>
            <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>Marie Rakoto</span><span style={{ display: 'block', fontSize: 12, color: 'var(--muted-foreground)' }}>Administrateur</span></span>{Ic('ChevronsUpDown', 16)}
          </button>} items={[{ label: 'Mon profil', icon: Ic('User', 16), onSelect: () => setPage('settings') }, { label: dark ? 'Thème clair' : 'Thème sombre', icon: Ic(dark ? 'Sun' : 'Moon', 16), onSelect: () => setDark(!dark) }, { type: 'separator' }, { label: 'Se déconnecter', icon: Ic('LogOut', 16), onSelect: onLogout, destructive: true }]} />
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <header style={shellStyles.top}>
          <div style={{ width: 320 }}><Input size="sm" placeholder="Rechercher un contenu, un utilisateur…" leading={Ic('Search', 16)} /></div>
          <div style={{ flex: 1 }} />
          <Button variant="ghost" size="icon" aria-label={dark ? 'Thème clair' : 'Thème sombre'} onClick={() => setDark(!dark)}>{Ic(dark ? 'Sun' : 'Moon')}</Button>
          <Button variant="ghost" size="icon" aria-label="Notifications">{Ic('Bell')}</Button>
          <Button variant="outline" size="sm" iconLeft={Ic('ExternalLink', 16)} href="#">Voir le site</Button>
        </header>
        <main style={{ padding: '32px 32px 64px', maxWidth: 1200 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
            <h1 style={{ margin: 0, font: '700 32px/1.12 var(--font-display)', letterSpacing: '-0.02em' }}>{title}</h1>
            <div style={{ display: 'flex', gap: 8 }}>{actions}</div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
Object.assign(window, { Shell, Ic });

})();
