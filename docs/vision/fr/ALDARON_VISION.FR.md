# Aldaron — vision de la société

## Table des matières

- [L'idée en une phrase](#lidée-en-une-phrase)
- [Positionnement](#positionnement)
- [Le prix et le minimum](#le-prix-et-le-minimum)
- [Ce qui est déjà là au jour 1](#ce-qui-est-déjà-là-au-jour-1)
- [Comment se déroule un projet](#comment-se-déroule-un-projet)
- [Ce qui se facture en plus](#ce-qui-se-facture-en-plus)
- [Chiffrer le besoin en interne](#chiffrer-le-besoin-en-interne)
- [Chiffrer à partir du brief du client](#chiffrer-à-partir-du-brief-du-client)
- [Exemples](#exemples)
- [L'offre Site (web seul)](#loffre-site-web-seul)
- [Le template est l'actif principal](#le-template-est-lactif-principal)
- [Vérification économique](#vérification-économique)
- [Risques et points faibles](#risques-et-points-faibles)
- [Questions ouvertes](#questions-ouvertes)
- [Prompt pour Claude Design](#prompt-pour-claude-design)
- [Prompt pour le simulateur de prix](#prompt-pour-le-simulateur-de-prix)
- [Prompt pour l'offre Site](#prompt-pour-loffre-site)
- [Prochaines étapes](#prochaines-étapes)

> Document d'exploration, nouvelle version complète : Aldaron ne vend plus des écrans, des intégrations ni un socle, mais **un produit fini à un prix annoncé avant la signature**. Le client apporte une idée, un cahier des charges ou une maquette et reçoit un prix : il ne voit jamais de jours ni de mois. **En interne**, Aldaron estime le travail en jours (114 € par jour) et ne chiffre jamais moins d'**un mois de travail dédié, soit 2 500 €**. Il n'y a ni abonnement mensuel, ni CMS, ni site public dans cette offre startup ; une **offre Site** séparée (portfolio, site vitrine, à partir de 600 €, prix de catalogue) couvre le web seul. Les chiffres sont des **hypothèses à calibrer**, pas des engagements : la section [Vérification économique](#vérification-économique) dit comment les valider. Le contenu de la base de départ est tiré de ce que contient `1lalana-platform` aujourd'hui et doit être revérifié lors de l'extraction du template.

## L'idée en une phrase

Aldaron est une société de développement qui livre aux startups un produit (web, mobile, ou les deux) **à un prix annoncé avant la signature**, à partir de l'idée, du cahier des charges ou de la maquette que la startup apporte : à partir de 2 500 € pour une première version utilisable, environ 5 000 € pour un MVP complet. Le projet démarre d'une base éprouvée (connexion, back-office, déploiement) au lieu d'une page blanche, et la startup décide de ce que Aldaron construit. Le jour est une unité interne : Aldaron s'en sert pour calculer le prix, le client ne le voit jamais. Pour ceux qui veulent seulement un site (un portfolio, la vitrine d'une boutique), Aldaron propose à part une **offre Site** à prix de catalogue, à partir de 600 € (voir [L'offre Site (web seul)](#loffre-site-web-seul)).

> Hypothèse de lecture : le nom « Aldaron », le NIF et le STAT existent déjà (société déjà enregistrée). Si le nom est en réalité pris par un tiers, c'est à régler avant tout le reste (voir [Questions ouvertes](#questions-ouvertes)).

## Positionnement

| Question | Réponse proposée |
|---|---|
| Cible | **Offre produit** : uniquement des startups (pré-seed à série A). **Offre Site** : indépendants, créatifs et petites activités qui veulent seulement un site. Dans les deux cas : pas d'agence, pas de grand compte |
| Deux offres | **Produit** (startups, à partir de 2 500 €, prix ferme après cadrage) et **Site** (portfolio, vitrine, à partir de 600 €, prix de catalogue, sans cadrage). Un besoin web seul ne passe jamais par le minimum de 2 500 € : voir [L'offre Site (web seul)](#loffre-site-web-seul) |
| Promesse | Un MVP réel à un prix connu avant la signature, sans que la startup réinvente connexion et back-office |
| Ce qui nous distingue | Un prix unique à partir du brief (idée, cahier des charges ou maquette), à partir de 2 500 €. Pas de grille d'écrans, pas de supplément, pas de ligne « intégration » ou « paiement », aucun discours en jours ou en mois |
| Ce qu'on ne fait pas | Sites vitrines sur mesure ou à prix négocié (ils passent par l'offre Site, au catalogue), refontes graphiques sans produit, travail sans prix convenu à l'avance |
| Argument de vente | Budget connu dès la signature, une base prête dès le premier jour, et la startup change ses priorités librement à l'intérieur de la liste convenue (on échange, on n'ajoute pas) |

On vend **un produit à prix fixe**, estimé à partir de ce que la startup apporte. Le client n'achète pas du temps et ne demande pas combien de temps cela prend : il juge le prix et le résultat. Jamais de prix par écran ni par intégration, et jamais de tarif journalier affiché.

## Le prix et le minimum

Le client apporte une idée, un cahier des charges ou une maquette (voir [Chiffrer à partir du brief du client](#chiffrer-à-partir-du-brief-du-client)). Aldaron répond par **un prix**, écrit en euros, sans nombre de jours, de mois ni tarif horaire.

- **Prix minimum : 2 500 €.** C'est la valeur d'un mois de travail dédié (environ 22 jours ouvrés à 114 €), calculée en interne. Même un besoin de quelques écrans est chiffré au moins 2 500 € : en dessous, le cadrage gratuit, le démarrage et le trou avant la mission suivante coûtent plus que le travail.
- **Au-dessus du minimum**, le prix suit l'estimation interne en jours (voir [Chiffrer le besoin en interne](#chiffrer-le-besoin-en-interne)) : jours annoncés × 114 €, arrondi à la centaine la plus proche. Le client ne voit que le résultat, par exemple 5 000 €.
- **Le prix est fixé à la signature** pour la liste initiale des besoins. Si le travail prend moins de jours que prévu, le gain est pour Aldaron ; s'il en prend plus, le dépassement est aussi pour Aldaron. Le client n'est pas facturé de la différence.
- **Le temps est dédié** en interne : pendant le projet, Aldaron travaille sur ce seul projet.
- Web, mobile, langues, maquettes, paiement, cartes, messagerie : tout cela est du temps de développement, donc compris dans le prix. Rien ne se chiffre à part.
- **Plus de besoins que la liste initiale** est un nouveau devis, chiffré de la même façon, convenu avant de commencer. À l'intérieur de la liste, la startup peut **échanger** un besoin contre un autre.

Des exemples de projets, en euros, sont dans la section [Exemples](#exemples).

## Ce qui est déjà là au jour 1

Ce n'est pas une ligne du devis : c'est la raison pour laquelle le prix paie le produit de la startup et non ses fondations. Basé sur ce que `1lalana-platform` contient déjà (partie générique `_core`), à confirmer à l'extraction :

| Bloc | Contenu |
|---|---|
| Authentification | Connexion, création de compte, mot de passe oublié, invitations par email, double authentification (MFA), vérification renforcée pour les actions sensibles |
| Back-office de base | Tableau de bord, profil, paramètres, notifications, journal d'audit |
| Email et SMS | Envoi d'emails transactionnels et de SMS configuré (fournisseur au choix du client), modèles de messages traduits |
| Interface | Anglais et français, thème clair et sombre, marque du client appliquée (logo, couleurs) |
| Mobile | Si le produit est mobile : application Expo configurée, navigation, notifications push, version de test distribuée |
| Mise en production | Environnements préproduction et production, déploiement, nom de domaine configuré |

Il n'y a **ni CMS ni site public** dans cette base. Un site vitrine, des articles ou une newsletter sont, si la startup en veut, du temps de développement comme le reste, donc compris dans le prix. Le web seul, sans produit, relève de l'offre Site, qui part d'une autre base, `portfolio-platform` (voir [L'offre Site (web seul)](#loffre-site-web-seul)).

## Comment se déroule un projet

1. **Brief et cadrage** (court, gratuit). La startup apporte une idée, un cahier des charges ou une maquette. Aldaron l'estime en interne en jours (voir [Chiffrer le besoin en interne](#chiffrer-le-besoin-en-interne)) et répond par un prix, ou par « ça dépasse votre budget, il faut retirer ceci ».
2. **Contrat** : le prix, la liste initiale des besoins, la date de début, la date de livraison convenue et l'échéancier de paiement. Ce n'est pas un périmètre figé : c'est le point de départ.
3. **Liste ordonnée par la startup**. Aldaron construit dans l'ordre choisi, avec une démonstration chaque semaine. La startup peut changer l'ordre ou remplacer un besoin par un autre à tout moment : on **échange**, on n'ajoute pas. Si elle veut plus, c'est un nouveau devis.
4. **Intégration inconnue** (un service sans documentation claire, une vérification qu'on ne sait pas faire) : un essai court et borné (en interne 2 jours maximum), puis la startup décide de continuer, avec un prix ajusté si l'intégration est plus grosse que prévu, ou d'abandonner. Le risque est visible et choisi, pas caché dans le prix.
5. **Fin du projet** : mise en production, remise du code et des comptes, puis 30 jours de correction de bugs et formation d'une demi-journée.
6. **Si la startup ne répond pas** : Aldaron ne peut pas avancer et la date de livraison glisse d'autant. Une pause d'une semaine au maximum est possible ; au-delà, le projet reprend selon la disponibilité d'Aldaron.

Paiement, par échéances liées à l'avancement et jamais à un nombre de jours : **40 % à la signature, 30 % à la démonstration de mi-parcours, 30 % à la mise en ligne**, avant la remise du code et des comptes (à confirmer au contrat). Si la startup arrête en cours de route, les échéances déjà payées restent acquises à Aldaron et le code produit jusqu'à la dernière échéance payée lui est remis : l'exposition d'Aldaron est limitée au travail entre deux échéances. Quand l'interface web est riche, l'échéance de mi-parcours est remplacée par une échéance par lot livré, convenue au cadrage (à confirmer au contrat) : un dépassement reste alors limité au lot en cours.

## Ce qui se facture en plus

Tout ce qui n'est pas du temps de développement, refacturé **sans marge** :

- les comptes développeur Apple (99 $ par an) et Google (25 $ une fois), que le client crée et possède ; Aldaron publie dessus en tant que membre de l'équipe, jamais sous son propre compte ;
- l'hébergement et les services tiers (fournisseur d'email et de SMS, cartes, paiement, messagerie, etc.), payés directement par la startup ;
- la maintenance et l'hébergement géré après les 30 jours de garantie : forfait mensuel de 150 à 400 €, qui finance les mises à jour de sécurité.

Les délais de validation des stores (Apple de 1 à 3 jours, parfois plus ; Google de quelques heures à quelques jours) ne sont pas maîtrisés : à prévoir dans le planning. Un compte Apple organisation demande un numéro D-U-N-S, qui peut prendre des semaines : à lancer dès la signature.

## Chiffrer le besoin en interne

La grille d'écrans de l'ancienne version n'est pas un prix : c'est la **feuille de repères interne** qui sert à estimer le travail d'un brief, en jours. Le client ne la voit jamais. Repères à calibrer sur le pilote, en jours de travail :

| Élément | Repère interne |
|---|---|
| Écran mobile ou web standard (liste, détail, formulaire) | environ 0,1 jour |
| Écran avec caméra, carte, filtres, workflow | environ 0,15 à 0,3 jour |
| Écran de back-office | environ 0,35 à 0,6 jour |
| Cartes, connexion Google ou Apple, autocomplétion d'adresse | environ 0,5 à 1 jour chacune |
| Scan et vérification de document | environ 2 jours |
| Messagerie en temps réel, paiement | environ 4 à 5 jours chacun |
| Complexité métier élevée | l'estimation de l'écran est multipliée par 1,5 à 2,5 |

Le rythme d'environ 10 écrans par jour avec Claude mesure la production, pas la livraison : relecture, fidélité à la maquette, tests sur appareils et corrections s'ajoutent. À valider sur le pilote, du premier prompt à l'écran relu et testé.

**Interface web riche.** Un écran web avec tableaux, filtres, tableaux de bord, rôles ou éditeur s'estime comme un écran de back-office (0,35 à 0,6 jour), pas comme un écran standard, et par module (tableau de bord, gestion des utilisateurs, éditeur) plutôt qu'écran par écran. L'application mobile ne garde que les usages terrain et la gestion lourde reste sur le web : la complexité n'est pas payée deux fois. Une interface web riche est la première source de dépassements, donc trois règles s'appliquent : le cadrage est plus long avant le prix ferme, le travail est livré par lots (voir [Comment se déroule un projet](#comment-se-déroule-un-projet)), et le simulateur affiche une fourchette plus large et passe au devis manuel plus tôt (voir [Prompt pour le simulateur de prix](#prompt-pour-le-simulateur-de-prix)).

Règle de prix interne :

1. **Estimation** en jours avec la feuille de repères.
2. **Jours annoncés** = l'estimation divisée par 0,9, arrondie au jour supérieur. On garde ainsi 10 % de marge pour la relecture, les tests et les imprévus.
3. **Prix** = jours annoncés × 114 €, arrondi à la centaine la plus proche.
4. **Plancher** : jamais moins de 2 500 € (un mois, environ 22 jours × 114 €). Un besoin estimé à 5 jours est chiffré 2 500 €.

## Chiffrer à partir du brief du client

Le client apporte **une idée, un cahier des charges ou une maquette** et reçoit un prix. Plus le brief est précis, plus le prix l'est :

| Ce que le client apporte | Comment Aldaron estime | Précision de la réponse |
|---|---|---|
| Une maquette (Figma, images) | Compte les écrans avec la règle de comptage, puis applique les repères | Prix ferme après un court cadrage |
| Un cahier des charges (un document, une liste de fonctions) | Traduit le cahier des charges en écrans et en intégrations, vérifie les points douteux avec le client | Prix ferme après cadrage, éventuellement une fourchette d'abord |
| Une idée seule | Appel de cadrage pour la transformer en liste de besoins | Fourchette indicative d'abord, prix ferme une fois la liste écrite |

| Montré au visiteur | Reste interne |
|---|---|
| Un prix en euros, « à partir de 2 500 € » | Les jours, la valeur de 114 € par jour, la feuille de repères (écrans, back-office, intégrations, complexité) |
| Des projets de référence, avec leur prix | La règle de la marge : jours annoncés = estimation divisée par 0,9, et l'arrondi |
| Les règles : prix fixe, échange d'un besoin contre un autre, échéances | Le recalage après chaque projet |
| Un cadrage gratuit comme point d'entrée | La raison du plancher (un mois de travail dédié) |

Jamais affichés : des jours, des mois ou des durées, le tarif journalier, un prix par écran, un prix par intégration, la feuille de repères.

- **Recalage.** Après chaque projet, comparer les jours estimés aux jours réels, par type d'écran et d'intégration, puis corriger la feuille de repères. C'est ce suivi, plus que les chiffres de départ, qui rend le prix fiable, puisqu'un dépassement est pour Aldaron.
- **Réponse à « forfait ou temps ? ».** Un prix fixe pour la liste de besoins convenue, et la startup pilote le contenu par des échanges. Le client n'achète pas du temps : les jours n'existent que dans l'estimation d'Aldaron.
- **Qui donne le prix.** Un devis ferme est donné à la main, après cadrage. Un simulateur sur le site donne seulement une **fourchette indicative** à partir de quelques réponses, jamais un nombre de jours (voir [Prompt pour le simulateur de prix](#prompt-pour-le-simulateur-de-prix)). Ses valeurs en euros viennent des repères internes : tant que plusieurs projets n'ont pas été chronométrés, il affiche des fourchettes larges, car une estimation fausse coûte cher.

## Exemples

| Cas | Prix affiché | Jours internes (jamais affichés) |
|---|---|---|
| Quelques écrans standards sur la base existante (par exemple 5) | **2 500 €** (le minimum) | environ 1 jour, remonté au plancher |
| Connexion, mise en production et première version utilisable d'un SaaS | environ **2 500 €** | environ 22 jours |
| Entraid'ei : application mobile de plus de 100 écrans, back-office de modération, scan du passeport, messagerie temps réel, Google et Apple | environ **5 000 €** | environ 44 jours |
| Application mobile avec un back-office complexe | environ **7 500 €** | environ 66 jours |
| Produit web et mobile avec paiement | environ **7 500 €** | environ 66 jours |

Le cas Entraid'ei illustre le calcul. Avec les repères ci-dessus, le périmètre représente environ 39 jours de travail ; avec la marge de 10 %, cela fait 44 jours annoncés, soit 5 016 €, chiffrés environ 5 000 €. Si la startup veut dépenser moins, elle retire un besoin ; si elle veut plus, c'est un nouveau devis. Le client ne voit que « 5 000 € ».

## L'offre Site (web seul)

Une seconde offre, **séparée** de l'offre startup, pour quelqu'un qui veut seulement un site : un portfolio, le site vitrine d'une boutique ou d'une petite activité. Elle ne part pas de la base `1lalana-platform` mais de `portfolio-platform` (site public, articles, espace pour modifier le contenu, trois langues, thème clair et sombre). Le travail consiste surtout à appliquer la marque et à charger le contenu, ce qui permet un prix bas.

| | Portfolio | Vitrine |
|---|---|---|
| Pour | Une personne qui présente son travail (designer, développeur, photographe, consultant) | Une boutique ou une petite activité qui veut être trouvée et montrer ses photos, son adresse, ses horaires |
| Prix affiché | **600 €** | **1 200 €** |
| Pages | Jusqu'à 5 : accueil, projets, articles, à propos, contact | Jusqu'à 8 : accueil, présentation, produits ou services, galerie, infos pratiques (adresse, horaires, carte), actualités, contact |
| Langues | 2 parmi français, anglais, malgache | Jusqu'à 3 : français, anglais, malgache |
| Modification par le client | Espace pour ajouter et modifier projets, articles et textes | Idem, plus l'inscription à une lettre d'information |
| Corrections avant la mise en ligne | 1 tour | 2 tours |

**Compris dans les deux** : thème clair et sombre, affichage adapté au téléphone, référencement de base (titres, descriptions, plan du site), formulaire de contact, nom de domaine configuré, mise en ligne, 30 jours de correction de bugs.

Règles :

- **Prix de catalogue, affiché et fixe.** Pas de devis, pas de cadrage gratuit : le client choisit une formule et remplit un court formulaire, Aldaron répond par écrit avec la confirmation et la date de mise en ligne. Le minimum de 2 500 € de l'offre produit ne s'applique pas ici : le travail est standardisé, il n'y a ni cadrage ni démarrage sur mesure.
- **Le client fournit ses textes et ses photos avant le démarrage.** Sans contenu, la mise en ligne attend et la date glisse.
- **Corrections regroupées** en un seul message par tour. Un tour de plus, ou toute demande hors formule, est un nouveau devis.
- **Paiement en deux échéances** : 50 % à la commande, 50 % à la mise en ligne. Le montant est trop faible pour trois échéances.
- **Hors offre Site** : vente en ligne et paiement, comptes pour les visiteurs, réservation, fonctions sur mesure. Cela devient un projet de l'offre produit, au minimum de 2 500 €, accepté au cas par cas : l'offre produit vise les startups.
- **Le nom de domaine** est au nom du client, qui le paie directement (environ 15 € par an).
- **Maintenance et hébergement** : forfait mensuel de 30 € (hypothèse, à calibrer sur le coût réel d'hébergement par site) : hébergement géré par Aldaron, mises à jour de sécurité, sauvegardes, petite aide sur le contenu. Le client reçoit son code et l'export de son contenu sur demande.
- Le visiteur qui cherche seulement un site n'arrive jamais sur le simulateur de l'offre produit : il est orienté vers ces deux formules (voir [Prompt pour le simulateur de prix](#prompt-pour-le-simulateur-de-prix)).

Calcul interne, jamais montré au client :

| Formule | Estimation interne | Jours annoncés (estimation ÷ 0,9) | Valeur à 114 € | Prix de catalogue |
|---|---|---|---|---|
| Portfolio | environ 4,5 jours | 5 | 570 € | **600 €** |
| Vitrine | environ 9 jours | 10 | 1 140 € | **1 200 €** |

Le prix de catalogue est arrondi à la centaine **supérieure**, au lieu de la plus proche, parce qu'il n'est pas recalculé à chaque devis. Ces estimations supposent le contenu fourni et l'adaptation de `portfolio-platform` (marque, langues, déploiement) outillée : à chronométrer sur le premier site, comme le pilote de l'offre produit.

## Le template est l'actif principal

Toute la marge d'Aldaron repose sur le temps que le template fait gagner. Trois constats sur `1lalana-platform` :

- **Point fort** : la séparation `_core` (back-office générique) / `_domain` (métier du projet) existe déjà, côté serveur et back-office, avec la règle « `_core` n'importe jamais `_domain` ». C'est exactement la frontière qu'il faut pour un template.
- **Point d'attention** : `_core` contient aussi des éléments propres au covoiturage (paiements, avis, signalements, numéros de paiement…) et le CMS actuel. Il faut trancher ce qui est vraiment générique, et sortir le CMS de la base de départ.
- **Travail à faire** : le template actuel est un produit, pas un modèle. Il faut en tirer une version « vide de métier » avec un générateur (nouveau projet = une commande), sinon chaque démarrage coûtera des jours de nettoyage pris sur les jours du client.

Question de fond : comment un correctif ou une amélioration du template arrive-t-il dans les projets déjà livrés ? Sans réponse (modules versionnés, ou fusion de branches amont), chaque projet devient une copie qui dérive et la maintenance explose.

## Vérification économique

1. **La valeur interne de 114 € par jour n'est pas une preuve de rentabilité** : elle vient d'Entraid'ei, 5 000 € pour environ 44 jours de travail effectif (soit 2 500 € pour 22 jours). Elle doit être confrontée au coût journalier réel d'Aldaron (Claude, outils, hébergement, charges, impôts) : s'il dépasse 114 €, les prix sont trop bas. Le client ne voit jamais cette valeur : elle sert seulement à fixer les prix.
2. **Le plafond de revenu est visible.** À 114 € par jour interne, une personne qui ne fait qu'un projet à la fois et travaille tous les jours ouvrés (environ 22 par mois) atteint au plus environ 30 000 € par an. Avec 25 à 35 % de temps non facturable (avant-vente, réunions, support), cela donne environ 20 000 à 22 000 € par an. Le minimum de 2 500 € met un plancher sous chaque projet, mais le client paie un prix, pas des jours : un projet fini plus vite que prévu augmente le revenu réel par jour, un projet plus lent le réduit. À valider avec le coût de vie et les charges de la société.
3. **Le gain de vitesse de Claude profite à Aldaron**, sous forme de marge, tant que le prix est fixe. Le risque de dépassement est aussi pour Aldaron : il faut mesurer le rythme réel sur le pilote. Si le rythme réel est bien au-dessus des repères, les estimations internes (donc les prix des nouveaux devis) peuvent baisser pour rester compétitives.
4. **Chronométrer un projet pilote** : adaptation de la base (marque, déploiement, configuration), puis le rythme réel d'écrans, d'intégrations et d'écrans de back-office, pour recaler les repères internes.
5. **Plancher interne.** Un prix n'est jamais abaissé sous l'estimation divisée par 0,9, ni sous 2 500 €, pour faire une offre plus basse : on retire un besoin à la place. Un dépassement non prévu est absorbé par Aldaron.
6. **L'offre Site rapporte surtout par la maintenance.** 600 € et 1 200 € paient 5 et 10 jours internes, sans marge pour un dépassement : un site qui demande plus de tours de corrections que prévu, ou qui attend son contenu, perd son gain. Le forfait mensuel (environ 30 € par site) est ce qui fait durer le revenu, à condition que le coût d'hébergement réel par site reste bien en dessous. À mesurer sur le premier site, avant de publier les prix.

## Risques et points faibles

| Risque | Pourquoi c'est un problème | Piste |
|---|---|---|
| Startups à trésorerie fragile | Impayés, projets abandonnés en cours de route | Échéances liées à l'avancement (40 % à la signature, 30 % à mi-parcours, 30 % à la mise en ligne) : l'exposition d'Aldaron est limitée au travail entre deux échéances |
| La startup attend un MVP « fini » | Elle paie un prix, mais compare à un produit complet ; la déception arrive à la fin | Cadrage avant signature, liste initiale écrite au contrat, démonstration chaque semaine |
| Dérive du périmètre | Chaque réunion ajoute « un peu plus » et le prix est fixe, donc le dépassement est pour Aldaron | Règle d'échange : on remplace, on n'ajoute pas ; plus de besoin = un nouveau devis |
| Interface web riche chiffrée comme une interface simple | Tableaux, filtres, tableaux de bord et rôles coûtent 3 à 6 fois un écran standard, et le dépassement est pour Aldaron | Estimation par module avec le repère de back-office, cadrage plus long, livraison par lots, question dédiée dans le simulateur (voir [Chiffrer le besoin en interne](#chiffrer-le-besoin-en-interne)) |
| Risque des intégrations porté par Aldaron | Une intégration qui prend trois fois plus de temps consomme la marge d'un prix fixe | Essai borné avec décision, prix ajusté si l'intégration est plus grosse, repères internes tenus à jour |
| Marchander le prix | Le prix est la seule chose que le client voit, donc la discussion porte sur le prix | Le prix vient de la feuille de repères, pas d'une négociation : pour payer moins, on retire un besoin, on ne rogne pas la marge de 10 % |
| Petits projets en série | Le cadrage gratuit, les démarrages et les trous entre deux missions coûtent plus que sur un long projet | Le minimum de 2 500 € et un cadrage gratuit limité à un échange court pour l'offre produit ; pour l'offre Site, un catalogue fermé sans cadrage gratuit |
| Plafond de revenu | Un seul projet à la fois, environ 20 000 à 22 000 € par an (voir [Vérification économique](#vérification-économique)) | Décider si c'est suffisant, sinon augmenter la valeur interne du jour (donc les prix) ou ajouter un renfort ponctuel |
| Dépendance à l'outil | Les prix supposent environ 10 écrans par jour avec Claude ; à la main, le même travail prend plusieurs fois plus de temps, et le dépassement est pour Aldaron | Mesurer sur le pilote, clause de révision du prix des nouveaux devis si l'outil change de tarif ou de disponibilité |
| Simulateur indicatif pris pour un devis | Le visiteur oppose la fourchette à Aldaron | Fourchettes larges, mention « devis ferme après cadrage », aucun prix ferme sans brief |
| Un seul développeur | Congés, maladie, goulot sur les ventes et le code | Limiter à un projet à la fois, documenter, prévoir un renfort ponctuel |
| Stack lourde pour un petit client | Parse Server, MongoDB et monorepo Nx demandent de l'exploitation | Hébergement géré par Aldaron dans le forfait mensuel de maintenance, ou option plus légère |
| L'offre Site dilue le message startup | Un visiteur startup voit « à partir de 600 € » et attend le même prix pour un produit | Deux offres nettement séparées sur la page, l'offre Site présentée comme un catalogue, jamais comme une entrée vers l'offre produit |
| Support des petits clients | Un portfolio à 600 € qui demande trois tours de corrections ou qui attend ses textes coûte plus que son prix | Catalogue fermé, contenu fourni avant le démarrage, tours de corrections limités, tout le reste est un nouveau devis |
| Hébergement de l'offre Site | Une stack Parse Server, MongoDB et Next.js par site à 30 € par mois peut coûter plus qu'elle ne rapporte | Un serveur partagé entre plusieurs sites, coût par site mesuré avant de publier le forfait |
| Propriété intellectuelle | Le client croit posséder le template | Contrat : le template reste à Aldaron, le client reçoit une licence perpétuelle sur son projet |
| Dépendance au marché | Prix en euros, équipe peut-être dans un autre contexte économique | Fixer le contrat en euros, vérifier le cadre fiscal et le change |
| Responsabilité sur les données | Authentification et données utilisateurs engagent la société en cas de fuite | Clauses de responsabilité plafonnée, assurance, sauvegardes documentées |

## Questions ouvertes

Chaque question est suivie d'une recommandation. Celles qui touchent au droit, à la fiscalité ou à la marque sont un point de départ à faire valider par un comptable ou un juriste, pas un avis juridique.

- Le nom « Aldaron » est-il libre à l'international (marque, domaine, réseaux) ? L'enregistrement local (NIF, STAT) ne protège pas la marque ailleurs.
  - **Recommandation :** vérifier avant toute communication les bases de marques (Madagascar, Union européenne, base mondiale de l'OMPI), le domaine et les comptes de réseaux. Réserver tout de suite le domaine et les comptes, puis déposer la marque dans l'Union européenne si rien ne bloque, puisque la cible est européenne.
- Quel est le pays de facturation, et comment gérer TVA, contrat et paiement en euros avec des clients européens ?
  - **Recommandation :** facturer depuis la société enregistrée, en euros, avec un contrat type en français et en anglais. Faire valider par un comptable le traitement de la TVA et le mode d'encaissement des euros avant le premier devis.
- Le client reçoit-il le code source complet ? Avec quelle licence, et le template reste-t-il visible ?
  - **Recommandation :** oui pour le code de son projet, livré dans son propre dépôt à la fin du projet, avec une licence perpétuelle d'usage et de modification. Le cœur du template reste la propriété d'Aldaron, qui peut le réutiliser pour d'autres clients ; le contrat le dit explicitement.
- Que se passe-t-il si la startup arrête avant la fin, ou ne répond plus ?
  - **Recommandation :** les échéances déjà payées restent acquises à Aldaron et le code produit jusqu'à la dernière échéance payée est remis ; une pause d'une semaine au maximum est possible, au-delà le projet reprend selon la disponibilité d'Aldaron. Les deux règles sont écrites au contrat.
- Quelle durée de garantie et quel niveau de support ?
  - **Recommandation :** 30 jours de correction des bugs après la fin, avec une réponse sous 2 jours ouvrés. Une demande qui change le comportement prévu n'est pas un bug : c'est un nouveau devis. Après les 30 jours, le forfait de maintenance fixe des délais plus courts pour les urgences.
- Qui héberge : le client sur son compte, ou Aldaron ?
  - **Recommandation :** les comptes (hébergement, domaine, comptes des stores) appartiennent au client, qui peut ainsi partir avec son produit. Aldaron les administre dans le cadre du forfait de maintenance mensuel, et propose l'hébergement géré comme option pour les startups sans compétence technique.
- Le mobile est-il toujours Expo ?
  - **Recommandation :** oui, Expo, comme dans le template. Un seul choix technique garde la base de départ réutilisable d'un projet à l'autre.
- Quel premier client pilote, et à quelles conditions (tarif réduit contre un témoignage) ?
  - **Recommandation :** commencer par un projet interne ou un proche pour chronométrer la base, puis un premier client dans votre réseau. Offrir une remise modérée contre un témoignage, une étude de cas publiable et le droit de montrer le produit, avec un projet au prix minimum de 2 500 €, le tout écrit dans le contrat.
- Quels prix et quel marché pour l'offre Site ?
  - **Recommandation :** partir de 600 € (Portfolio) et 1 200 € (Vitrine), qui paient environ 5 et 10 jours internes à 114 €, et les confirmer en chronométrant le premier site. Si le marché visé est local (Madagascar), vérifier le pouvoir d'achat avant de publier les prix, et garder la maintenance mensuelle comme source de revenu régulière. Ne jamais descendre sous l'estimation divisée par 0,9 : on retire une option (une langue, une page) plutôt que de baisser le prix.

## Prompt pour Claude Design

À coller dans Claude Design pour produire d'abord le système de design d'Aldaron, avant toute page. Les crochets sont à compléter ou à laisser à la proposition de l'outil.

````text
Tu es directeur artistique et designer de système de design. Tu conçois l'identité
visuelle et le système de design de « Aldaron », une société de développement qui
livre des produits web et mobile à des startups.

## Contexte
- Cible : fondateurs et équipes de startups (pré-seed à série A), en Europe.
- Promesse de la marque : un MVP à un prix annoncé avant la signature (à partir de
  2 500 €), calculé à partir de l'idée, du cahier des charges ou de la maquette du
  client, et avec connexion et back-office déjà en place dès le premier jour. Le client
  ne voit jamais de jours ni de mois.
- Seconde offre, séparée : l'offre Site (portfolio, site vitrine d'une boutique), deux
  formules à prix de catalogue, à partir de 600 €, pour des indépendants et de petits
  commerces. L'identité reste sérieuse pour les startups et accueillante pour ces
  clients non techniques.
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
Pages du site : accueil, offre et prix (à partir de 2 500 €, exemples de projets avec
leur prix, simulateur de prix, section « Offre Site » avec ses deux formules à prix de
catalogue), réalisations, à propos, contact. Je te donnerai le contenu à ce moment-là.
````

## Prompt pour le simulateur de prix

À coller dans Claude Design pour construire le simulateur de prix indicatif de la page tarif. Il n'affiche jamais de jours, de mois ni de tarif journalier : seulement une fourchette en euros, à partir de 2 500 € pour un produit. Un besoin de site seul n'est pas chiffré ici : il mène aux formules de l'offre Site (voir [Prompt pour l'offre Site](#prompt-pour-loffre-site)). Les valeurs en euros de l'objet `PRICING` sont des hypothèses de départ, à calibrer sur les exemples de référence puis sur les projets chronométrés.

````text
Tu es designer produit et développeur front-end. Tu conçois le simulateur de prix de
« Aldaron », une société de développement qui livre des produits web et mobile à des
startups. Le simulateur remplace l'ancien simulateur « par durée » de la page Pricing
(design/aldaron-web/Pricing.html).

## Principe à respecter partout
- Le client apporte une idée, un cahier des charges ou une maquette, et reçoit UN PRIX.
- Le client ne voit JAMAIS : un nombre de jours, de semaines ou de mois, une durée, un
  tarif journalier, un prix par écran, un prix par intégration, ni le détail du calcul.
  Pas un seul de ces mots dans l'interface, les libellés, les infobulles, les messages
  d'erreur ou le texte alternatif. Deux exceptions seulement, qui ne décrivent pas la
  durée du projet : la garantie « 30 jours de correction de bugs » et la maintenance
  facultative « par mois ».
- Prix minimum du simulateur : 2 500 € (offre produit). Aucun résultat en dessous, même
  pour un tout petit besoin de produit.
- Le simulateur ne chiffre JAMAIS un site seul (portfolio, site vitrine) : ce besoin relève
  de l'offre Site, à prix de catalogue. Aucun « à partir de 2 500 € » n'apparaît pour lui.
- Le simulateur donne une FOURCHETTE INDICATIVE en euros, jamais un devis ferme. Le devis
  ferme vient après un cadrage gratuit.
- Cible : fondateurs de startups, souvent non techniques. Ton clair, sans jargon.

## Le parcours (une seule page, une question d'orientation puis 5 étapes courtes, résultat visible en direct)
0. « Que voulez-vous ? » : un produit (application, SaaS, plateforme) / un site (portfolio,
   site vitrine d'une boutique ou d'une activité). Choix unique, avant toute autre
   question. Si « un site » : le simulateur s'arrête, n'affiche ni fourchette ni « à partir
   de 2 500 € », et présente à la place les deux formules de l'offre Site (Portfolio 600 €,
   Vitrine 1 200 €, contenu résumé en 3 puces chacune) avec un bouton « Choisir cette
   formule » qui mène à la section Offre Site de la page.
1. « Qu'apportez-vous ? » : une idée / un cahier des charges / une maquette (choix unique).
   Cela règle la largeur de la fourchette et le texte de précision (voir Résultat).
2. « Pour quel support ? » : web / mobile / web et mobile.
   Si le support comprend le web, ajoute la question « Votre interface web est-elle simple
   ou riche ? » : simple (pages, listes, formulaires) / riche (tableaux, filtres, tableaux
   de bord, rôles, éditeur). Choix unique, « simple » par défaut.
3. « Quelle taille ? » : nombre d'écrans approximatif (curseur de 5 à 250, avec champ
   numérique synchronisé), avec l'aide « une vue distincte compte pour un écran ; ses
   états et variantes sont inclus ». Pour « une idée », propose aussi 4 repères en mots
   (quelques écrans / un produit simple / un produit complet / un grand produit) qui
   règlent le curseur.
4. « Et le back-office ? » : aucun / simple / avancé (rôles, modération, exports).
5. « Des fonctions particulières ? » (cases à cocher) : connexion Google ou Apple,
   cartes et recherche d'adresse, scan de document d'identité, messagerie en temps réel,
   paiement en ligne. Puis la complexité métier : standard / quelques parcours complexes
   / très orienté métier.
Ajoute 4 exemples en un clic qui préremplissent le formulaire : « Première version d'un
SaaS », « Application mobile de plus de 100 écrans », « Application mobile avec
back-office complexe », « Produit web et mobile avec paiement ».

## Le calcul (en euros uniquement, dans un seul bloc de constantes en tête du script)
Écris un objet PRICING modifiable facilement, sans aucun mot « jour » ni « mois » :
- plancher : 2 500
- socle et mise en production : 300
- par écran (mobile ou web simple) : 22
- par écran web riche : 55 (hypothèse à calibrer) ; pour « web et mobile » avec un web
  riche, le tarif par écran est la moyenne des deux (38,5)
- support « web et mobile » : les écrans comptent ×1,7
- back-office : aucun 0 / simple 400 / avancé 1 600
- fonctions : Google ou Apple 230 ; cartes et adresse 65 ; scan de document 230 ;
  messagerie temps réel 500 ; paiement 500 (première intégration comprise, puis 22 par
  intégration supplémentaire)
- complexité métier : standard +0 % / quelques parcours complexes +10 % / très métier
  +30 %, appliquée aux écrans seulement
Formule : total = socle + écrans × tarif × support × (1 + complexité) + back-office +
fonctions ; prix = max(2 500, total arrondi à la centaine la plus proche).
Largeur de la fourchette selon la précision : maquette +15 %, cahier des charges +30 %,
idée +60 % (borne haute arrondie à la centaine). Si l'interface web est « riche », la
fourchette s'élargit de 15 points (maquette +30 %, cahier des charges +45 %, idée +75 %).
CALIBRAGE OBLIGATOIRE : les 4 exemples (interface web « simple ») doivent tomber à ±5 % des prix de référence
(≈ 2 500 €, ≈ 5 000 €, ≈ 7 500 €, ≈ 7 500 €). Ajuste les valeurs de PRICING (tu peux les
bouger de ±15 %) jusqu'à y arriver, puis affiche-moi le résultat calculé de chaque exemple.

## Le résultat (panneau fixe à droite sur ordinateur, barre en bas sur mobile)
- Le prix en grand : « À partir de 2 500 € » quand on est au plancher, sinon
  « Entre X € et Y € » (séparateur de milliers adapté à la langue, espace insécable).
- Une ligne de précision : « Estimation à ±15 % » (maquette), « ±30 % » (cahier des
  charges), « Première estimation, à affiner ensemble » (idée).
- Ce qui est compris, en 4 puces, sans prix : connexion et back-office de base déjà en
  place, mise en production, remise du code et des comptes, 30 jours de correction de bugs.
- Ce qui n'est pas compris : hébergement et services tiers, comptes des stores, payés
  directement par la startup ; maintenance optionnelle de 150 à 400 € par mois.
- Une note : « Prix fixe à la signature, payé en 3 échéances : 40 % à la signature, 30 %
  à la démonstration de mi-parcours, 30 % à la mise en ligne. »
- Le bouton principal « Demander un devis ferme (cadrage gratuit) » : ouvre un formulaire
  de contact (nom, e-mail, message) avec le récapitulatif des réponses prérempli ; le
  récapitulatif ne contient pas la fourchette de prix. Bouton secondaire « Copier mon
  récapitulatif ».
- Si le total calculé dépasse 15 000 € (10 000 € quand l'interface web est « riche ») :
  n'affiche pas de fourchette, affiche « Projet d'envergure : parlons-en » et le bouton
  de devis.
- Si l'interface web est « riche » : ajoute à la note de paiement « Livraison par lots,
  chaque lot étant payé à sa livraison ; les lots sont convenus lors du cadrage. »
- Si le support est « web », avec 8 écrans ou moins, aucun back-office et aucune fonction
  particulière : affiche sous le résultat un encart « Vous voulez seulement un site ? Voir
  l'offre Site », avec un lien vers la section Offre Site et sans aucun prix dans l'encart.

## Contraintes techniques et de design
- Page HTML autonome, interactive (survol, focus, clic, états réels), sans framework
  imposé ; CSS lisible et organisé en sections commentées (variables, base, composants,
  états, responsive) ; JavaScript dans la même page.
- Couleurs uniquement via des variables CSS (jetons du design system Aldaron) avec une
  valeur claire et une valeur sombre ; aucune couleur écrite en dur.
- Langues : français et anglais, avec un sélecteur ; tous les textes dans un objet de
  traduction, aucun texte écrit en dur dans le HTML. Dans les deux langues, aucun mot
  de durée du projet (durée, jour, semaine, mois / duration, day, week, month), sauf les
  deux exceptions ci-dessus.
- Panneau de réglages dans la page elle-même : thème clair / sombre, langue,
  point de rupture (mobile, tablette, ordinateur, grand écran), et les valeurs de PRICING
  modifiables en direct pour tester le calibrage.
- Accessibilité : chaque champ a un libellé visible ; groupes de choix en fieldset avec
  legend ; le prix est dans une zone aria-live polie ; navigation complète au clavier,
  focus visible ; contraste AA ; cibles tactiles d'au moins 44 px ; le curseur a un champ
  numérique équivalent.
- État vide (avant toute réponse) : affiche la question d'orientation seule, sans prix.
  Après « un produit », affiche « À partir de 2 500 € » et invite à répondre.
- Pas de dégradés ni d'effets décoratifs qui ne se traduisent pas en CSS simple.

## Hors simulateur, à corriger dans la même page
Remplace les cartes « 2 semaines / 1 mois / 2 mois / 3 mois » et la phrase « Un MVP en
2 mois. 5 000 € » par : un prix de départ (« À partir de 2 500 € »), les 4 exemples de
projets avec leur prix seul, et les règles (prix fixe, échange d'un besoin contre un autre,
paiement en 3 échéances, cadrage gratuit).
Ajoute une section « Offre Site » distincte, sous l'offre produit (voir le prompt de
l'offre Site), un lien « Site » dans la navigation et, sous le titre de la page, la ligne
« Vous voulez seulement un site ? Voir l'offre Site ».
````

## Prompt pour l'offre Site

À coller dans Claude Design pour construire la section « Offre Site » de la page Offre et prix. C'est un catalogue de deux formules à prix fixe, sans simulateur, sans fourchette et sans cadrage gratuit : le simulateur de l'offre produit y renvoie les besoins de site seul. Les prix de l'objet `SITE_PRICING` sont des hypothèses de départ, à confirmer en chronométrant le premier site.

````text
Tu es designer produit et développeur front-end. Tu conçois la section « Offre Site » de la
page Offre et prix d'« Aldaron » (design/aldaron-web/Pricing.html), à côté de l'offre
produit pour les startups, sans modifier cette dernière.

## Contexte
- Aldaron a deux offres séparées. L'offre produit (startups, à partir de 2 500 €) a déjà
  sa section et son simulateur : ne les touche pas. L'offre Site s'adresse à quelqu'un qui
  veut seulement un site : un portfolio, le site vitrine d'une boutique ou d'une petite
  activité.
- C'est un catalogue : deux formules à prix fixe et affiché, sans simulateur, sans
  fourchette, sans cadrage gratuit. Le mot « devis » n'apparaît pas dans cette section, et
  « à partir de 2 500 € » n'y apparaît nulle part.
- Cible : indépendants, créatifs, commerçants, artisans, souvent non techniques. Ton
  chaleureux, direct, sans jargon : jamais « back-office » ni « CMS », mais « votre espace
  pour modifier le site ».
- Le client ne voit JAMAIS : un nombre de jours, de semaines ou de mois pour la
  construction, un tarif journalier, ni le détail du calcul. Deux exceptions seulement :
  la garantie « 30 jours de correction de bugs » et le forfait de maintenance « par mois ».
  La date de mise en ligne est confirmée par écrit après la commande, jamais promise sur
  la page.

## Contenu
Titre : « Un site, à prix fixe. » Sous-titre : « Le prix est affiché, il n'y a rien de
caché, et vous modifiez vous-même vos textes et vos photos. »

Deux cartes côte à côte (empilées sur mobile), même structure, chacune avec un bouton
« Choisir cette formule » qui présélectionne la formule dans le formulaire plus bas :
1. Portfolio · 600 € · « Pour une personne qui présente son travail : designer,
   développeur, photographe, consultant. »
   - Jusqu'à 5 pages : accueil, projets, articles, à propos, contact
   - 2 langues au choix : français, anglais, malgache
   - Votre espace pour ajouter et modifier vos projets, vos articles et vos textes
   - 1 tour de corrections avant la mise en ligne
2. Vitrine · 1 200 € · « Pour une boutique ou une petite activité qui veut être trouvée
   et montrer ses photos, son adresse et ses horaires. »
   - Jusqu'à 8 pages : accueil, présentation, produits ou services, galerie, infos
     pratiques (adresse, horaires, carte), actualités, contact
   - Jusqu'à 3 langues : français, anglais, malgache
   - Votre espace pour modifier le site, plus l'inscription à une lettre d'information
   - 2 tours de corrections avant la mise en ligne

Sous les cartes, un bloc « Compris dans les deux » : thème clair et sombre, affichage adapté
au téléphone, référencement de base (titres, descriptions, plan du site), formulaire de
contact, nom de domaine configuré, mise en ligne, 30 jours de correction de bugs.

Puis quatre blocs courts :
- « Ce que nous attendons de vous » : vos textes et vos photos avant le démarrage ; sans
  eux, la mise en ligne attend.
- « Ce qui n'est pas dans l'offre Site » : vente en ligne et paiement, comptes pour vos
  visiteurs, réservation, fonctions sur mesure. Phrase : « Vous avez un projet plus large ?
  Écrivez-nous, nous en parlons. » (lien vers le contact, aucun prix)
- « Après la mise en ligne » : hébergement et maintenance en option, 30 € par mois :
  mises à jour de sécurité, sauvegardes, petite aide pour vos contenus. Le nom de domaine
  est à votre nom (environ 15 € par an, payés par vous).
- « Paiement » : 50 % à la commande, 50 % à la mise en ligne.

Quatre étapes, en frise : 1. Vous choisissez une formule et remplissez le formulaire.
2. Vous nous envoyez vos textes et vos photos. 3. Nous construisons le site et vous le
montrons. 4. Mise en ligne, puis corrections.

## Le formulaire de commande (sous les étapes)
Champs : nom, e-mail, formule (choix unique Portfolio / Vitrine), « À quoi servira votre
site ? » (1 à 2 phrases), langues souhaitées (cases : français, anglais, malgache), nom de
domaine souhaité (facultatif). Bouton « Commander mon site ». À l'envoi : ouvre un e-mail à
contact@aldaron.eu, sujet « Commande Site Aldaron », avec les réponses (même mécanique que
le formulaire de cadrage existant). Note : « Pas de rendez-vous à prévoir : nous répondons
par écrit, avec la confirmation et la date de mise en ligne. »

## Liens avec le reste de la page
- Navigation : ajoute le lien « Site » vers cette section.
- Sous le titre de la page : la ligne « Vous voulez seulement un site ? Voir l'offre Site. »
- Les prix sont dans un objet SITE_PRICING en tête du script (portfolio 600, vitrine 1 200,
  maintenance 30), modifiable en direct depuis le panneau de réglages.

## Contraintes techniques et de design
- Ajoute la section à la page HTML existante, interactive (survol, focus, clic, états
  réels) ; CSS lisible et organisé en sections commentées (variables, base, composants,
  états, responsive) ; JavaScript dans la même page.
- Couleurs uniquement via les variables CSS (jetons du design system Aldaron) avec une
  valeur claire et une valeur sombre ; aucune couleur écrite en dur.
- Langues : français et anglais ; tous les textes dans l'objet de traduction existant,
  aucun texte écrit en dur dans le HTML. Dans les deux langues, aucun mot de durée du
  projet (durée, jour, semaine, mois / duration, day, week, month), sauf les deux
  exceptions ci-dessus.
- Panneau de réglages dans la page elle-même : thème clair / sombre, langue, point de
  rupture (mobile, tablette, ordinateur, grand écran), et les trois valeurs de
  SITE_PRICING.
- Accessibilité : libellé visible pour chaque champ ; groupes de choix en fieldset avec
  legend ; les deux formules dans une liste sémantique ; prix lu correctement par un
  lecteur d'écran (« 600 euros ») ; navigation complète au clavier, focus visible ;
  contraste AA ; cibles tactiles d'au moins 44 px.
- Pas de dégradés ni d'effets décoratifs qui ne se traduisent pas en CSS simple.
````

## Prochaines étapes

1. Choisir un projet pilote (réel ou interne) pour chronométrer la base de départ et les repères internes.
2. Extraire `1lalana-platform` en template sans métier et sans CMS, avec un générateur de projet.
3. Écrire la feuille d'estimation interne (repères en jours) et la liste exacte de la base de départ.
4. Rédiger le contrat type : prix, liste initiale des besoins, dates de début et de livraison, échéances de paiement (40 / 30 / 30), pause, propriété, garantie.
5. Préparer la page offre et prix (« à partir de 2 500 € », exemples avec leur prix seul), le simulateur indicatif, et un modèle de cadrage pour les premiers rendez-vous.
6. Valider le nom (marque et domaine) avant toute communication.
7. Chronométrer un premier site (portfolio ou vitrine) sur `portfolio-platform` pour confirmer les prix de l'offre Site, le coût d'hébergement par site et le forfait mensuel, puis publier la section Offre Site.
