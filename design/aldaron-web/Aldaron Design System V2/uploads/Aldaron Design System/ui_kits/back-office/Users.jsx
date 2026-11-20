(() => {
const DS = window.AldaronDesignSystem_1daf3c; const L = window.LucideReact || {};
const Ic = (n, s = 18) => { const C = L[n]; return C ? <C size={s} strokeWidth={1.75} /> : null; };
const USERS0 = [
  { id: 1, name: 'Marie Rakoto', email: 'marie@startup.eu', role: 'Administrateur', status: 'active', mfa: true, last: '05/11 09:42' },
  { id: 2, name: 'Thomas Weber', email: 'thomas@startup.eu', role: 'Éditeur', status: 'active', mfa: false, last: '05/11 08:15' },
  { id: 3, name: 'Lina Haddad', email: 'lina@startup.eu', role: 'Lecteur', status: 'suspended', mfa: true, last: '28/10 17:05' },
  { id: 4, name: 'Karim Benali', email: 'karim@startup.eu', role: 'Administrateur', status: 'active', mfa: false, last: '02/11 11:30' },
  { id: 5, name: 'julie@startup.eu', email: 'Invitation envoyée le 03/11', role: 'Éditeur', status: 'invited', mfa: false, last: '—' },
];
const ST = { active: ['success', 'Actif'], invited: ['warning', 'Invité'], suspended: ['destructive', 'Suspendu'] };
const ROLES = [{ value: 'Administrateur', label: 'Administrateur' }, { value: 'Éditeur', label: 'Éditeur' }, { value: 'Lecteur', label: 'Lecteur' }];
function InviteDialog({ open, onClose, onInvite }) {
  const { Dialog, Button, Input, FormField, Select, Checkbox } = DS;
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState('Éditeur');
  const [err, setErr] = React.useState('');
  const send = () => { if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) { setErr('Saisissez une adresse email valide, par exemple nom@startup.eu.'); return; } onInvite(email, role); setEmail(''); setErr(''); };
  return (
    <Dialog open={open} onClose={onClose} title="Inviter un utilisateur" description="Il recevra un email pour créer son mot de passe. L'invitation expire après 7 jours."
      footer={<><Button variant="outline" onClick={onClose}>Annuler</Button><Button onClick={send} iconLeft={Ic('Send', 16)}>Envoyer l'invitation</Button></>}>
      <div style={{ display: 'grid', gap: 18 }}>
        <FormField label="Email" htmlFor="inv-em" error={err}><Input id="inv-em" type="email" value={email} invalid={!!err} placeholder="nom@startup.eu" onChange={e => setEmail(e.target.value)} /></FormField>
        <FormField label="Rôle" htmlFor="inv-role" description="Les droits de chaque rôle se règlent dans Rôles et droits."><Select id="inv-role" options={ROLES} value={role} onChange={setRole} /></FormField>
        <Checkbox defaultChecked label="Exiger la double authentification" description="Recommandé pour les administrateurs." />
      </div>
    </Dialog>
  );
}
function Users() {
  const { Table, Badge, Button, DropdownMenu, Tabs, Toaster } = DS;
  const [users, setUsers] = React.useState(USERS0);
  const [tab, setTab] = React.useState('all');
  const [open, setOpen] = React.useState(false);
  const rows = users.filter(u => tab === 'all' ? u.status !== 'invited' : u.status === 'invited');
  const invite = (email, role) => { setUsers(u => [...u, { id: Date.now(), name: email, email: 'Invitation envoyée aujourd\'hui', role, status: 'invited', mfa: false, last: '—' }]); setOpen(false); setTab('inv'); Toaster.show({ variant: 'success', title: 'Invitation envoyée', description: email + ' recevra un email.' }); };
  const remove = u => { setUsers(l => l.filter(x => x.id !== u.id)); Toaster.show({ variant: 'inverted', title: 'Utilisateur supprimé', description: u.name, action: <Button size="sm" variant="secondary" onClick={() => setUsers(l => [...l, u])}>Annuler</Button> }); };
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Tabs variant="pill" value={tab} onChange={setTab} items={[{ value: 'all', label: 'Utilisateurs', count: users.filter(u => u.status !== 'invited').length }, { value: 'inv', label: 'Invitations', count: users.filter(u => u.status === 'invited').length }]} />
        <Button onClick={() => setOpen(true)} iconLeft={Ic('UserPlus', 16)}>Inviter</Button>
      </div>
      <Table columns={[
        { key: 'name', header: 'Utilisateur', render: r => <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><span style={{ width: 32, height: 32, flex: 'none', borderRadius: 'var(--radius-md)', background: 'var(--muted)', display: 'grid', placeItems: 'center', font: '600 12px var(--font-sans)', color: 'var(--muted-foreground)' }}>{r.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}</span><div><div style={{ fontWeight: 500 }}>{r.name}</div><div style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{r.email}</div></div></div> },
        { key: 'role', header: 'Rôle', render: r => <Badge variant="outline">{r.role}</Badge> },
        { key: 'status', header: 'Statut', render: r => <Badge variant={ST[r.status][0]} dot>{ST[r.status][1]}</Badge> },
        { key: 'mfa', header: 'MFA', render: r => r.mfa ? <span style={{ color: 'var(--success)', display: 'flex' }} title="Activée">{Ic('ShieldCheck', 18)}</span> : <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Non</span> },
        { key: 'last', header: 'Connexion', numeric: true },
        { key: 'x', header: '', width: 56, render: r => <DropdownMenu align="end" trigger={<Button variant="ghost" size="icon" aria-label={'Actions pour ' + r.name}>{Ic('Ellipsis')}</Button>} items={[
          { label: 'Modifier', icon: Ic('Pencil', 16) }, { label: 'Changer de rôle', icon: Ic('KeyRound', 16) },
          r.status === 'invited' ? { label: "Renvoyer l'invitation", icon: Ic('Mail', 16), onSelect: () => Toaster.show({ title: 'Invitation renvoyée', variant: 'success' }) } : { label: r.status === 'suspended' ? 'Réactiver' : 'Suspendre', icon: Ic('Ban', 16) },
          { type: 'separator' }, { label: 'Supprimer', icon: Ic('Trash2', 16), destructive: true, onSelect: () => remove(r) }]} /> },
      ]} rows={rows} empty="Aucune invitation en attente." footer={<><span>{rows.length} sur {rows.length}</span><span style={{ display: 'flex', gap: 8 }}><Button size="sm" variant="outline" disabled>Précédent</Button><Button size="sm" variant="outline" disabled>Suivant</Button></span></>} />
      <InviteDialog open={open} onClose={() => setOpen(false)} onInvite={invite} />
    </>
  );
}
Object.assign(window, { Users });

})();
