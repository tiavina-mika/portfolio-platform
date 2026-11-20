Choix unique dans une liste courte (≤ 12 options) ; au-delà, préférer une recherche.

```jsx
<FormField label="Rôle" htmlFor="role">
  <Select id="role" defaultValue="editor" options={[
    { value: 'admin', label: 'Administrateur' },
    { value: 'editor', label: 'Éditeur' },
    { value: 'viewer', label: 'Lecteur' },
  ]} onChange={setRole} />
</FormField>
```

- Même géométrie que `Input` (44 px, rayon md).
- Contrôlé (`value`) ou non (`defaultValue`). `invalid`, `disabled`.
