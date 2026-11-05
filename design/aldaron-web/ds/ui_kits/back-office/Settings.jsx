(() => {
const DS = window.AldaronDesignSystem_1daf3c; const L = window.LucideReact || {};
const Ic = (n, s = 18) => { const C = L[n]; return C ? <C size={s} strokeWidth={1.75} /> : null; };
function Settings() {
  const { Card, Tabs, FormField, Input, Select, Switch, Button, Alert, Toaster } = DS;
  const row = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 };
  return (
    <Tabs items={[
      { value: 'p', label: 'Profil', content: (
        <Card footer={<Button onClick={() => Toaster.show({ variant: 'inverted', title: 'Modifications enregistrées' })}>Enregistrer</Button>}>
          <div style={{ display: 'grid', gap: 18, maxWidth: 640 }}>
            <div style={row}><FormField label="Prénom" htmlFor="fn"><Input id="fn" defaultValue="Marie" /></FormField><FormField label="Nom" htmlFor="ln"><Input id="ln" defaultValue="Rakoto" /></FormField></div>
            <FormField label="Email" htmlFor="pe" description="Utilisée pour la connexion et les notifications."><Input id="pe" defaultValue="marie@startup.eu" /></FormField>
            <div style={row}><FormField label="Langue du back-office" htmlFor="lg"><Select id="lg" defaultValue="fr" options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} /></FormField><FormField label="Fuseau horaire" htmlFor="tz"><Select id="tz" defaultValue="paris" options={[{ value: 'paris', label: 'Europe/Paris' }, { value: 'tana', label: 'Indian/Antananarivo' }]} /></FormField></div>
          </div>
        </Card>) },
      { value: 's', label: 'Sécurité', content: (
        <div style={{ display: 'grid', gap: 16 }}>
          <Alert variant="success" title="Double authentification activée">Application d'authentification configurée le 12/09/2026.</Alert>
          <Card title="Mot de passe" description="Dernière modification il y a 3 mois." action={<Button variant="outline" size="sm">Modifier</Button>} />
          <Card title="Sessions actives" description="2 appareils connectés." action={<Button variant="outline" size="sm">Tout déconnecter</Button>} />
        </div>) },
      { value: 'n', label: 'Notifications', content: (
        <Card title="Par email" description="Les notifications du back-office restent toujours visibles dans la cloche.">
          <div style={{ display: 'grid' }}>
            <Switch defaultChecked label="Nouveau contact reçu" description="Un email par message reçu via le formulaire." />
            <Switch defaultChecked label="Invitation acceptée" />
            <Switch label="Résumé hebdomadaire" description="Chaque lundi à 9 h." />
            <Switch disabled defaultChecked label="Alertes de sécurité" description="Toujours actives." />
          </div>
        </Card>) },
    ]} />
  );
}
Object.assign(window, { Settings });

})();
