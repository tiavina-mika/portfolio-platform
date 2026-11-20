Bouton d'action : `primary` (encre) pour l'action principale, `brand` (orange Signal) pour l'appel principal d'une page marketing, `outline`/`ghost` pour le reste.

```jsx
<Button>Enregistrer</Button>
<Button variant="brand" size="lg" iconRight={<ArrowRight size={18} />}>Demander un devis</Button>
<Button variant="outline" size="sm">Annuler</Button>
<Button variant="destructive" loading>Suppression…</Button>
```

- Variantes : primary, brand, secondary, outline, ghost, destructive, link.
- Tailles : sm (36), md (44, défaut, cible tactile), lg (52), icon (44×44, toujours avec `aria-label`).
- `href` rend un `<a>`. `loading` désactive et affiche un spinner.
- Une seule action `brand` par écran.
