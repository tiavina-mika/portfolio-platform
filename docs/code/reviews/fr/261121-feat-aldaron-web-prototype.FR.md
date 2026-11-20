# Revue — Prototype du site Aldaron

- **Branche** : `feat/aldaron-web-prototype`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : tiavina-mika — `tiavinamika@gmail.com` *(GitHub : `tiavina-mika`)*
- **Créée le** : 2026-11-21 à 02:32
- **Applications touchées** : site (`apps/aldaron-web`) uniquement — ni serveur, ni back-office, ni bibliothèque partagée

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Site](#site)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Ce qu'il reste à faire](#ce-quil-reste-à-faire)

## En bref

Le site Aldaron suit désormais le prototype Aldaron. Un visiteur peut lire l'offre à prix fixe, voir les prix par écran, essayer un simulateur de prix, parcourir des projets d'exemple, découvrir qui est Aldaron et demander un devis — en français, en anglais et en malgache. Tous les prix sont écrits en euros et peuvent s'afficher en dollars ou en ariary grâce à un sélecteur de devise dans la barre de navigation. Les pages issues du modèle du site portfolio (pages de détail des projets, recherche, téléchargement du CV, articles de l'accueil) ont disparu de ce site. Un seul commit, 263 fichiers, presque tous dans `apps/aldaron-web` ; le reste, ce sont les docs fonctionnelles en français, le changeset et une ligne dans la liste des services.

## Base de données

Aucun changement de base de données. La demande de devis est enregistrée comme un `Contact` ordinaire : les réponses supplémentaires du formulaire (produit, supports, ce que le visiteur apporte, besoins, estimation du simulateur, noms des fichiers choisis) sont écrites en lignes de son `message`, coupé aux 1 000 caractères qu'un `Contact` accepte. Aucune classe, aucun champ, aucun index n'a été ajouté.

## Serveur

Aucun code serveur modifié. Le site appelle toujours la Cloud Function existante `createPublicContact` (reCAPTCHA vérifié là) et garde sa propre limite de débit par visiteur. Nouveau service externe, listé dans `docs/services/README.md` : deux API gratuites de taux de change (`open.er-api.com`, puis la copie jsDelivr de `fawazahmed0/currency-api`), appelées **depuis le navigateur du visiteur**, sans clé, sans nouvelle variable d'environnement.

## Back-office

Aucun changement du back-office. L'équipe reçoit les demandes de devis dans la liste habituelle des contacts, avec les réponses écrites dans le message (en anglais, quelle que soit la langue du visiteur).

## Site

- **Pages touchées** (langue par défaut `fr`) : accueil `/fr`, offre et prix `/fr/offre-et-prix`, simulateur de prix `/fr/simulateur`, réalisations `/fr/projets`, à propos `/fr/a-propos`, contact `/fr/contact`, mentions légales `/fr/mentions-legales`, confidentialité `/fr/confidentialite`. L'anglais et le malgache utilisent `/en/pricing`, `/en/simulator`, `/en/projects`, `/en/about`, `/en/contact`, `/en/legal-notice`, `/en/privacy` (et `/mg/…`, mêmes chemins).
- Le **malgache** est une nouvelle langue du site (`mg`), avec tous ses fichiers de traduction.
- **Navigation, pied de page, langue, thème et devise** : un sélecteur de devise (euro par défaut ; le choix est mémorisé dans le navigateur ; taux gardés 12 heures ; taux de repli fixes quand les deux services de taux sont indisponibles).
- **Simulateur** : une estimation qui se met à jour à chaque réponse, un résumé copiable et un bouton « demander un devis » qui transmet le résumé au formulaire de contact.
- **Contact** : un formulaire de demande de devis (nom, e-mail, produit, supports, ce que le visiteur apporte, besoins, fichiers facultatifs, consentement). L'ancien champ téléphone n'est plus demandé.
- **Réalisations** : dix projets **d'exemple** avec filtres et pagination ; leurs pages de détail n'existent plus.
- **Retiré de ce site** : pages de détail des projets et leur sitemap, bloc d'articles de l'accueil, téléchargement du CV, recherche, anciens blocs du pied de page.
- Le **sitemap** liste maintenant les huit pages statiques avec leur adresse dans chaque langue.
- Docs fonctionnelles : [docs/features/aldaron-web/](../../../features/aldaron-web/README.md) (accueil, offre et prix, simulateur, réalisations, à propos, contact, mentions légales, confidentialité, navigation).
- **Corrigé pendant cette revue** : la page de confidentialité dit maintenant que le choix de devise et les taux sont gardés dans le navigateur, et que le navigateur interroge directement deux services gratuits de taux (voir le tableau plus bas) ; et quatre erreurs ESLint (une assertion de type inutile) dans les layouts de about, legal, privacy et projects, qui faisaient échouer `aldaron-web:lint:check`.

