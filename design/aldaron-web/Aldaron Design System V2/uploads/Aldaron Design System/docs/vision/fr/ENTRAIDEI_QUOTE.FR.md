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
| Socle mobile (Expo, Supabase, authentification, navigation, internationalisation, thème clair et sombre, push, mise en production, publication sur les stores) | 270 € |
| Écrans mobiles (environ 125, voir ci-dessous) | 2 483 € |
| Intégrations tierces | 970 € |
| Back-office de modération (13 écrans) | 278 € |
| **Total** | **4 001 €** |

Facturation proposée : 1 600 € à la signature, 1 200 € à la préproduction, 1 201 € à la mise en production.

## Écrans mobiles

Chaque écran est facturé 16 € de base, plus les suppléments de la grille (caméra, service, carte, filtres ou workflow). Le détail écran par écran des modules d'accueil, d'inscription, de parrainage, de photo et de messages est dans [le lot](ENTRAIDEI_LOT_5000.FR.md) ; les autres modules sont chiffrés à la même grille. Un écran compte pour un seul, quel que soit le nombre de ses états. Le ×1,5 de complexité métier est appliqué au parrainage, aux annonces et aux demandes de contact.

| Module | Écrans | Montant |
|---|---|---|
| Accueil et connexion | 7 | 127 € |
| Inscription par passeport | 6 | 104 € |
| Inscription par formulaire | 10 | 181 € |
| Parrainage (×1,5) | 10 | 272 € |
| Photo, foulard, carte de membre | 5 | 83 € |
| Explorer et filtres | 11 | 221 € |
| Publication et gestion des annonces (×1,5) | 8 | 240 € |
| Messages et demandes (demandes ×1,5) | 9 | 204 € |
| Notifications | 1 | 21 € |
| Profil, écussons, CV | 15 | 291 € |
| Paramètres et aide | 11 | 171 € |
| Pages légales | 6 | 101 € |
| Annuaire, favoris, filtres | 21 | 387 € |
| États et modération | 5 | 80 € |
| **Total** | **125** | **2 483 €** |

## Intégrations et back-office

| Poste | Montant | Remarque |
|---|---|---|
| Scan et vérification du passeport | 200 € | Une seule implémentation (l'inscription). Suppose qu'on puisse vérifier l'authenticité ; on ne sait pas si l'EEIF a une base d'adhérents ou une API |
| Messagerie en temps réel (Stream) | 500 € | |
| Connexion Google et Apple | 210 € | 90 € + 120 € |
| Géocodage des villes et recherche par rayon | 60 € | Autocomplétion d'adresse, une implémentation |
| **Total intégrations** | **970 €** | |
| Back-office de modération : 13 écrans | 278 € | 7 à 26 € (signalements, sanctions, fiche membre, aide au parrainage, pertes d'accès, export RGPD) et 6 à 16 € (référentiels, FAQ, versions légales, version minimale) |

Le back-office demande 13 écrans spécifiques : signalements, sanctions, demandes d'aide au parrainage, pertes d'accès, référentiels, FAQ, versions légales, version minimale, export RGPD.

## Options et exclusions

- **Hébreu** : +15 % du coût des écrans traduits (écriture de droite à gauche, alphabet non latin), soit environ 370 €.
- **Appels audio** : hors périmètre dans les documents du projet. À titre indicatif, environ 630 € (environ 6 écrans à 133 € et une intégration à 500 €, au prix de la messagerie en temps réel).
- **Maquettes** : 0 €, la maquette existe déjà.
- **Paiement** : Entraid'ei n'en a pas. S'il y en avait un, ce serait 500 € de plus pour le premier paiement, puis 80 € par paiement supplémentaire.
- **Frais récurrents** (hébergement, services) : à la charge du client. L'estimation du projet donne environ 85 $/mois au lancement ; au-delà de 1 000 utilisateurs actifs, la messagerie fait passer ce montant à environ 500 $/mois.
- **Maintenance après les 30 jours** : forfait mensuel de 150 à 400 €.

## Points à trancher avant d'envoyer le devis

1. **Ni socle complet ni formule minimum.** Entraid'ei est une application mobile seule, sans site web ni back-office complexe. Elle repose sur sa propre base technique (Expo, Supabase), et le socle mobile couvre l'authentification et la mise en production. Le back-office de modération est chiffré écran par écran.
2. **Une partie est peut-être déjà faite.** Le suivi du projet montre l'app Expo, le design system, l'internationalisation et l'écran de choix de langue déjà posés. S'ils sont déjà payés, retirer le socle mobile (270 €) et l'écran de langue (16 €).
3. **Le scan du passeport est le plus gros risque.** Sans base d'adhérents à interroger, le prix de 200 € ne tient plus.
4. **Comptes des stores** : Apple propose une exonération possible pour une association (99 $/an sinon) ; Google coûte 25 $ une fois.

Contrôle du tarif journalier : à environ 3 mois de travail (66 jours ouvrés), 4 001 € font environ 61 € par jour, sous le tarif de référence de 114 € par jour. Ce devis seul ne couvre donc pas le travail réel : avec les appels audio et l'hébreu, la valeur monte à 5 006 € et le forfait de 5 000 € (voir [tout le mobile pour 5 000 €](ENTRAIDEI_FULL_5000.FR.md)) est la référence retenue. Calcul grossier, à confirmer par un chronométrage réel.
