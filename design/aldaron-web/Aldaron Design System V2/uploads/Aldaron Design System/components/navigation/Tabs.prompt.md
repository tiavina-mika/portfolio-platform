Onglets : `underline` pour les sections d'un écran (Profil / Sécurité / Notifications), `pill` pour un filtre de vue (Mensuel / Annuel).

```jsx
<Tabs items={[
  { value: 'profil', label: 'Profil', content: <ProfileForm /> },
  { value: 'securite', label: 'Sécurité', content: <Security /> },
  { value: 'invit', label: 'Invitations', count: 3, content: <Invites /> },
]} />
<Tabs variant="pill" items={[{ value: 'web', label: 'Web' }, { value: 'mobile', label: 'Mobile' }]} onChange={setView} />
```