## Voir le résultat en local

```bash
pnpm nx run aldaron-web:dev   # le site, http://localhost:9013
pnpm nx run aldaron-web:sb    # Storybook, http://localhost:6017
```

Pages (port 9013) :

- [Accueil](http://localhost:9013/fr) · [Offre et prix](http://localhost:9013/fr/offre-et-prix) · [Simulateur](http://localhost:9013/fr/simulateur) · [Réalisations](http://localhost:9013/fr/projets)
- [À propos](http://localhost:9013/fr/a-propos) · [Contact](http://localhost:9013/fr/contact) · [Mentions légales](http://localhost:9013/fr/mentions-legales) · [Confidentialité](http://localhost:9013/fr/confidentialite)
- Malgache : [accueil](http://localhost:9013/mg) · [prix](http://localhost:9013/mg/pricing)

Stories (port 6017) — 31 nouveaux fichiers de stories ; celles qui montrent du neuf :

- [Sélecteur de devise](http://localhost:6017/?path=/story/containers-currency-currencyselect--default) — le menu euro / dollar / ariary
- [Prix](http://localhost:6017/?path=/story/containers-currency-price--default) — un prix converti
- [Simulateur](http://localhost:6017/?path=/story/containers-simulator-simulator--default) · [commande minimum](http://localhost:6017/?path=/story/containers-simulator-simulator--minimum-order-of-the-web) · [demander un devis](http://localhost:6017/?path=/story/containers-simulator-simulator--request-quote) · [copier le résumé](http://localhost:6017/?path=/story/containers-simulator-simulator--copy-summary)
- Formulaire de contact : [vide](http://localhost:6017/?path=/story/containers-contact-contactformcontent--empty) · [avec erreurs](http://localhost:6017/?path=/story/containers-contact-contactformcontent--with-errors) · [avec l'estimation du simulateur](http://localhost:6017/?path=/story/containers-contact-contactformcontent--with-simulator-estimate) · [envoyé](http://localhost:6017/?path=/story/containers-contact-contactformcontent--sent) · [échec](http://localhost:6017/?path=/story/containers-contact-contactformcontent--failed) · [hors ligne](http://localhost:6017/?path=/story/containers-contact-contactformcontent--offline)
- [Document légal](http://localhost:6017/?path=/story/containers-legal-legaldocument--legal-document)
- [Pied de page](http://localhost:6017/?path=/story/components-footer--footer)

Contrôles lancés sur cette branche : `pnpm check-i18n`, `pnpm nx run aldaron-web:typecheck`, `pnpm nx run aldaron-web:lint:check` (après les quatre corrections ci-dessus), `pnpm check-doc-twins --worktree`, `pnpm check-doc-links` et `pnpm lint:docs` passent tous. **Non lancés** : le build de production, `test-storybook` (les tests navigateur des stories) et un passage manuel dans un navigateur. Voir le dernier risque ci-dessous.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🔴 Haute | Faille | Les mentions légales et la politique de confidentialité publient des champs à compléter (`[à compléter]` : forme juridique, identifiants fiscaux, siège, directeur de la publication, hébergeur, durée de conservation, cookies, date de mise à jour) dans les trois langues. Elles sont indexées (sitemap) et le visiteur consent au texte de confidentialité en envoyant le formulaire | Dès que le site est public | ⛔ bloque la mise en production — il faut les vraies informations de l'entreprise, [dette n°1](debt/261121-feat-debt-aldaron-web-prototype.FR.md#1-pages-légales-et-confidentialité-encore-incomplètes) |
| 🔴 Haute | Faille | La page de confidentialité ne disait pas que le navigateur de chaque visiteur appelle deux services tiers de taux de change (ils voient l'adresse IP) et garde le choix de devise et les taux dans son stockage | À chaque première visite (les taux sont récupérés au chargement, même si le visiteur ne choisit jamais une autre devise) | ✅ corrigé sur la branche : deux lignes ajoutées à la partie « Stockage dans votre navigateur » en `fr`/`en`/`mg`, et la doc fonctionnelle de la confidentialité mise à jour |
| 🟡 Faible | Bug | Le formulaire de contact laisse choisir jusqu'à dix fichiers, mais ils ne sont jamais envoyés : seuls leurs noms parviennent à l'équipe, et rien à l'écran ne le dit au visiteur. Le texte de confidentialité cite aussi les « pièces jointes » parmi les données reçues | Tout visiteur qui joint un fichier en croyant qu'il est arrivé | ⏳ reporté — décision produit, [dette n°2](debt/261121-feat-debt-aldaron-web-prototype.FR.md#2-pièces-jointes-proposées-mais-jamais-envoyées) |
| 🟡 Faible | Régression | Le build d'`aldaron-web` est volontairement absent de la CI (il lit du contenu réel qu'aucun runner ne peut joindre), et ses tests de stories aussi : seul le typecheck le couvre, alors que cette branche a réécrit la plus grande partie du site. Le commit lui-même mentionne un échec de prérendu de production corrigé à la main, et le typecheck ne peut pas détecter ce genre d'erreur | Toute modification ultérieure qui casse le prérendu de production n'est vue qu'au déploiement | ⏳ reporté — [dette n°3](debt/261121-feat-debt-aldaron-web-prototype.FR.md#3-build-et-tests-daldaron-web-absents-de-la-ci) |
| 🟡 Faible | Bug | Si les deux services de taux sont indisponibles, les prix sont convertis avec des taux fixes (`USD 1,08`, `MGA 4900`) sans que rien ne le dise ; les taux stockés sont aussi relus sans vérifier leur forme | Un visiteur en dollars ou en ariary pendant que les services sont injoignables | ⏳ reporté — [dette n°4](debt/261121-feat-debt-aldaron-web-prototype.FR.md#4-taux-de-repli-silencieux-et-taux-stockés-non-vérifiés) |
| 🟡 Faible | Bug | Les dix « réalisations livrées » (noms, prix, délais) sont des données d'exemple présentées comme du travail réel, avec un espace réservé à la place des captures d'écran | Tout visiteur de la page des réalisations ou du bloc de l'accueil | ⏳ reporté — contenu, [dette n°5](debt/261121-feat-debt-aldaron-web-prototype.FR.md#5-projets-dexemple-présentés-comme-des-réalisations) |

Pas un risque, mais bon à savoir : les anciennes adresses de détail des projets et le sitemap des projets n'existent plus, donc tout lien vers elles donne une 404. Le site n'est pas dans le build de la CI, il n'est donc probablement pas encore public ; s'il l'est, ajouter des redirections.

Fichier de dette : [261121-feat-debt-aldaron-web-prototype.FR.md](debt/261121-feat-debt-aldaron-web-prototype.FR.md).

## Ce qu'il reste à faire

- Renseigner les textes légaux et de confidentialité (dette n°1) avant tout déploiement en production.
- Décider du sort des pièces jointes (dette n°2).
- Trouver un moyen de vérifier le prérendu de production d'`aldaron-web` ailleurs qu'au déploiement (dette n°3).
- Lancer les tests des stories et un passage manuel dans un navigateur : aucun des deux n'a été fait pour cette revue.
- De vrais projets et de vraies captures à la place des exemples (dette n°5).
