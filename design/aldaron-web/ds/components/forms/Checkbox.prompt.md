Case à cocher pour un choix binaire dans un formulaire, ou multiple dans une liste ; pour un réglage à effet immédiat, utiliser `Switch`.

```jsx
<Checkbox label="J'accepte les conditions" invalid={!accepted} onChange={setAccepted} />
<Checkbox defaultChecked label="Double authentification" description="Demandée à chaque connexion" />
<Checkbox indeterminate label="Tous les droits" />
```
