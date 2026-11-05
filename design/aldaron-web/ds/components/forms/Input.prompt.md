Champ texte d'une ligne (et `Textarea` multiligne) ; toujours accompagné d'un libellé via `FormField`.

```jsx
<FormField label="Email professionnel" htmlFor="email" error={err}>
  <Input id="email" type="email" placeholder="vous@startup.eu" invalid={!!err} />
</FormField>
<Input leading={<Search size={16} />} placeholder="Rechercher" />
<Input trailing="€" defaultValue="5000" />
<Textarea placeholder="Décrivez votre produit" />
```

- Hauteur 44 px (sm 36 px pour les barres d'outils denses).
- `invalid` pose `aria-invalid` et la bordure erreur.
