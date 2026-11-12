# Kit Aldaron

## Contenu
| Dossier | Usage |
|---|---|
| `nextjs/` | **À copier dans votre projet Next.js** : `public/` (favicons, icônes PWA, image de partage, logos SVG et PNG), `app/fonts.ts`, `layout.tsx`, `manifest.ts`, `globals.css` (Tailwind v4 + shadcn), `tailwind.config.ts` (Tailwind v3 seulement) |
| `assets/` | Sources : logo (SVG clair, sombre, monochrome ; PNG), icônes, polices woff2, image de partage |
| `tokens/`, `styles.css` | Jetons CSS clair et sombre pour les maquettes HTML |
| `templates/` | Versions définitives interactives : logo, fonts, colors, shape, iconography, design-system |
| `components/` | Composants React de référence (Button, Input, Select, Checkbox, Switch, FormField, Card, Dialog, DropdownMenu, Table, Tabs, Badge, Alert, Toast) |
| `ui_kits/back-office/` | Back-office cliquable (ouvrir `index.html`) |
| `guidelines/` | Guide d'usage et notes Next.js |

## Mise en route Next.js
1. Copier `nextjs/public/*` dans `public/`.
2. Copier `nextjs/app/fonts.ts`, `layout.tsx`, `manifest.ts` dans `app/`, et remplacer `app/globals.css` par `nextjs/app/globals.css`.
3. `npm i next-themes tw-animate-css lucide-react`.
4. shadcn/ui : `components.json` avec `"style": "new-york"` et `"cssVariables": true`. Les jetons viennent uniquement de `globals.css`.
5. Remplacer `metadataBase` par le vrai domaine.

## Polices
Bricolage Grotesque (titres 700-800), Instrument Sans (texte), JetBrains Mono (étiquettes, chiffres, code), chargées par `next/font`. Les woff2 de `assets/fonts/` servent aux maquettes HTML hors Next.js. Le nom du logo est dessiné en tracés : il ne dépend d'aucune police.

## Logo
`public/brand/aldaron-{horizontal,stacked,symbol}[-dark|-mono].svg`. Les versions `-mono` prennent la couleur du texte. PNG transparents dans `brand/png/`. Taille minimale : 96 px de large (horizontal), 16 px (symbole). Zone de protection : 50 % de la hauteur du symbole.

## À vérifier
- Les fichiers `.dc.html` s'ouvrent depuis ce dossier (ils chargent `styles.css` et `_ds_bundle.js` en relatif).
- Disponibilité du nom « Aldaron » (marque, domaine) avant toute communication.
- Traduction malgache des templates à faire relire.
