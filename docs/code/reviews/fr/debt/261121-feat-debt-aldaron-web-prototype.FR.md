# Dette — Prototype du site Aldaron

> Revue : [261121-feat-aldaron-web-prototype.FR.md](../261121-feat-aldaron-web-prototype.FR.md)
> Branche : `feat/aldaron-web-prototype` · Créée le 2026-11-21 à 02:32 · Auteur : `tiavinamika@gmail.com`
> Statut global : ⏳ à faire

## Table des matières

- [Résumé](#résumé)
- [1. Pages légales et confidentialité encore incomplètes](#1-pages-légales-et-confidentialité-encore-incomplètes)
- [2. Pièces jointes proposées mais jamais envoyées](#2-pièces-jointes-proposées-mais-jamais-envoyées)
- [3. Build et tests d'aldaron-web absents de la CI](#3-build-et-tests-daldaron-web-absents-de-la-ci)
- [4. Taux de repli silencieux et taux stockés non vérifiés](#4-taux-de-repli-silencieux-et-taux-stockés-non-vérifiés)
- [5. Projets d'exemple présentés comme des réalisations](#5-projets-dexemple-présentés-comme-des-réalisations)

## Résumé

| # | Gravité | Type | Risque | Statut |
|---|---|---|---|---|
| 1 | 🔴 Haute | Faille | Mentions légales et politique de confidentialité publiées avec des `[à compléter]` — ⛔ bloque la mise en production | ⏳ à faire |
| 2 | 🟡 Faible | Bug | Le formulaire de contact accepte des fichiers qui ne sont jamais envoyés, sans le dire au visiteur | ⏳ décision produit |
| 3 | 🟡 Faible | Régression | Le prérendu de production et les tests des stories d'`aldaron-web` ne sont vérifiés par personne avant un déploiement | ⏳ à faire |
| 4 | 🟡 Faible | Bug | Taux de change de repli fixes utilisés en silence ; taux stockés relus sans vérification | ⏳ à faire |
| 5 | 🟡 Faible | Bug | Projets d'exemple présentés comme des réalisations livrées | ⏳ décision produit |

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

## 2. Pièces jointes proposées mais jamais envoyées

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ décision produit
- **Concerné** : `apps/aldaron-web/containers/contact/ContactForm.tsx`, `ContactFiles.tsx`, `utils/contact.utils.ts` (`composeQuoteMessage`, `addQuoteFiles`), `translations/*/contact.json`, `translations/*/privacy.json`

**Ce qui peut arriver** — un visiteur joint un cahier des charges en PDF, envoie le formulaire, voit la confirmation et attend la réponse de quelqu'un qui n'a jamais reçu le fichier. L'équipe ne voit que « Attachments (names only, the files were not received) » dans le message. Le texte de confidentialité cite aussi les « pièces jointes » parmi les données reçues. La limite est écrite dans la documentation fonctionnelle de la page de contact, mais nulle part où le visiteur peut la lire.

**Pourquoi** — la classe `Contact` n'a pas de champ fichier et `createPublicContact` n'en prend aucun ; le formulaire a été construit d'après le prototype, qui contient le sélecteur.

**Comment vérifier** — dans [la story du formulaire](http://localhost:6017/?path=/story/containers-contact-contactformcontent--empty) ou sur la page, ajouter un fichier et envoyer : la demande arrive avec le nom du fichier dans le message seulement.

**Comment corriger**

1. **(recommandé)** Masquer le sélecteur de fichiers tant que l'envoi n'existe pas, et retirer « pièces jointes » du texte de confidentialité (et de son pendant dans les docs fonctionnelles).
   *Pourquoi* : cela retire la fausse promesse avec le plus petit changement, sans nouvelle surface côté serveur (un envoi public demande des limites de taille, un antivirus et un stockage : c'est un projet à part), et le visiteur peut toujours décrire son besoin dans les champs texte ou répondre au premier e-mail avec le fichier.
2. Garder le sélecteur et ajouter une ligne visible dessous : « Les fichiers ne sont pas encore envoyés — envoyez-les par e-mail à contact@aldaron.eu » (nouvelle clé en `fr`/`en`/`mg`). Honnête, mais montre un contrôle qui ne fait pas son travail.
3. Construire l'envoi : une Cloud Function qui reçoit le fichier (type et taille vérifiés, limite de débit, reCAPTCHA), un `Parse.File` lié au `Contact`, et le fichier affiché dans la fiche contact du back-office. La bonne réponse à long terme, mais le plus gros changement (serveur + back-office + site).

## 3. Build et tests d'aldaron-web absents de la CI

- **Gravité** : 🟡 Faible · **Type** : Régression · **Statut** : ⏳ à faire
- **Concerné** : `.github/workflows/ci.yml` (`--exclude=web,aldaron-web` sur le build et `--exclude=server,web,aldaron-web` sur les tests), `apps/aldaron-web`

**Ce qui peut arriver** — une modification casse le prérendu de production (`cacheComponents` refuse une page qui lit la requête hors d'une zone en cache, comme cela est arrivé aux écrans de chargement de about, legal, privacy et projects pendant cette branche) et personne ne le voit avant l'échec d'un déploiement. Le typecheck, lui exécuté, ne peut pas le détecter. Les 31 fichiers de stories ajoutés par la branche ne sont pas non plus exécutés comme tests navigateur.

**Pourquoi** — le build est volontairement exclu : `next build` prérend les pages et lit du contenu réel dans Parse, qu'aucun runner ne peut joindre. La raison est valable pour les pages qui lisent la base ; les pages statiques du prototype, non.

**Comment vérifier** — lancer `pnpm nx run aldaron-web:build` en local avec le réseau disponible (les polices sont téléchargées au build) et comparer avec ce que couvre la CI.

**Comment corriger**

1. **(recommandé)** Lancer le build dans la CI avec les requêtes de contenu qui répondent depuis un jeu de données factice quand aucun serveur Parse n'est joignable (un drapeau d'environnement lu par `getDataForUrls` et les autres requêtes), et lancer `aldaron-web:test-storybook` dans le même job que celui de `web`.
   *Pourquoi* : le site est désormais surtout statique, donc le build est le seul contrôle qui attrape les erreurs de prérendu ; un jeu factice garde la CI libre de tout serveur réel.
2. Ajouter une étape manuelle « avant déploiement » à la checklist de release qui lance le build — peu coûteux, mais dépend de la mémoire de quelqu'un.
3. Retirer l'exclusion du build et donner au runner accès à une API Parse de préproduction — résultat exact, mais lie la CI à un service réel et à ses secrets.

## 4. Taux de repli silencieux et taux stockés non vérifiés

- **Gravité** : 🟡 Faible · **Type** : Bug · **Statut** : ⏳ à faire
- **Concerné** : `apps/aldaron-web/providers/CurrencyProvider.tsx`, `utils/currency.utils.ts` (`fetchRates`, `readRates`), `utils/constants.ts` (`FALLBACK_RATES`)

**Ce qui peut arriver** — les deux services sont injoignables (réseau filtré, panne) : le visiteur qui a choisi l'ariary voit des prix calculés à un taux fixe de `4900` Ar pour un euro, sans indication qu'ils peuvent être faux. Par ailleurs, les taux stockés sont lus avec `JSON.parse` et utilisés sans vérifier leur type, et la réponse n'est pas vérifiée comme un succès HTTP : un `{ "USD": "x" }` stocké, ou une API qui répond une chaîne, donne des prix `NaN`.

**Pourquoi** — le repli a été pensé pour que la page continue de fonctionner ; l'échec n'est pas signalé. Les prix sont indicatifs et le prix en euros fait foi (les pages le disent), d'où la gravité faible.

**Comment vérifier** — dans le navigateur, bloquer `open.er-api.com` et `cdn.jsdelivr.net`, choisir l'ariary et lire un prix ; ou mettre `localStorage['aldaron-rates']` à `{"savedAt":<maintenant>,"USD":"a","MGA":null}` et recharger.

**Comment corriger**

1. **(recommandé)** Valider en un seul endroit : un contrôle `isValidRate` (nombre fini supérieur à zéro) utilisé par `readRates` et `readStoredRates`, un contrôle `response.ok` dans `fetchRates`, et une courte mention « taux indicatif » à côté du sélecteur uniquement quand les taux de repli sont utilisés. Ajouter les tests unitaires (`convertPrices` / `readRates` avec des entrées invalides).
   *Pourquoi* : petit et local, supprime le prix `NaN`, et dit la vérité au visiteur dans le seul cas où cela compte.
2. Valider seulement (sans mention) — corrige le `NaN`, laisse les taux fixes silencieux.
3. Récupérer les taux côté serveur par une route mise en cache — un seul appel pour tous les visiteurs, aucune adresse IP envoyée à un tiers (cela répond aussi à une partie du sujet confidentialité), mais ajoute une route serveur et un cache à maintenir.

## 5. Projets d'exemple présentés comme des réalisations

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
