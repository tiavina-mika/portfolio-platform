Menu d'actions secondaires attaché à un bouton (actions d'une ligne, menu de profil).

```jsx
<DropdownMenu align="end" trigger={<Button variant="ghost" size="icon" aria-label="Actions"><Ellipsis size={18} /></Button>}
  items={[
    { label: 'Modifier', icon: <Pencil size={16} />, onSelect: edit },
    { label: 'Renvoyer l\'invitation', icon: <Mail size={16} /> },
    { type: 'separator' },
    { label: 'Supprimer', icon: <Trash2 size={16} />, destructive: true },
  ]} />
```

- Action destructive toujours en dernier, après un séparateur.
