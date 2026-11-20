# Règles de design — Studies et versions définitives

## Principe général

**Suivre fidèlement la structure du code** : dossiers, sous-dossiers, noms de fichiers, noms de composants, découpage `components/` / `containers/` / `pages/`. Chaque maquette a un équivalent exact dans le code, au même endroit et sous le même nom. Si le code n'a pas de composant pour un élément, ne crée pas de maquette qui prétend en être un.

## Vocabulaire

- **Study** : un fichier HTML qui compare 3 ou 4 variantes d'un même cas.
- **Tour** : une itération de design, numérotée (Tour 1, Tour 2…). Un tour contient plusieurs écrans, nommés `1a`, `1b`, `1c`… (le chiffre est le tour, la lettre est la variante). **Les tours les plus récents sont placés en haut** : Tour 3, puis Tour 2, puis Tour 1.
- **Version définitive** : le HTML final et interactif, construit à partir de la variante recommandée.

## 1. Study (`*.study.dc.html`)

**Nom du fichier** : identique au composant, avec le suffixe `.study`.
Exemple : composant `Button` → `Button.study.dc.html`.

**Contenu** : un seul HTML qui regroupe plusieurs sections « Tour N ».

**Ordre des tours** : du plus récent au plus ancien, de haut en bas. Un nouveau tour est toujours ajouté **au-dessus** des précédents, jamais en dessous. Les tours précédents restent dans le fichier, inchangés.

```text
Tour 3   ← le plus récent, en haut
Tour 2
Tour 1   ← le plus ancien, en bas
```

**Dans chaque tour**, 3 ou 4 variantes du même cas :

- **La variante actuelle** : celle qui existe dans le code. Elle est toujours présente et porte la mention **(actuel)**.
- **Les autres variantes** : des propositions alternatives.
- **La variante recommandée** : une seule par tour, avec la mention **(recommandé)**.
  Exemple de titre : `1c (recommandé)`.

**Disposition des variantes** : côte à côte seulement si elles sont petites (composant isolé, carte). Si une variante est large (page, écran complet, plus de ~800 px de large), les variantes sont empilées verticalement : `1a`, puis `1b` en dessous, puis `1c`… jamais à droite.

**Chaque variante contient**, sous son titre, un bloc « Avantages et inconvénients » :

- Avantages : texte **vert**, chaque ligne commence par `+`.
- Inconvénients : texte **rouge**, chaque ligne commence par `-`.

Les couleurs vert et rouge viennent des tokens du thème (succès / erreur), jamais d'une valeur en dur. Elles doivent rester lisibles en dark et en light mode.

## 2. Version définitive (`*.dc.html`)

**Déclencheur** : quand je dis « créer la version définitive », génère le HTML à partir de la variante marquée **(recommandé)** du tour le plus récent.
Exemple : `Button.study.dc.html` → `Button.dc.html`.

**Elle doit être interactive** (vrais états hover, focus, clic, ouverture/fermeture… pas une image figée).

**Elle contient un panneau de tweaks, présent dans le HTML lui-même** (pas dans un outil externe ni dans une interface séparée). Le fichier garde donc ses tweaks quand il est ouvert seul, ou téléchargé :

- **Tweaks propres au composant** : props, cas possibles, états (disabled, loading, error, empty, vide, plein…).
- **Tweaks par défaut, toujours présents** :
  - Thème : dark / light.
  - Langue : `fr`, `en`, `mg`.
  - Breakpoint : mobile, tablette, desktop, grand desktop.

## 3. Téléchargement

**Déclencheur** : quand je dis « download », fournis **un seul fichier HTML autonome** :

- Le CSS est dans une balise `<style>` et le JS dans une balise `<script>`, tous deux dans le même fichier.
- Le CSS est **lisible** : indenté, non minifié, organisé en sections commentées (variables/tokens, base, composant, états, responsive).
- Le panneau de tweaks fonctionne dans le fichier téléchargé.
- Jamais de zip, ni de fichiers `.html`, `.js` et `.css` séparés.

## 4. Structure des fichiers

**La structure doit suivre exactement celle du code**, à l'intérieur d'un dossier de design : mêmes dossiers, mêmes sous-dossiers, mêmes noms.

```text
components/button/Button.study.dc.html
components/button/Button.dc.html
containers/project/ProjectCard.dc.html
pages/home/Home.dc.html
```

- `components/` : composants génériques, sans logique métier.
- `containers/` : composants liés à un domaine ou à une page, selon la même séparation que le code.
- `pages/<page>/` : la page complète, par exemple `pages/home/Home.dc.html`.

Règles à respecter :

- Le chemin et le nom d'une maquette sont ceux du fichier de code correspondant. Seul le suffixe change (`.tsx` → `.dc.html`).
- Un composant générique va dans `components/`, un composant lié à un domaine ou à une page va dans `containers/`. Ne mélange jamais les deux.
- Les noms de dossiers de domaine sont au singulier (`containers/project/`), comme dans le code.
- Si tu ne connais pas l'emplacement exact dans le code, demande-le avant de créer le fichier. Ne l'invente pas.

## 5. Réutilisation

- Une page **assemble** les composants et containers existants. Elle ne redéfinit jamais leur HTML ni leur style.
- Tout HTML qui n'est pas une page est un composant ou un container réutilisable. Il est créé une seule fois, puis réutilisé dans les pages.
- Si un composant change, toutes les pages qui l'utilisent doivent être mises à jour avec lui.
