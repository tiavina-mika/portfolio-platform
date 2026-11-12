Conteneur de contenu groupé : bloc d'offre, widget de tableau de bord, panneau de réglages.

```jsx
<Card eyebrow="Socle" title="5 000 €" description="Auth, rôles, CMS, back-office" action={<Badge variant="brand">Inclus</Badge>}
      footer={<Button size="sm">Demander un devis</Button>}>
  …
</Card>
<Card variant="inverted" title="MVP web + mobile">…</Card>
```

- `default` : bordure 1 px, pas d'ombre. `elevated` seulement pour ce qui flotte au-dessus d'un contenu.
- `inverted` (encre) : une seule par section, pour l'offre mise en avant.
- Ne pas imbriquer des cartes dans des cartes.
