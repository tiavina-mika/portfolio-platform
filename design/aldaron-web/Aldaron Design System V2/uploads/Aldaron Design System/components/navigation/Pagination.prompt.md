Pagination d'une liste : Précédent, numéros (avec « … » au-delà de 7 pages), Suivant. Sur mobile, `compact` affiche « 2 / 5 ».

```jsx
<Pagination page={page} pageCount={5} onChange={setPage} />
<Pagination page={page} pageCount={5} onChange={setPage} compact labels={{ prev: 'Précédent', next: 'Suivant' }} />
```

Revenir à la page 1 quand un filtre change.
