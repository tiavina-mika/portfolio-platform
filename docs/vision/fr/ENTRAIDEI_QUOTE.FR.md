# Estimation de faisabilité — Entraid'ei

## Table des matières

- [Résumé](#résumé)
- [Écrans mobiles](#écrans-mobiles)
- [Intégrations et back-office](#intégrations-et-back-office)
- [Exclusions](#exclusions)
- [Points à trancher avant d'envoyer le devis](#points-à-trancher-avant-denvoyer-le-devis)

> Estimation interne, jamais montrée au client : elle donne le nombre de jours du cadrage décrit dans [la vision Aldaron](ALDARON_VISION.FR.md). Le client ne voit qu'un prix (environ 5 000 €), calculé à partir du nombre de jours annoncé (44 jours à la valeur interne de 114 €) ; ce document ne chiffre pas des écrans, il mesure du temps. Les écrans sont comptés à partir de la liste des écrans et du cahier des charges du projet Entraid'ei ; le détail de chaque écran et la liste des points à clarifier n'ont pas été relus. Les jours sont la valeur de l'ancienne grille d'écrans divisée par 114 € ; ils incluent la relecture et les tests. À valider sur un chronométrage réel.

## Résumé

Application mobile (Expo) plus back-office web de modération.

| Poste | Jours |
|---|---|
| Socle mobile (Expo, Supabase, authentification, navigation, internationalisation, thème clair et sombre, push, mise en production, publication sur les stores) | 2,4 |
| Écrans mobiles (environ 125, voir ci-dessous) | 21,8 |
| Intégrations tierces | 8,5 |
| Back-office de modération (13 écrans) | 6,4 |
| **Total** | **39,1** |

| Jours annoncés | Calcul | Prix | Part consommée par l'estimation (39,1 jours) |
|---|---|---|---|
| 44 | 39,1 ÷ 0,9, arrondi au jour supérieur | 44 × 114 € = 5 016 €, chiffrés 5 000 € (au-dessus du minimum de 2 500 €) | 89 % |

Paiement : en trois échéances liées à l'avancement, 40 % à la signature, 30 % au premier lot, 30 % à la mise en ligne (voir [tout le mobile pour 5 000 €](ENTRAIDEI_FULL_5000.FR.md)).

## Écrans mobiles

Un écran compte pour un seul, quel que soit le nombre de ses états. Le détail écran par écran des modules d'accueil, d'inscription, de parrainage, de photo et de messages est dans [le lot](ENTRAIDEI_LOT_5000.FR.md) ; les autres modules sont estimés avec les mêmes repères. Le ×1,5 de complexité métier est appliqué au parrainage, aux annonces et aux demandes de contact.

| Module | Écrans | Jours |
|---|---|---|
| Accueil et connexion | 7 | 1,1 |
| Inscription par passeport | 6 | 0,9 |
| Inscription par formulaire | 10 | 1,6 |
| Parrainage (×1,5) | 10 | 2,4 |
| Photo, foulard, carte de membre | 5 | 0,7 |
| Explorer et filtres | 11 | 1,9 |
| Publication et gestion des annonces (×1,5) | 8 | 2,1 |
| Messages et demandes (demandes ×1,5) | 9 | 1,8 |
| Notifications | 1 | 0,2 |
| Profil, écussons, CV | 15 | 2,6 |
| Paramètres et aide | 11 | 1,5 |
| Pages légales | 6 | 0,9 |
| Annuaire, favoris, filtres | 21 | 3,4 |
| États et modération | 5 | 0,7 |
| **Total** | **125** | **21,8** |

## Intégrations et back-office

| Poste | Jours | Remarque |
|---|---|---|
| Scan et vérification du passeport | 1,8 | Une seule implémentation (l'inscription). Suppose qu'on puisse vérifier l'authenticité ; on ne sait pas si l'EEIF a une base d'adhérents ou une API : c'est l'intégration à essayer 2 jours avant de s'engager |
| Messagerie en temps réel (Stream) | 4,4 | |
| Connexion Google et Apple | 1,8 | |
| Géocodage des villes et recherche par rayon | 0,5 | Autocomplétion d'adresse, une implémentation |
| **Total intégrations** | **8,5** | |
| Back-office de modération : 13 écrans | 6,4 | 7 écrans complexes (signalements, sanctions, fiche membre, aide au parrainage, pertes d'accès, export RGPD) et 6 écrans simples (référentiels, FAQ, versions légales, version minimale) |

## Exclusions

- **Langues** : français et anglais uniquement.
- **Maquettes** : aucun temps, la maquette existe déjà.
- **Paiement** : Entraid'ei n'en a pas. S'il y en avait un, ce serait environ 4 à 5 jours de plus.
- **Frais récurrents** (hébergement, services) : à la charge du client. L'estimation du projet donne environ 85 $/mois au lancement ; au-delà de 1 000 utilisateurs actifs, la messagerie fait passer ce montant à environ 500 $/mois.
- **Maintenance après les 30 jours** : forfait mensuel de 150 à 400 €.

## Points à trancher avant d'envoyer le devis

1. **Un prix, pas un devis par écran.** Entraid'ei est une application mobile seule, sans site web ni back-office complexe. Elle repose sur sa propre base technique (Expo, Supabase), et le client voit un seul prix, calculé à partir des 44 jours internes : environ 5 000 €.
2. **Le projet tient dans les 44 jours annoncés, avec peu de marge.** Il faut environ 39 jours de travail pour 44 annoncés, soit environ 5 jours de marge ; le détail est dans [tout le mobile pour 5 000 €](ENTRAIDEI_FULL_5000.FR.md#base-de-calcul).
3. **Une partie est peut-être déjà faite.** Le suivi du projet montre l'app Expo, le design system, l'internationalisation et l'écran de choix de langue déjà posés. S'ils sont déjà payés, retirer le socle mobile (2,4 jours) : le projet passe à environ 36,7 jours et la marge augmente.
4. **Le scan du passeport est le plus gros risque.** Sans base d'adhérents à interroger, il ne tient plus : un essai court et borné (en interne 2 jours), puis le client décide de continuer, avec un prix ajusté si besoin, ou d'abandonner (le parrainage reste alors la seule voie d'inscription).
5. **Comptes des stores** : Apple propose une exonération possible pour une association (99 $/an sinon) ; Google coûte 25 $ une fois.

Contrôle de la valeur interne : 5 000 € pour environ 44 jours font environ 114 € par jour, soit exactement la valeur de référence, puisque cette valeur vient de ce calcul. Ce contrôle ne dit donc pas que le prix est rentable, seulement qu'il est cohérent avec la vision. Calcul grossier, à confirmer par un chronométrage réel.
