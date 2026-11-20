Conteneur de contenu groupé : bloc d'offre, widget de tableau de bord, panneau de réglages.

```jsx
<Card eyebrow="Mobile" title="2 500 €" description="25 € par écran, iOS et Android" action={<Badge variant="brand">Minimum</Badge>}
      footer={<Button size="sm">Demander un devis</Button>}>
  …
</Card>
<Card variant="inverted" title="MVP web + mobile">…</Card>
```

- `default` : bordure 1 px, pas d'ombre. `elevated` seulement pour ce qui flotte au-dessus d'un contenu.
- `inverted` (encre) : une seule par section, pour l'offre mise en avant.
- Ne pas imbriquer des cartes dans des cartes.
