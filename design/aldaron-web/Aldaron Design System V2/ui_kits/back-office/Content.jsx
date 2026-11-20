(() => {
const DS = window.AldaronDesignSystem_1daf3c; const L = window.LucideReact || {};
const Ic = (n, s = 18) => { const C = L[n]; return C ? <C size={s} strokeWidth={1.75} /> : null; };
const ARTICLES = [
  { id: 1, title: 'Lancement de la bêta publique', cat: 'Annonces', status: 'published', lang: 'FR · EN', date: '05/11/2026' },
  { id: 2, title: 'Comment nous protégeons vos données', cat: 'Sécurité', status: 'published', lang: 'FR · EN', date: '28/10/2026' },
  { id: 3, title: 'Feuille de route du T1', cat: 'Produit', status: 'draft', lang: 'FR', date: '—' },
  { id: 4, title: 'Étude de cas : Finly', cat: 'Clients', status: 'review', lang: 'FR · EN', date: '—' },
];
const AS = { published: ['success', 'Publié'], draft: ['default', 'Brouillon'], review: ['info', 'En relecture'] };
function Editor({ onBack }) {
  const { Card, Input, Textarea, FormField, Select, Switch, Tabs, Button, Badge, Toaster } = DS;
  const [lang, setLang] = React.useState('fr');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }}>
      <Card>
        <Tabs value={lang} onChange={setLang} items={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} />
        <div style={{ display: 'grid', gap: 18, marginTop: 20 }}>
          <FormField label="Titre" htmlFor="t"><Input id="t" key={lang} defaultValue={lang === 'fr' ? 'Feuille de route du T1' : ''} placeholder={lang === 'en' ? 'Q1 roadmap' : ''} /></FormField>
          <FormField label="Adresse" htmlFor="slug" description="Générée depuis le titre."><Input id="slug" leading={<span style={{ font: '400 13px var(--font-mono)' }}>/</span>} defaultValue={lang === 'fr' ? 'blog/feuille-de-route-t1' : 'en/blog/q1-roadmap'} key={'s' + lang} /></FormField>
          <FormField label="Contenu" htmlFor="body"><Textarea id="body" rows={8} defaultValue={lang === 'fr' ? 'Ce trimestre, nous livrons trois chantiers : la facturation, l\'export des données et l\'application mobile.' : ''} key={'b' + lang} /></FormField>
        </div>
      </Card>
      <div style={{ display: 'grid', gap: 16 }}>
        <Card padding={20} title="Publication" action={<Badge>Brouillon</Badge>} footer={<><Button variant="outline" size="sm" onClick={onBack}>Enregistrer</Button><Button size="sm" onClick={() => { Toaster.show({ variant: 'success', title: 'Article publié' }); onBack(); }}>Publier</Button></>}>
          <div style={{ display: 'grid', gap: 4 }}><Switch defaultChecked label="Afficher sur l'accueil" /><Switch label="Envoyer aux abonnés" description="1 204 destinataires" /></div>
        </Card>
        <Card padding={20} title="Classement"><div style={{ display: 'grid', gap: 16 }}><FormField label="Catégorie" htmlFor="cat"><Select id="cat" defaultValue="p" options={[{ value: 'a', label: 'Annonces' }, { value: 'p', label: 'Produit' }, { value: 's', label: 'Sécurité' }, { value: 'c', label: 'Clients' }]} /></FormField></div></Card>
        <Card padding={20} variant="muted" title="Historique" description="3 versions · dernière par Marie Rakoto, il y a 2 h" />
      </div>
    </div>
  );
}
function Content({ editing, setEditing }) {
  const { Table, Badge, Tabs } = DS;
  const [f, setF] = React.useState('all');
  if (editing) return <Editor onBack={() => setEditing(false)} />;
  const rows = ARTICLES.filter(a => f === 'all' || a.status === f);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Tabs value={f} onChange={setF} items={[{ value: 'all', label: 'Tous', count: 4 }, { value: 'published', label: 'Publiés' }, { value: 'draft', label: 'Brouillons' }, { value: 'review', label: 'En relecture' }]} />
      <Table onRowClick={() => setEditing(true)} columns={[
        { key: 'title', header: 'Titre', render: r => <span style={{ fontWeight: 500 }}>{r.title}</span> },
        { key: 'cat', header: 'Catégorie' },
        { key: 'lang', header: 'Langues', render: r => <Badge mono size="sm" square>{r.lang}</Badge> },
        { key: 'status', header: 'Statut', render: r => <Badge variant={AS[r.status][0]} dot>{AS[r.status][1]}</Badge> },
        { key: 'date', header: 'Publié le', numeric: true },
      ]} rows={rows} />
    </div>
  );
}
Object.assign(window, { Content });

})();
