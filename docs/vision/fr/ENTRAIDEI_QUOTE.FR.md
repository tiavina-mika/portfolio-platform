# Devis estimatif — Entraid'ei

## Table des matières

- [Résumé](#résumé)
- [Écrans mobiles](#écrans-mobiles)
- [Intégrations et back-office](#intégrations-et-back-office)
- [Options et exclusions](#options-et-exclusions)
- [Points à trancher avant d'envoyer le devis](#points-à-trancher-avant-denvoyer-le-devis)

> Estimation chiffrée avec la grille de [la vision Aldaron](ALDARON_VISION.FR.md). Les écrans sont comptés à partir de la liste des écrans et du cahier des charges du projet Entraid'ei ; le détail de chaque écran et la liste des points à clarifier n'ont pas été relus. Les montants sont des hypothèses à valider.

## Résumé

Application mobile (Expo) plus back-office web de modération.

| Poste | Montant |
|---|---|
| Socle mobile (Expo, Supabase, authentification, navigation, internationalisation, thème clair et sombre, push, mise en production, publication sur les stores) | 1 000 € |
| Écrans mobiles (environ 125, voir ci-dessous) | 9 320 € |
| Intégrations tierces | 3 600 € |
| Back-office de modération (13 écrans) | 730 € |
| **Total** | **14 650 €** |

Facturation proposée : 5 860 € à la signature, 4 395 € à la préproduction, 4 395 € à la mise en production.

## Écrans mobiles

Chaque écran est facturé 60 € de base, plus les suppléments de la grille (caméra, service, carte, filtres ou workflow). Un écran compte pour un seul, quel que soit le nombre de ses états. Le ×1,5 de complexité métier est appliqué au parrainage, aux annonces et aux demandes de contact.

| Module | Écrans | Montant |
|---|---|---|
| Accueil et connexion | 7 | 480 € |
| Inscription par passeport | 6 | 390 € |
| Inscription par formulaire | 10 | 680 € |
| Parrainage (×1,5) | 10 | 1 020 € |
| Photo, foulard, carte de membre | 5 | 310 € |
| Explorer et filtres | 11 | 830 € |
| Publication et gestion des annonces (×1,5) | 8 | 900 € |
| Messages et demandes (demandes ×1,5) | 9 | 770 € |
| Notifications | 1 | 80 € |
| Profil, écussons, CV | 15 | 1 090 € |
| Paramètres et aide | 11 | 640 € |
| Pages légales | 6 | 380 € |
| Annuaire, favoris, filtres | 21 | 1 450 € |
| États et modération | 5 | 300 € |
| **Total** | **125** | **9 320 €** |

## Intégrations et back-office

| Poste | Montant | Remarque |
|---|---|---|
| Scan et vérification du passeport | 1 200 € | Suppose qu'on puisse vérifier l'authenticité ; on ne sait pas si l'EEIF a une base d'adhérents ou une API |
| Messagerie en temps réel (Stream) | 1 200 € | |
| Connexion Google et Apple | 800 € | 2 × 400 € |
| Géocodage des villes et recherche par rayon | 400 € | |
| **Total intégrations** | **3 600 €** | |
| Back-office de modération : 13 écrans | 730 € | 7 à 70 € (signalements, sanctions, fiche membre, aide au parrainage, pertes d'accès, export RGPD) et 6 à 40 € (référentiels, FAQ, versions légales, version minimale) |

Le back-office demande 13 écrans spécifiques : signalements, sanctions, demandes d'aide au parrainage, pertes d'accès, référentiels, FAQ, versions légales, version minimale, export RGPD.

## Options et exclusions

- **Hébreu** : +15 % du coût des écrans traduits (écriture de droite à gauche, alphabet non latin), soit environ 1 400 €.
- **Appels audio** : hors périmètre dans les documents du projet. À titre indicatif, environ 1 700 € (environ 6 écrans et une intégration à 1 200 €).
- **Maquettes** : 0 €, la maquette existe déjà.
- **Paiement** : Entraid'ei n'en a pas. S'il y en avait un, ce serait 60 € de plus par intégration de paiement.
- **Frais récurrents** (hébergement, services) : à la charge du client. L'estimation du projet donne environ 85 $/mois au lancement ; au-delà de 1 000 utilisateurs actifs, la messagerie fait passer ce montant à environ 500 $/mois.
- **Maintenance après les 30 jours** : forfait mensuel de 150 à 400 €.

## Points à trancher avant d'envoyer le devis

1. **Ni socle complet ni formule minimum.** Entraid'ei est une application mobile seule, sans site web ni back-office complexe. Elle repose sur sa propre base technique (Expo, Supabase), et le socle mobile couvre l'authentification et la mise en production. Le back-office de modération est chiffré écran par écran.
2. **Une partie est peut-être déjà faite.** Le suivi du projet montre l'app Expo, le design system, l'internationalisation et l'écran de choix de langue déjà posés. S'ils sont déjà payés, retirer le socle mobile (1 000 €) et l'écran de langue (60 €).
3. **Le scan du passeport est le plus gros risque.** Sans base d'adhérents à interroger, le prix de 1 200 € ne tient plus.
4. **Comptes des stores** : Apple propose une exonération possible pour une association (99 $/an sinon) ; Google coûte 25 $ une fois.

Contrôle du tarif journalier : à environ 3 mois de travail (66 jours ouvrés), 14 650 € font environ 222 € par jour, au-dessus du tarif de référence de 114 € par jour. Calcul grossier, à confirmer par un chronométrage réel.
