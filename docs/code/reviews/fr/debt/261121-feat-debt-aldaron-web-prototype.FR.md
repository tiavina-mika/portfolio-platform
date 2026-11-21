# Dette — Prototype du site Aldaron

> Revue : [261121-feat-aldaron-web-prototype.FR.md](../261121-feat-aldaron-web-prototype.FR.md)
> Branche : `feat/aldaron-web-prototype` · Créée le 2026-11-21 à 02:32 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Pages légales et confidentialité encore incomplètes](#1-pages-légales-et-confidentialité-encore-incomplètes)
- [2. Projets d'exemple présentés comme des réalisations](#2-projets-dexemple-présentés-comme-des-réalisations)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🔴 Haute | Faille | Mentions légales et politique de confidentialité publiées avec des `[à compléter]` — ⛔ bloque la mise en production | ⏳ à faire |
| 2 | 🟡 Faible | Bug | Projets d'exemple présentés comme des réalisations livrées | ⏳ décision produit |

## 1. Pages légales et confidentialité encore incomplètes

- **Gravité** : 🔴 Haute · **Type** : Faille · **Statut** : ⏳ à faire — ⛔ bloque la mise en production (pas la fusion dans `develop`)
- **Concerné** : `apps/aldaron-web/translations/{fr,en,mg}/legal.json`, `apps/aldaron-web/translations/{fr,en,mg}/privacy.json`, `docs/features/aldaron-web/legal/fr/`

**Ce qui peut arriver** — le site devient public. `/fr/mentions-legales` affiche « Forme juridique et capital : [à compléter] », « NIF/STAT : [à compléter] », « Siège social », « Directeur de la publication », « Hébergeur » et « Dernière mise à jour : [à compléter] ». `/fr/confidentialite` n'indique ni durée de conservation, ni destinataires, ni partie cookies, alors que le formulaire de contact demande au visiteur de consentir à ce texte. Les deux pages sont dans le sitemap : elles sont donc indexées en l'état.

**Pourquoi** — les textes ont été écrits comme un squelette : les informations que seul le propriétaire de l'entreprise connaît sont restées en champs à compléter. Ce n'est pas un défaut de code, mais le code les publie tels quels. La partie cookies est une vraie obligation, pas du remplissage : le site charge Google Analytics 4 et une bannière de consentement quand `NEXT_PUBLIC_GA_MEASUREMENT_ID` est renseignée, le texte doit donc nommer cet outil et le cookie `cookie_consent`.

**Comment vérifier** — ouvrir les deux pages dans chaque langue et chercher `[`.

**Comment corriger**

1. **(recommandé)** Renseigner les textes avec les vraies informations de l'entreprise, puis ajouter un garde-fou pour que cela ne se reproduise pas : un test (ou un script du type `check-i18n`) qui échoue quand une valeur de `translations/**/legal.json` ou `privacy.json` contient `[à compléter]`, `[to be completed]` ou `[ampidirina]`.
   *Pourquoi* : le contenu légal est obligatoire pour un site d'entreprise public en français et en malgache et seul le propriétaire peut le fournir ; le garde-fou coûte quelques lignes et empêche un champ à compléter d'arriver à nouveau en production.
2. Renseigner les textes à la main sans garde-fou — plus rapide, mais une nouvelle langue ou une modification peut réintroduire un champ sans que personne ne le voie.
3. Passer les deux pages en `noindex` et masquer les liens du pied de page jusqu'à ce qu'elles soient remplies — cache le problème sans le résoudre, et le formulaire de contact renvoie toujours vers le texte de confidentialité.

## 2. Projets d'exemple présentés comme des réalisations

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ décision produit
- **Concerné** : `apps/aldaron-web/utils/project.constants.ts`, `utils/home.constants.ts`, `translations/*/projects.json`, `translations/*/home.json`, `docs/features/aldaron-web/projects/fr/PROJECTS.FR.md`

**Ce qui peut arriver** — la page des réalisations et le bloc de l'accueil montrent dix produits (« Tsara Livraison », « Fanilo Santé »…) avec des délais et des prix comme du travail livré, avec une zone rayée à la place de la capture d'écran. Un prospect, ou un contrôle de protection des consommateurs, les lit comme des références qui n'existent pas.

**Pourquoi** — le prototype est une maquette : les données sont un texte provisoire resté dans le code. La documentation fonctionnelle dit « données d'exemple » ; la page, non.

**Comment vérifier** — ouvrir `/fr/projets`.

**Comment corriger**

1. **(recommandé)** Avant que le site soit public, remplacer les données d'exemple par les vrais projets livrés (ou retirer la page des réalisations et le bloc de l'accueil tant qu'il n'y en a pas), et garder une ligne sur la page si certains restent des exemples : « Exemples illustratifs ».
   *Pourquoi* : une liste de références est une affirmation commerciale ; montrer des clients inventés est ce qui nuit le plus à la confiance et peut poser un problème juridique, et les vraies données ne coûtent que du contenu.
2. Garder les exemples et les étiqueter « Exemples » sur la page et le bloc de l'accueil — honnête et rapide, mais faible comme page commerciale.
3. Lire les projets depuis le back-office (la collection `Project` que le portfolio a déjà) — la réponse à long terme, mais elle demande une correspondance entre les deux formes de données et une décision sur les projets montrés sur ce site.
