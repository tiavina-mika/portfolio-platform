Enveloppe chaque contrôle de formulaire : libellé au-dessus, aide en dessous, l'erreur remplace l'aide.

```jsx
<form style={{ display: 'grid', gap: 20 }}>
  <FormField label="Nom de la startup" htmlFor="co" required>
    <Input id="co" />
  </FormField>
  <FormField label="Email" htmlFor="em" error="Adresse email invalide.">
    <Input id="em" invalid defaultValue="contact@" />
  </FormField>
</form>
```

- Messages d'erreur : une phrase, dit ce qui ne va pas et comment corriger. Jamais « Erreur ! ».
- `optional` affiche « (facultatif) » ; préférer marquer les champs facultatifs plutôt que les obligatoires.
