# Guide d'usage — une page

## Couleurs : laquelle, quand
| Besoin | Jeton | Jamais |
|---|---|---|
| Fond de page | `background` (Papier) | blanc pur en fond de page |
| Carte, champ, menu | `card` / `popover` (blanc) | |
| Texte courant | `foreground` | gris clair < 4,5:1 |
| Texte secondaire, aide | `muted-foreground` | sur fond `muted` en dessous de 14 px |
| Action principale (produit) | `primary` (Encre) | deux boutons primary côte à côte |
| Appel principal (marketing) | `brand` (Signal) + texte encre | texte blanc sur Signal |
| Lien, texte orange | `brand-text` | `brand` (500) pour du texte |
| Mise en avant légère | `accent` / `accent-foreground` | |
| Supprimer, erreur | `destructive` | pour attirer l'attention sans danger |
| Statut | `success`, `warning`, `info` sur `*-subtle` | couleur seule sans texte |
| Données | `chart-1` → `chart-5` dans l'ordre | Signal pour autre chose que la série principale |

## Composants : lequel, quand
| Situation | Composant |
|---|---|
| Action principale d'un écran | `Button` primary (une seule) |
| Appel « Demander un devis » | `Button` brand, lg |
| Action secondaire | `Button` outline ; tertiaire : ghost |
| Saisie | `FormField` + `Input` / `Textarea` / `Select` |
| Choix binaire dans un formulaire | `Checkbox` |
| Réglage à effet immédiat | `Switch` |
| Regrouper un contenu | `Card` (inverted : une par section) |
| Sections d'un même écran | `Tabs` underline |
| Filtrer une liste | `Tabs` pill |
| Liste de données | `Table` (+ `DropdownMenu` pour les actions de ligne) |
| Décision bloquante | `Dialog` |
| Statut d'un élément | `Badge` avec `dot` |
| Message qui doit rester | `Alert` |
| Confirmation passagère | `Toast` via `Toaster.show` |

## Règles
- Contraste AA vérifié pour chaque paire de jetons (cartes « Semantic tokens »).
- Focus visible sur tout élément interactif ; cible de 44 px minimum.
- Aucune couleur écrite en dur dans un composant : uniquement des jetons.
- Pas de dégradé, pas d'emoji, pas d'ombre sur les cartes au repos.
- Le back-office reste sur le système tel quel ; seules les pages publiques reçoivent la charte du client (logo, `--brand`, `--primary`, polices).
