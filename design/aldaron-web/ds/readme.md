# Aldaron — système de design

Aldaron est une société de développement qui livre aux startups (pré-seed à série A, Europe) un produit web, et mobile en option, avec authentification, rôles, CMS et back-office en place dès le premier jour, à partir d'un plancher de 5 000 €. Chaque projet part d'un template éprouvé (extrait de **1lalana-platform**, partie générique `_core`) au lieu d'une page blanche.

Ce système couvre deux usages :
1. **La marque Aldaron** : site, devis, présentations.
2. **Le socle livré aux clients** : le back-office et le site Next.js du template, sur lesquels on applique ensuite la charte de chaque client (on change les jetons, pas la structure).

**Sources** : le document « Aldaron — vision de la société » (positionnement, socle, leviers de prix, prompt de design), collé dans la conversation. Aucun logo, code, Figma ni charte existants : le projet part de zéro. Le dépôt 1lalana-platform est cité mais n'a pas été fourni ; le back-office du kit est donc une composition, à recaler sur ce dépôt.

**Direction retenue** : « Précision chaleureuse ». Trois pistes ont été proposées (`directions/`) ; sans choix explicite, la piste A (Précision) a été retenue et réchauffée selon les mots-clés donnés : *ingénierie, chaleureux, audacieux*, thème clair par défaut.

**Stack cible** : Next.js (App Router), Tailwind CSS, shadcn/ui, next/font, Lucide. Fichiers prêts à coller dans `export/nextjs/`.

---

## Index

| Chemin | Contenu |
|---|---|
| `styles.css` | Point d'entrée : uniquement des `@import` |
| `tokens/fonts.css` | `@font-face` Familjen Grotesk + IBM Plex Mono (woff2 locaux) |
| `tokens/colors.css` | Palette de base + jetons shadcn clair (`:root`) et sombre (`.dark`) |
| `tokens/typography.css` | Familles, graisses, échelle, interlignes |
| `tokens/spacing.css` | Espacements, rayons, bordures, ombres, focus, mouvement, tailles de contrôle |
| `tokens/base.css` | Reset minimal (liens, focus, sélection) |
| `export/nextjs/globals.css` | globals.css Tailwind v4 + shadcn, prêt à coller |
| `export/nextjs/tailwind.config.ts` | Équivalent Tailwind v3 |
| `guidelines/nextjs.md` | next/font, metadata, manifest, fichiers `public/`, réglages shadcn |
| `guidelines/usage-guide.md` | Guide d'usage d'une page : quelle couleur, quel composant |
| `guidelines/*.html` | Cartes de fondations (onglet Design System) |
| `Design System.html` | Page de présentation : logo, couleurs, typo, icônes, composants |
| `assets/logo/` | Symbole, horizontal, empilé — clair, sombre, mono (SVG, texte vectorisé) |
| `assets/icons/` | favicon.svg, favicon.ico, apple-touch-icon, PWA 192/512/maskable |
| `assets/brand/og-image.png` | Image de partage 1200 × 630 |
| `assets/fonts/` | Fichiers woff2 |
| `components/` | Composants React (voir ci-dessous) |
| `ui_kits/back-office/` | Back-office du socle, cliquable |
| `directions/` | Les trois pistes initiales (archive) |
| `SKILL.md` | Fichier de compétence pour Claude Code |

## Components

Habillage des composants shadcn/ui demandés par le brief. Même API d'esprit, même structure, jetons Aldaron.

