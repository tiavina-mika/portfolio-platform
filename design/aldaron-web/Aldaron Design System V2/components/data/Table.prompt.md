Tableau de données (listes du back-office : utilisateurs, contacts, articles, journal d'audit).

```jsx
<Table
  columns={[
    { key: 'name', header: 'Nom' },
    { key: 'role', header: 'Rôle', render: r => <Badge>{r.role}</Badge> },
    { key: 'last', header: 'Dernière connexion', numeric: true },
  ]}
  rows={users}
  onRowClick={openUser}
  footer={<><span>24 utilisateurs</span><Button size="sm" variant="outline">Suivant</Button></>}
/>
```

- Chiffres, dates et montants : `numeric` (mono, tabulaires, à droite).
- `dense` pour les journaux longs (audit).
