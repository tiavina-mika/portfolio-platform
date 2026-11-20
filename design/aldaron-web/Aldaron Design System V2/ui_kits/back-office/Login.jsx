(() => {
const DS = window.AldaronDesignSystem_1daf3c; const L = window.LucideReact || {};
const Ic = (n, s = 18) => { const C = L[n]; return C ? <C size={s} strokeWidth={1.75} /> : null; };
function Login({ onDone, dark }) {
  const { Card, Button, Input, FormField, Checkbox, Alert } = DS;
  const [step, setStep] = React.useState('login');
  const [email, setEmail] = React.useState('marie@startup.eu');
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState('');
  const [code, setCode] = React.useState('');
  const submit = e => { e.preventDefault(); if (pw.length < 4) { setErr('Mot de passe incorrect. Il vous reste 4 tentatives.'); return; } setErr(''); setStep('mfa'); };
  const verify = e => { e.preventDefault(); onDone(); };
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--background)' }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'grid', gap: 24 }}>
        <img src={dark ? '../../assets/logo/aldaron-horizontal-dark.svg' : '../../assets/logo/aldaron-horizontal.svg'} alt="Aldaron" style={{ height: 32, justifySelf: 'center' }} />
        <Card padding={32}>
          {step === 'login' ? (
            <form onSubmit={submit} style={{ display: 'grid', gap: 20 }}>
              <div><h1 style={{ margin: 0, font: '700 24px/1.2 var(--font-display)', letterSpacing: '-0.015em' }}>Connexion au back-office</h1><p style={{ margin: '6px 0 0', color: 'var(--muted-foreground)', fontSize: 15 }}>Utilisez l'adresse de votre invitation.</p></div>
              {err && <Alert variant="destructive">{err}</Alert>}
              <FormField label="Email" htmlFor="em"><Input id="em" type="email" value={email} onChange={e => setEmail(e.target.value)} /></FormField>
              <FormField label="Mot de passe" htmlFor="pw" description="Saisissez au moins 4 caractères pour la démo."><Input id="pw" type="password" value={pw} invalid={!!err} onChange={e => setPw(e.target.value)} placeholder="••••••••" /></FormField>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -8 }}><Checkbox defaultChecked label="Rester connecté" /><a href="#" style={{ fontSize: 14 }}>Mot de passe oublié ?</a></div>
              <Button type="submit" block size="lg">Se connecter</Button>
            </form>
          ) : (
            <form onSubmit={verify} style={{ display: 'grid', gap: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--accent)', color: 'var(--accent-foreground)', display: 'grid', placeItems: 'center' }}>{Ic('ShieldCheck', 22)}</div>
              <div><h1 style={{ margin: 0, font: '700 24px/1.2 var(--font-display)', letterSpacing: '-0.015em' }}>Double authentification</h1><p style={{ margin: '6px 0 0', color: 'var(--muted-foreground)', fontSize: 15 }}>Saisissez le code à 6 chiffres de votre application d'authentification.</p></div>
              <FormField label="Code" htmlFor="code"><Input id="code" autoFocus inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000 000" style={{ fontFamily: 'var(--font-mono)', fontSize: 22, letterSpacing: '.3em', height: 52 }} /></FormField>
              <Button type="submit" block size="lg" disabled={code.length < 6}>Vérifier</Button>
              <Button variant="ghost" onClick={() => setStep('login')}>Retour</Button>
            </form>
          )}
        </Card>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted-foreground)', margin: 0 }}>Propulsé par le socle Aldaron · <a href="#">Aide</a></p>
      </div>
    </div>
  );
}
Object.assign(window, { Login });

})();