- **actions/** — `Button` (primary, brand, secondary, outline, ghost, destructive, link ; sm/md/lg/icon ; loading)
- **forms/** — `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `FormField`, `Label` (équivalent du Form shadcn)
- **layout/** — `Card`
- **navigation/** — `Tabs` (underline, pill)
- **data/** — `Table`
- **overlays/** — `Dialog`, `DropdownMenu`
- **feedback/** — `Badge`, `Alert`, `Toast`, `Toaster`

Ajouts au-delà de la liste du brief : `Textarea` (nécessaire au CMS et au formulaire de contact), `Label` (extrait de FormField), `Toaster` (pile qui affiche les `Toast`). Les icônes internes des composants (coche, chevron, croix, alertes) sont des tracés Lucide copiés dans `components/_shared/icons.jsx`.

## UI kits

- **ui_kits/back-office/** — Connexion + MFA, tableau de bord, contenus (liste + éditeur FR/EN), utilisateurs (invitation, actions, annulation), paramètres. Contacts, Rôles et Audit sont des emplacements vides.
- **Site public** : non conçu. Le brief le réserve à l'étape 2 (accueil, offre et prix, réalisations, à propos, contact), avec un contenu à fournir.

---

## CONTENT FUNDAMENTALS

**Langues** : français d'abord, anglais à parité. Tous les libellés existent dans les deux langues ; on écrit en français puis on traduit, sans calque.

**Ton** : fiable, rapide, moderne, sans jargon. Sérieux sans être froid. On parle comme un développeur senior qui explique un devis à un fondateur : précis, concret, chiffré.

**Personne** : on vouvoie le client (« votre MVP », « vous recevez le code »). Aldaron parle à la première personne du pluriel, sobrement (« on part d'une base déjà en production », « nous livrons »). Dans le produit (back-office), l'interface ne dit ni « je » ni « nous » : elle décrit (« Invitation envoyée »).

**Casse** : majuscule seulement en début de phrase et aux noms propres, y compris dans les titres et les boutons (« Demander un devis », pas « Demander Un Devis »). Les étiquettes mono (`LEVIER 04`, en-têtes de tableau) passent en capitales par CSS, jamais dans le texte source.

**Chiffres** : toujours écrits, jamais arrondis vers le flou. Espace insécable avant € et dans les milliers : « 5 000 € », « 1 204 abonnés ». Pourcentages : « 40 % ». Délais en jours ou en semaines (« à partir d'un mois »). Dates : 05/11/2026 dans les tableaux, « 5 novembre » dans le texte.

**Boutons** : verbe à l'infinitif + objet. « Envoyer l'invitation », « Publier », « Supprimer ». Jamais « OK », « Valider » si un verbe plus précis existe.

**Confirmations (toasts)** : participe passé, sans point d'exclamation. « Article publié », « Rôle modifié ».

**Erreurs** : dire ce qui ne va pas et comment corriger, en une phrase. « Saisissez une adresse email valide, par exemple nom@startup.eu. » Jamais « Erreur ! » ni « Oups ».

**Promesse et périmètre** : on dit ce qui est inclus *et* ce qui ne l'est pas. Le prix se présente comme un plancher (« à partir de »), le reste en leviers.

**Emoji** : jamais. Ni dans le site, ni dans le produit, ni dans les emails.

**Exemples**
- Titre : « Votre MVP, back-office compris, dès le premier jour. »
- Sous-titre : « Authentification, rôles, CMS et administration sont déjà en place. On ne facture que ce qui est propre à votre produit. »
- Étiquette : « Inclus dans le socle »
- Aide de champ : « Les droits de chaque rôle se règlent dans Rôles et droits. »
- À éviter : « Révolutionnez votre startup ! », « solution clé en main innovante », « 🚀 ».

---

## VISUAL FOUNDATIONS

**Idée** : un cahier des charges rendu visible. La précision de l'ingénierie (grille, étiquettes mono, chiffres tabulaires) sur un papier chaud, avec une seule couleur audacieuse : l'orange **Signal**.

**Couleurs**
- *Encre* `#17181A` : texte, boutons primaires, cartes inversées. *Papier* `#F6F3EE` : fond de page, chaud, jamais blanc pur. *Blanc* `#FFFFFF` : cartes, champs, popovers posés sur le papier.
- *Signal* `#E2531B` : la couleur de marque. Logo (barre du socle), bouton `brand`, anneau de focus, indicateur de navigation active, donnée mise en avant. Texte orange : toujours `--brand-text` `#B4400F` (5,2:1). Signal 500 ne porte que du texte encre (4,6:1), jamais du blanc.
- *Forêt* `#1E5B43` : couleur secondaire (rappel de l'arbre d'Aldaron), surtout en données (`--chart-2`).
- Neutres *Pierre* : gris chauds légèrement jaunes. Pas de gris bleuté.
- Sémantiques : succès vert, avertissement ambre, erreur rouge, information bleu ; chacun en texte foncé sur fond doux (`--success` / `--success-subtle`…), tous ≥ 5:1.
- Proportions indicatives : 70 % papier/blanc, 25 % encre, ≤ 5 % Signal.

**Typographie** : Familjen Grotesk pour tout le texte (titres 700, interlettrage négatif croissant avec la taille, jusqu'à -0,035em) ; IBM Plex Mono pour les étiquettes en capitales (12 px, +0,08em), les prix, les dates, les codes, les en-têtes de tableau. Corps 16/1,55, mesure maximale 68 caractères. Échelle : 72 · 56 · 40 · 32 · 24 · 20 · 18 · 16 · 14 · 12.

**Espacement** : base 4 px. Contrôles de 44 px (cible tactile), 36 px en barre d'outils, 52 px pour les appels principaux. Cartes : padding 24 (16 en dense). Sections marketing : 96 px. Conteneur 1200 px, gouttière 24.

**Fonds** : aplats uniquement. Pas de dégradé, de texture, de motif ni d'illustration décorative. La seule trame autorisée : des filets verticaux fins (`--border`, tous les 80 px) en fond de visuels de marque (image OG), rappel de la grille. Pas d'image plein cadre par défaut ; les captures produit sont posées dans des cartes à bordure.

**Bordures** : 1 px `--border` partout ; `--input` (plus foncé) pour les contrôles. 2 px uniquement pour l'indicateur d'onglet actif. Pas de bordure colorée latérale sur les cartes.

**Rayons** : petits. 4 px (cases, badges carrés), 6 px (boutons, champs), 8 px (cartes, menus), 12 px (dialogues), pilule pour badges et interrupteurs.

**Ombres** : quasi absentes. Une carte se détache par sa bordure, pas par une ombre. `shadow-sm` pour l'onglet pill actif et le pouce du switch ; `shadow-lg` réservée à ce qui flotte (menu, select, dialogue, toast). Teinte encre, jamais noire pure en clair.

**Cartes** : fond blanc, bordure 1 px, rayon 8 px, pas d'ombre. Variante inversée (encre) pour l'offre mise en avant, une par section. Étiquette mono au-dessus du titre (« SOCLE »).

**Survol** : les fonds pleins s'éclaircissent vers le fond de page (`color-mix` 86 %) ; les boutons outline et ghost prennent le fond `--muted` ; les bordures de champs foncent. Les liens passent de Signal à Encre. Pas de changement d'opacité au survol.

**Appui** : translation de 1 px vers le bas, sans réduction d'échelle.

**Focus** : anneau Signal 2 px, décalé de 2 px sur le fond, sur tous les éléments interactifs au clavier (`:focus-visible`). Les champs : bordure Signal + halo à 22 %.

**Désactivé** : opacité 45 %, curseur interdit. **Erreur** : bordure et message `--destructive` avec icône.

**Mouvement** : court et fonctionnel. 120 ms (couleurs), 180 ms (menus, switch), 260 ms (dialogue, toast), `cubic-bezier(.2,.7,.2,1)`. Entrées en fondu + 4 à 8 px de translation. Aucun rebond, aucune animation en boucle hors spinner. `prefers-reduced-motion` coupe les entrées.

**Transparence et flou** : uniquement la barre du haut du back-office (fond à 92 % + flou 8 px) et le voile des dialogues (encre à 48 %).

**Mise en page** : grilles strictes, alignement à gauche, beaucoup d'air. Barre latérale fixe de 248 px dans le back-office ; barre du haut collante de 64 px.

**Imagerie** : aucune fournie. Si des photos sont ajoutées : lumière naturelle, tons chauds, équipes au travail réelles ; pas de banque d'images « startup » générique.

---

## ICONOGRAPHY

- **Bibliothèque** : [Lucide](https://lucide.dev) (`lucide-react`), cohérente avec shadcn/ui. Pas d'icônes sur mesure.
- **Trait** : 1,75 px (2 px en dessous de 16 px). Extrémités et jointures arrondies, `currentColor`.
- **Tailles** : 16 px (tableaux, menus, badges), 18–20 px (navigation, boutons), 24 px (marketing). Grille 24 × 24.
- **Couleur** : celle du texte voisin ; `--muted-foreground` pour les icônes décoratives. Signal seulement pour une icône d'état actif.
- **Usage** : une icône accompagne un libellé, elle ne le remplace pas — sauf boutons `icon` connus (paramètres, plus, fermer), toujours avec `aria-label`.
- **Emoji et caractères Unicode comme icônes** : jamais (hors flèche → dans le texte courant).
- Dans les maquettes HTML : `https://unpkg.com/lucide-react@0.460.0/dist/umd/lucide-react.min.js` (global `LucideReact`).

## Logo

Symbole : trois barres empilées, de la plus courte à la plus large. La barre du bas, en Signal, est **le socle** ; les deux du dessus sont les couches ajoutées par chaque projet. Le profil évoque aussi un arbre (Aldaron). Logotype : « Aldaron » en Familjen Grotesk 700, vectorisé.

- Versions : horizontale (défaut), empilée (formats carrés), symbole seul (favicon, avatar). Chacune en clair, sombre, monochrome (`currentColor`).
- Zone de protection : 60 % de la hauteur du logo autour. Taille minimale : 96 px de large (horizontal), 16 px (symbole).
- Interdits : déformer, pivoter, recolorer la barre Signal, ajouter une ombre, poser sur un fond chargé.
- **Statut** : proposition. Vérifier la disponibilité du nom (voir le document de vision) avant tout dépôt.
