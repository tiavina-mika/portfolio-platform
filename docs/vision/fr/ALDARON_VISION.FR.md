# Aldaron — vision de la société

## Table des matières

- [L'idée en une phrase](#lidée-en-une-phrase)
- [Positionnement](#positionnement)
- [Le socle à 2 000 €](#le-socle-à-2-000-)
  - [Ce qui est inclus](#ce-qui-est-inclus)
  - [Ce qui n'est pas inclus](#ce-qui-nest-pas-inclus)
- [La formule minimum à 1 000 €](#la-formule-minimum-à-1-000-)
- [Les leviers de prix](#les-leviers-de-prix)
- [L'application mobile](#lapplication-mobile)
  - [Contenu du socle mobile](#contenu-du-socle-mobile)
  - [Prix des écrans mobiles](#prix-des-écrans-mobiles)
  - [Publication sur les stores](#publication-sur-les-stores)
- [Exemples de devis](#exemples-de-devis)
- [Le template est l'actif principal](#le-template-est-lactif-principal)
- [Vérification économique](#vérification-économique)
- [Risques et points faibles](#risques-et-points-faibles)
- [Questions ouvertes](#questions-ouvertes)
- [Prompt pour Claude Design](#prompt-pour-claude-design)
- [Prochaines étapes](#prochaines-étapes)

> Document d'exploration. Les chiffres sont des **hypothèses à calibrer**, pas des engagements : la section [Vérification économique](#vérification-économique) dit comment les valider. Le contenu du socle est tiré de ce que contient `1lalana-platform` aujourd'hui et doit être revérifié lors de l'extraction du template.

## L'idée en une phrase

Aldaron est une société de développement qui livre aux startups un produit web (et mobile en option) **avec l'authentification, la gestion des rôles, le CMS et un back-office déjà en place dès le premier jour**, à partir de 2 000 € pour le socle complet et d'un prix plancher de 1 000 € pour les bases seules, parce que chaque projet démarre d'un template éprouvé au lieu d'une page blanche.

> Hypothèse de lecture : le nom « Aldaron », le NIF et le STAT existent déjà (société déjà enregistrée). Si le nom est en réalité pris par un tiers, c'est à régler avant tout le reste (voir [Questions ouvertes](#questions-ouvertes)).

## Positionnement

| Question | Réponse proposée |
|---|---|
| Cible | Uniquement des startups (pré-seed à série A). Pas d'agence, pas de grand compte, pas de petit commerce |
| Promesse | Un MVP réel, avec ses outils d'administration, livré vite, sans que la startup réinvente login, rôles et back-office |
| Ce qui nous distingue | Le back-office, les rôles et le CMS ne sont pas « en phase 2 » : ils sont dans le prix du socle |
| Ce qu'on ne fait pas | Projets sous 1 000 €, sites vitrines seuls, refontes graphiques sans produit, régie à l'heure sans périmètre |
| Argument de vente | Délai et prix prévisibles : on part d'une base déjà exploitée en production, on ne facture que ce qui est spécifique |

Le plancher de 1 000 € (la formule minimum) est un filtre autant qu'un prix : il couvre environ 9 jours de travail au tarif de référence de 114 € par jour. En dessous, le temps de vente et de support dépasse ce que le projet rapporte.

## Le socle à 2 000 €

### Ce qui est inclus

Basé sur ce que `1lalana-platform` contient déjà (partie générique `_core`), à confirmer à l'extraction :

| Bloc | Contenu |
|---|---|
| Authentification | Connexion, création de compte, mot de passe oublié, invitations par email, double authentification (MFA), vérification renforcée pour les actions sensibles |
| Rôles et droits | Rôles configurables, droits par écran et par action, gestion des employés / utilisateurs du back-office |
| CMS | Pages et sections, articles, catégories, historique des versions des contenus |
| Site web public | Next.js, multilingue (**anglais et français inclus**, site et back-office), SEO de base (sitemap, robots, manifest), formulaire de contact, newsletter, thème clair / sombre |
| Back-office de base | Tableau de bord, profil, paramètres, contacts reçus, notifications, journal d'audit, statistiques simples |
| Email et SMS | Envoi d'emails transactionnels et de SMS inclus et configurés (fournisseur au choix du client), modèles de messages traduits |
| Mise en production | Environnements préproduction et production, déploiement, nom de domaine et emails transactionnels configurés |
| Durée | À partir d'**un mois** après la signature, pour le socle seul. Chaque ajout (écrans, intégrations, mobile) allonge ce délai, les maquettes ajoutant une à deux semaines, qui est annoncé dans le devis |
| Cadre | Marque du client appliquée (logo, couleurs, textes), jusqu'à **5 pages publiques sur mesure** (les pages et contenus créés dans le CMS sont illimités et gratuits) et **5 écrans back-office** propres au client, formation d'une demi-journée, 30 jours de correction de bugs après livraison |

### Ce qui n'est pas inclus

- L'application mobile.
- Les écrans et pages sur mesure au-delà des quantités du socle (le contenu géré par le CMS n'est jamais facturé).
- Toute logique métier complexe (paiement, réservation, matching, workflows).
- Les intégrations tierces (paiement, cartes, CRM…) ; l'email et le SMS sont inclus dans le socle.
- L'hébergement et la maintenance après les 30 jours.
- Le design sur mesure de zéro : le socle applique la charte du client sur un système de design existant.

## La formule minimum à 1 000 €

Le socle complet reste l'offre de référence. Quand un projet web n'a pas besoin du site public ni d'un back-office complexe, on ne vend pas le socle complet : on vend la formule minimum, qui ne contient que les bases d'un produit où l'on se connecte. Une application mobile seule ne prend pas la formule minimum : elle part de la base technique d'Entraid'ei (Expo, Supabase), et le socle mobile couvre déjà l'authentification et la mise en production (voir [L'application mobile](#lapplication-mobile)).

| Bloc | Contenu |
|---|---|
| Authentification | Connexion, création de compte, mot de passe oublié, invitations par email, double authentification (MFA), vérification renforcée pour les actions sensibles |
| Mise en production | Environnements préproduction et production, déploiement, nom de domaine configuré |
| Durée | À partir de **deux semaines** après la signature, pour la formule seule |
| Cadre | Marque du client appliquée (logo, couleurs, textes), formation d'une demi-journée, 30 jours de correction de bugs après livraison |

Le prix de 1 000 € correspond à environ 9 jours de travail au tarif de référence de 114 € par jour (voir [Vérification économique](#vérification-économique)). Rôles, CMS, site public, back-office et email / SMS ne sont pas inclus : chaque besoin se facture avec les leviers ci-dessous. Si un projet en demande plusieurs et que le total approche 2 000 €, le socle complet est plus avantageux.

## Les leviers de prix

Le socle couvre le « squelette ». Chaque ajout se facture selon **huit leviers**, du plus simple au plus variable :

| Levier | Unité | Fourchette de départ (à calibrer) |
|---|---|---|
| Page publique sur mesure | par page | à partir de 40 € (mise en page spécifique codée, selon sa complexité). Les pages et contenus créés dans le CMS sont **gratuits** et illimités |
| Écran back-office supplémentaire | par écran | 40 € (liste + formulaire standard) à 70 € (filtres, graphiques, workflow) |
| Complexité métier | par fonctionnalité | multiplicateur sur les écrans concernés : ×1 simple, ×1,5 moyenne, ×2,5 élevée |
| Intégration tierce | par service | 400 € (service simple : cartes, CRM…) à 1 200 € (service complexe : scan de document, messagerie temps réel…) ; paiement : 60 € par intégration de paiement |
| Envoi email / SMS sur mesure | par implémentation | 30 € (ex. : un email ou un SMS envoyé lors d'une notification) |
| Langue supplémentaire (au-delà de l'anglais et du français, inclus) | par langue | **10 %** du coût des écrans traduits si la langue est en alphabet latin, de gauche à droite (espagnol, allemand, malgache…) et que le client fournit les textes ; **15 %** si Aldaron traduit ou fait relire, ou si la langue demande de l'adaptation (arabe en lecture inversée, alphabet non latin, textes longs qui cassent les mises en page) |
| Design et maquettes | par écran, ou forfait | 50 % du prix de développement de l'écran maquetté (maquettes Figma validées avant le code) ; forfait de 500 à 1 000 € pour une identité et un kit d'interface propres au client |
| Application mobile | socle + écrans | socle mobile 1 000 € puis écrans à partir de 60 € avec suppléments cumulables (voir [L'application mobile](#lapplication-mobile)) |

Règles à fixer pour éviter les débats :

- **Un écran = une vue avec un objectif unique** (liste, détail, formulaire). Une modale n'est pas un écran, un onglet complexe en est un.
- La complexité est évaluée **avant** le devis, sur une grille écrite, jamais en cours de projet.
- Les frais externes (comptes développeur Apple / Google, hébergement, services tiers) sont refacturés ou payés directement par la startup.
- Tout hors-périmètre passe par un avenant chiffré.
- Le pourcentage de langue s'applique au coût des écrans et des pages sur mesure à traduire, évalué avant le devis. Le taux (10 % ou 15 %) est fixé selon la grille du levier « Langue supplémentaire ».
- Le socle n'inclut aucun design : il applique la charte du client sur le système de design existant. Les maquettes sont une option, réservée à ce qui compte (pages publiques, parcours d'inscription) ; le back-office reste sur le système de design tel quel.
- Deux tours de modifications par écran maquetté, ensuite un avenant. Les maquettes sont validées par écrit avant le code, et tout changement après validation est facturé.
- Un client peut apporter son propre designer. Une maquette qui ignore le système de design oblige à créer des composants : le multiplicateur de complexité s'applique.

## L'application mobile

### Contenu du socle mobile

| Bloc | Contenu |
|---|---|
| Projet | Application Expo configurée, marque du client appliquée (logo, couleurs, thème clair / sombre, icône et écran de démarrage), anglais et français |
| Authentification | Connexion, mot de passe oublié, MFA, comme sur le web |
| Données et droits | Avec un projet web : branchement sur le serveur existant, avec les mêmes rôles et droits que le back-office. Application mobile seule : base technique d'Entraid'ei (Supabase), sans formule minimum |
| Navigation | Onglets et pile d'écrans |
| Notifications push | L'infrastructure (réception, enregistrement des appareils). L'envoi lié à un écran précis est le supplément « service » de la grille ci-dessous |
| Environnements | Préproduction et production, version de test distribuée au client (TestFlight et test interne Google) |
| Publication | Publication initiale sur les stores (voir [Publication sur les stores](#publication-sur-les-stores)) |
| Garantie | 30 jours de correction de bugs, comme le socle web |

Ne sont pas inclus : les écrans métier, les services sur mesure (SMS, email) autres que les notifications push de base, les comptes Apple et Google et leurs frais, le mode hors ligne poussé, la maintenance après les 30 jours.

### Prix des écrans mobiles

Un prix de base et des suppléments cumulables.

| Élément | Prix |
|---|---|
| Écran de base (liste, détail, formulaire simple) | 60 € |
| + Caméra, envoi de fichier | + 10 € |
| + Service (SMS, email, notification push) | + 20 € |
| + Géolocalisation, carte | + 30 € |
| + Filtres, graphiques, workflow à étapes | + 20 € |
| + Paiement | + 120 € |

Exemples de cumul : formulaire avec notification push = 80 € ; carte et filtres = 110 € ; paiement = 180 € ; tous les suppléments sauf le paiement = 140 €. Le supplément paiement est distinct de l'intégration tierce à 60 €, qui est un service configuré une seule fois.

### Publication sur les stores

Le client crée et possède ses comptes développeur Apple et Google ; Aldaron publie dessus en tant que membre de l'équipe. Aldaron ne publie jamais sous son propre compte : transférer une application d'un compte à un autre est lourd, et la maîtrise des avis et des statistiques serait perdue.

| Prestation | Prix |
|---|---|
| Publication initiale (iOS et Android), une soumission par store et une resoumission après refus | incluse dans le socle |
| Resoumission supplémentaire après un refus dû à une demande du client | 60 € chacune |
| Publication d'une mise à jour (hors forfait de maintenance) | 40 € par store |
| Création du compte développeur Apple ou Google à la place du client (dossier D-U-N-S, vérifications) | 100 € |
| Fiches des stores traduites au-delà de l'anglais et du français | 10 % du coût des textes, comme pour les langues |

- Les frais des comptes sont refacturés sans marge : 99 $ par an pour Apple, 25 $ une fois pour Google.
- Un seul store (souvent Android pour un MVP) : le socle baisse d'environ 150 €.
- Les mises à jour sont incluses dans le forfait de maintenance mensuel.
- Les délais de validation (Apple de 1 à 3 jours, parfois plus ; Google de quelques heures à quelques jours) ne sont pas maîtrisés : à prévoir dans le planning.
- Un compte Apple organisation demande un numéro D-U-N-S, qui peut prendre des semaines : à lancer dès la signature.

## Exemples de devis

| Cas | Détail | Total |
|---|---|---|
| Plancher : connexion seule | Formule minimum (connexion, création de compte, mot de passe oublié) | **1 000 €** |
| Minimal : site + back-office d'une startup SaaS | Socle + 2 pages publiques sur mesure (80 €) | **2 080 €** |
| MVP web avec paiement | Socle + 3 écrans standard (120 €) + 2 écrans complexes (140 €) + paiement (60 €) | **2 320 €** |
| MVP web + mobile | Socle + 3 écrans standard (120 €) + 2 complexes (140 €) + paiement (60 €) + socle mobile (1 000 €) + 6 écrans mobiles de base (360 €) + 2 écrans mobiles avec carte et filtres (2 × 110 € = 220 €) | **3 900 €** |
| Application mobile seule, sans site ni back-office complexe | Socle mobile sur la base technique d'Entraid'ei (1 000 €) + écrans mobiles à la grille | **à partir de 1 000 €** |

Facturation proposée : 40 % à la signature, 30 % à la livraison de la préproduction, 30 % à la mise en production.

Après livraison : forfait de maintenance et d'hébergement mensuel (par exemple 150 à 400 €), qui finance les mises à jour de sécurité et rend le revenu moins irrégulier.

## Le template est l'actif principal

Toute la marge d'Aldaron repose sur le template. Trois constats sur `1lalana-platform` :

- **Point fort** : la séparation `_core` (back-office générique) / `_domain` (métier du projet) existe déjà, côté serveur et back-office, avec la règle « `_core` n'importe jamais `_domain` ». C'est exactement la frontière qu'il faut pour un template.
- **Point d'attention** : `_core` contient aussi des éléments propres au covoiturage (paiements, avis, signalements, numéros de paiement…). Il faut trancher ce qui est vraiment générique avant de promettre le socle.
- **Travail à faire** : le template actuel est un produit, pas un modèle. Il faut en tirer une version « vide de métier » avec un générateur (nouveau projet = une commande), sinon chaque démarrage coûtera des jours de nettoyage manuel.

Question de fond : comment un correctif ou une amélioration du template arrive-t-il dans les projets déjà livrés ? Sans réponse (modules versionnés, ou fusion de branches amont), chaque projet devient une copie qui dérive et la maintenance explose.

## Vérification économique

Le prix n'a de sens que rapporté au temps réel. À mesurer avant de publier une grille :

1. Chronométrer l'adaptation du template sur un vrai projet pilote : marque, déploiement, configuration, formation. Objectif de départ : **moins de 15 jours de travail** pour le socle complet, et **moins de 9 jours** pour la formule minimum.
2. Le tarif de référence est de **114 € par jour**. Il vient d'un calcul sur le projet Entraid'ei : 5 000 € pour environ 44 jours de travail effectif, développé avec Claude à environ 10 écrans par jour. À ce tarif, la formule minimum à 1 000 € représente environ 9 jours de travail ; le socle complet à 2 000 €, s'il tient en 15 jours, rapporte environ 133 € par jour. Il faut que ce chiffre soit viable au regard des coûts réels (Claude, outils, hébergement, temps commercial, fiscalité).
3. Mesurer le temps réel d'un écran standard, d'un écran complexe, d'une intégration, sur 1lalana lui-même, et recaler les fourchettes ci-dessus.
4. Prévoir le temps non facturable : avant-vente, réunions, support après livraison. Il pèse souvent 25 à 35 % du temps total.
5. Le rythme de 10 écrans par jour mesure la production, pas la livraison : relecture, fidélité à la maquette, tests sur appareils et corrections en plus. À valider sur le pilote, du premier prompt à l'écran relu et testé.

**Plancher interne (jamais affiché au client).** Le prix reste un forfait ; le tarif de référence sert seulement à vérifier qu'un devis rapporte au moins le minimum. Plancher du devis = jours de travail estimés × 114 €, avec un minimum de 1 000 €. Un devis dont le total est inférieur à ce plancher est relevé ou refusé.

| Durée du projet | Plancher du devis |
|---|---|
| 9 jours (formule minimum) | 1 000 € (le minimum) |
| 15 jours | 1 710 € |
| 2 mois (environ 44 jours ouvrés) | 5 016 € |
| 3 mois (environ 66 jours ouvrés) | 7 524 € |

Le tarif est fixe, sans dégressivité. Il doit être confronté au coût journalier réel d'Aldaron (Claude, outils, hébergement, charges, impôts) : si ce coût dépasse 114 €, le plancher est trop bas. Au tarif de 114 €, un écran à 60 € représente environ une demi-journée, alors que le rythme avec Claude est d'environ 10 écrans par jour : la marge sur les écrans finance la relecture, les tests, la vente et le support.

## Risques et points faibles

| Risque | Pourquoi c'est un problème | Piste |
|---|---|---|
| Startups à trésorerie fragile | Impayés, projets abandonnés en cours de route | Acompte de 40 %, jalons de paiement, propriété du code transférée au paiement final |
| Dérive du périmètre | Le prix de départ attire des demandes « un peu plus » à chaque réunion | Grille de complexité écrite, avenants, périmètre signé |
| Stack lourde pour un petit client | Parse Server, MongoDB et monorepo Nx demandent de l'exploitation | Hébergement géré par Aldaron dans le forfait mensuel, ou option plus légère |
| Dépendance à l'outil | Les prix supposent environ 10 écrans par jour avec Claude ; à la main, le même travail prend plusieurs fois plus de temps | Mesurer le rythme réel sur le pilote, prévoir une clause de révision des prix si l'outil change de tarif ou de disponibilité |
| Un seul développeur | Congés, maladie, goulot d'étranglement sur les ventes et le code | Limiter le nombre de projets simultanés, documenter, prévoir un renfort ponctuel |
| Propriété intellectuelle | Le client croit posséder le template | Contrat : le template reste à Aldaron, le client reçoit une licence perpétuelle sur son projet |
| Concurrence | Outils no-code, agences à bas prix, freelances | Ne pas rivaliser sur le prix : rivaliser sur le délai, la qualité du back-office et le suivi |
| Dépendance au marché | Prix en euros, équipe peut-être dans un autre contexte économique | Fixer le contrat en euros, vérifier le cadre fiscal et le change |
| Responsabilité sur les données | Authentification et données utilisateurs engagent la société en cas de fuite | Clauses de responsabilité plafonnée, assurance, sauvegardes documentées |

## Questions ouvertes

Chaque question est suivie d'une recommandation. Celles qui touchent au droit, à la fiscalité ou à la marque sont un point de départ à faire valider par un comptable ou un juriste, pas un avis juridique.

- Le nom « Aldaron » est-il libre à l'international (marque, domaine, réseaux) ? L'enregistrement local (NIF, STAT) ne protège pas la marque ailleurs.
  - **Recommandation :** vérifier avant toute communication les bases de marques (Madagascar, Union européenne, base mondiale de l'OMPI), le domaine et les comptes de réseaux. Réserver tout de suite le domaine et les comptes, puis déposer la marque dans l'Union européenne si rien ne bloque, puisque la cible est européenne.
- Quel est le pays de facturation, et comment gérer TVA, contrat et paiement en euros avec des clients européens ?
  - **Recommandation :** facturer depuis la société enregistrée, en euros, avec un contrat type en français et en anglais et un acompte de 40 %. Faire valider par un comptable le traitement de la TVA et le mode d'encaissement des euros avant le premier devis.
- Le client reçoit-il le code source complet ? Avec quelle licence, et le template reste-t-il visible ?
  - **Recommandation :** oui pour le code de son projet, livré dans son propre dépôt au paiement final, avec une licence perpétuelle d'usage et de modification. Le cœur du template reste la propriété d'Aldaron, qui peut le réutiliser pour d'autres clients ; le contrat le dit explicitement.
- Quelle durée de garantie et quel niveau de support (délai de réponse) dans le socle ?
  - **Recommandation :** 30 jours de correction des bugs (déjà dans le socle), avec une réponse sous 2 jours ouvrés. Une demande qui change le comportement prévu n'est pas un bug : c'est un avenant. Après les 30 jours, le forfait de maintenance fixe des délais de réponse plus courts pour les urgences.
- Qui héberge : le client sur son compte, ou Aldaron ?
  - **Recommandation :** les comptes (hébergement, domaine, comptes des stores) appartiennent au client, qui peut ainsi partir avec son produit. Aldaron les administre dans le cadre du forfait de maintenance mensuel, et propose l'hébergement géré comme option pour les startups sans compétence technique.
- Le mobile est-il toujours Expo, et la publication sur les stores est-elle incluse ?
  - **Recommandation :** oui, Expo, comme dans le template : c'est la seule façon de tenir un socle mobile à 1 000 €. La publication initiale sur les stores est incluse dans ce socle (voir [Publication sur les stores](#publication-sur-les-stores)) ; les frais des comptes développeur Apple et Google restent à la charge du client.
- Faut-il un second plancher (par exemple 15 000 €) pour les projets avec mobile ?
  - **Recommandation :** non. Le mobile est un levier de prix comme les autres, et un second plancher compliquerait l'offre sans protéger la marge, que le plancher de TJM contrôle déjà.
- Quel premier client pilote, et à quelles conditions (tarif réduit contre un témoignage) ?
  - **Recommandation :** commencer par un projet interne ou un proche pour chronométrer le socle, puis un premier client dans votre réseau. Offrir une remise modérée (sans passer sous le plancher de TJM) contre un témoignage, une étude de cas publiable et le droit de montrer le produit, avec un périmètre limité au socle plus deux ajouts maximum, le tout écrit dans le contrat.

## Prompt pour Claude Design

À coller dans Claude Design pour produire d'abord le système de design d'Aldaron, avant toute page. Les crochets sont à compléter ou à laisser à la proposition de l'outil.

````text
Tu es directeur artistique et designer de système de design. Tu conçois l'identité
visuelle et le système de design de « Aldaron », une société de développement qui
livre des produits web et mobile à des startups.

## Contexte
- Cible : fondateurs et équipes de startups (pré-seed à série A), en Europe.
- Promesse de la marque : un MVP complet, avec authentification, rôles, CMS et
  back-office, livré vite et à prix prévisible.
- Ton : fiable, rapide, moderne, sans jargon ; sérieux sans être froid.
- Langues du site : français et anglais.
- Références ou mots-clés d'ambiance : [à compléter, sinon propose-les].

## Stack imposée (le design doit s'y implémenter sans friction)
- Next.js (App Router), Tailwind CSS et shadcn/ui.
- Les couleurs sont des variables CSS (format shadcn : --background, --foreground,
  --primary, --secondary, --muted, --accent, --destructive, --border, --input,
  --ring, --chart-1 à --chart-5) avec une valeur claire et une valeur sombre
  (classe .dark), exposées comme utilitaires Tailwind. Aucune couleur écrite en dur
  dans les composants.
- Polices chargées avec next/font.
- Icônes : une bibliothèque cohérente avec shadcn/ui (Lucide par défaut) ; si tu en
  proposes des sur mesure, donne la grille, l'épaisseur de trait et les règles.

## Étape 1 — uniquement le système de design (ne conçois aucune page)
Commence par proposer 3 directions visuelles distinctes (une phrase, une palette
et une paire de polices chacune), puis attends mon choix. Ensuite, produis :

1. Logo : symbole + logotype, versions horizontale et empilée, fond clair, fond
   sombre et monochrome, taille minimale, zone de protection, usages interdits.
   Livré en SVG.
2. Favicons et icônes d'application : favicon.svg, favicon.ico, apple-touch-icon
   (180 px), icônes PWA 192 et 512 px dont une version « maskable », image de
   partage (Open Graph, 1200 x 630). Liste des fichiers et du code Next.js
   (metadata, manifest) pour les brancher.
3. Couleurs : palette de marque, couleurs sémantiques (succès, avertissement,
   erreur, information), neutres ; tous les jetons en clair et en sombre, avec un
   contraste conforme WCAG AA vérifié pour chaque paire texte / fond.
4. Typographie : police de titres et de texte (libres de droit), échelle de tailles,
   graisses, hauteurs de ligne, règles d'usage ; extrait next/font prêt à coller.
5. Fondations : rayons, espacements, ombres, bordures, états (survol, focus
   visible, désactivé), mouvements.
6. Composants de base shadcn/ui habillés avec ces jetons : Button, Input, Select,
   Checkbox, Switch, Card, Dialog, Dropdown, Table, Form, Badge, Alert, Tabs, Toast.
   Montre chaque état (normal, survol, focus, désactivé, erreur) en clair et en
   sombre.

## Livrables
- globals.css avec toutes les variables (clair et sombre) et la configuration
  Tailwind correspondante, prêts à coller.
- Une page « design system » qui présente logo, couleurs, typographie, icônes et
  composants.
- Les fichiers du logo et des icônes, nommés et rangés par dossier.
- Un court guide d'usage (une page) : quand utiliser quelle couleur, quel composant.

## Règles
- Accessibilité d'abord : contraste AA, focus visible, cibles tactiles d'au moins
  44 px.
- Pas de dégradés ni d'effets décoratifs qui ne se traduisent pas en CSS simple.
- Reste compatible avec les composants shadcn/ui existants : change les jetons,
  pas la structure.

## Étape 2 — après ma validation seulement
Pages du site : accueil, offre et prix (le socle à 2 000 €, la formule minimum à 1 000 € et les options),
réalisations, à propos, contact. Je te donnerai le contenu à ce moment-là.
````

## Prochaines étapes

1. Choisir un projet pilote (réel ou interne) pour chronométrer le socle.
2. Extraire `1lalana-platform` en template sans métier, avec un générateur de projet.
3. Écrire la grille de complexité et la liste exacte du socle.
4. Rédiger le contrat type : périmètre, jalons, propriété, garantie, avenants.
5. Préparer une page de présentation et un devis type pour les premiers rendez-vous.
6. Valider le nom (marque et domaine) avant toute communication.
