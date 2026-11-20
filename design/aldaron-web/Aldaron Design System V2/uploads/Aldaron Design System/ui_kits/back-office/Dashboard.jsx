(() => {
const DS = window.AldaronDesignSystem_1daf3c; const L = window.LucideReact || {};
const Ic = (n, s = 18) => { const C = L[n]; return C ? <C size={s} strokeWidth={1.75} /> : null; };
function Stat({ label, value, delta, icon }) {
  const { Card } = DS;
  return (
    <Card padding={20}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)' }}><span style={{ font: '500 12px/1 var(--font-mono)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</span>{Ic(icon, 18)}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 14 }}><span style={{ font: '700 32px/1 var(--font-display)', letterSpacing: '-0.025em' }}>{value}</span>{delta && <span style={{ font: '500 13px var(--font-mono)', color: 'var(--success)' }}>{delta}</span>}</div>
    </Card>
  );
}
const WEEKS = [42, 58, 51, 66, 72, 61, 84, 79, 95, 88, 102, 118];
function Dashboard({ go }) {
  const { Card, Table, Badge, Button, Tabs, Alert } = DS;
  const max = Math.max(...WEEKS);
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <Alert variant="warning" title="La double authentification n'est pas activée pour 2 administrateurs" action={<Button size="sm" variant="outline" onClick={() => go('users')}>Voir</Button>}>Elle sera obligatoire pour ce rôle à partir du 1er décembre.</Alert>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 16 }}>
        <Stat label="Contacts reçus" value="38" delta="+12 %" icon="Inbox" />
        <Stat label="Abonnés newsletter" value="1 204" delta="+86" icon="Mail" />
        <Stat label="Articles publiés" value="24" icon="FileText" />
        <Stat label="Utilisateurs actifs" value="9" icon="Users" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16 }}>
        <Card title="Visites du site" description="12 dernières semaines" action={<Tabs variant="pill" items={[{ value: 'v', label: 'Visites' }, { value: 'c', label: 'Contacts' }]} />}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, paddingTop: 8 }}>
            {WEEKS.map((v, i) => <div key={i} title={v + ' visites'} style={{ flex: 1, height: (v / max * 100) + '%', background: i === WEEKS.length - 1 ? 'var(--chart-1)' : 'var(--chart-5)', opacity: i === WEEKS.length - 1 ? 1 : .35, borderRadius: '3px 3px 0 0' }} />)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 12px var(--font-mono)', color: 'var(--muted-foreground)', marginTop: 8 }}><span>S34</span><span>S45</span></div>
        </Card>
        <Card title="Journal d'audit" action={<Button variant="link" onClick={() => go('audit')}>Tout voir</Button>}>
          <div style={{ display: 'grid', gap: 14 }}>
            {[['Marie Rakoto', 'a publié « Lancement de la bêta »', '09:42'], ['Thomas Weber', "a accepté l'invitation", '08:15'], ['Système', 'a envoyé 1 204 newsletters', 'hier'], ['Marie Rakoto', 'a modifié le rôle Éditeur', 'hier']].map(([w, a, t], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '8px 1fr auto', gap: 12, alignItems: 'baseline', fontSize: 14 }}><span style={{ width: 6, height: 6, background: i === 0 ? 'var(--brand)' : 'var(--input)', borderRadius: 1 }} /><span><b style={{ fontWeight: 600 }}>{w}</b> <span style={{ color: 'var(--muted-foreground)' }}>{a}</span></span><span style={{ font: '400 12px var(--font-mono)', color: 'var(--muted-foreground)' }}>{t}</span></div>
            ))}
          </div>
        </Card>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><h2 style={{ margin: 0, font: '700 20px/1.3 var(--font-display)' }}>Derniers contacts</h2><Button variant="outline" size="sm" iconRight={Ic('ArrowRight', 16)}>Tous les contacts</Button></div>
        <Table columns={[
          { key: 'name', header: 'Expéditeur', render: r => <div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{r.email}</div></div> },
          { key: 'subject', header: 'Objet' },
          { key: 'status', header: 'Statut', render: r => r.new ? <Badge variant="brand" dot>Nouveau</Badge> : <Badge dot>Traité</Badge> },
          { key: 'date', header: 'Reçu le', numeric: true },
        ]} rows={[
          { id: 1, name: 'Paul Lefèvre', email: 'paul@finly.io', subject: 'Demande de démo', new: true, date: '05/11 10:12' },
          { id: 2, name: 'Sofia Martins', email: 'sofia@kaza.pt', subject: 'Partenariat', new: true, date: '04/11 16:40' },
          { id: 3, name: 'Jonas Becker', email: 'jonas@hof.de', subject: 'Question tarif', new: false, date: '03/11 09:05' },
        ]} />
      </div>
    </div>
  );
}
Object.assign(window, { Dashboard });

})();
