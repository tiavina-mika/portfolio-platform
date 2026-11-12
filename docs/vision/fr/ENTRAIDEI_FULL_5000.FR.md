# Entraid'ei — tout pour 5 000 € (design fourni)

## Table des matières

- [Base de calcul](#base-de-calcul)
- [Répartition du prix](#répartition-du-prix)
- [Contenu](#contenu)
- [Hypothèses et risques](#hypothèses-et-risques)

> Tout le projet Entraid'ei pour 5 000 € en 3 mois, design fourni : les 210 écrans de la maquette (appels compris), l'hébreu, la messagerie temps réel, le scan du passeport, Google et Apple, et le back-office de modération. Même grille que [la vision Aldaron](ALDARON_VISION.FR.md) ; le détail écran par écran est dans le [devis complet](ENTRAIDEI_QUOTE.FR.md). Les montants sont des hypothèses à valider.

## Base de calcul

Le périmètre est fixé (tout) et le prix est un forfait. La grille ne donne donc pas le prix : elle donne la **valeur** du périmètre, et le forfait est une remise sur cette valeur.

| Étape | Calcul | Résultat |
|---|---|---|
| Socle mobile | | 1 000 € |
| Écrans mobiles (environ 125) | | 9 320 € |
| Intégrations : passeport 1 200 €, Google et Apple 800 €, géocodage 400 €, messagerie temps réel (Stream) 1 200 € | | 3 600 € |
| Appels audio (environ 6 écrans et une intégration à 1 200 €) | | 1 700 € |
| Hébreu (15 % du coût des écrans traduits) | 15 % de 9 320 € | 1 400 € |
| Back-office de modération (13 écrans) | | 730 € |
| **Valeur du périmètre à la grille** | | **17 750 €** |
| Forfait | | 5 000 € |
| Remise | 17 750 − 5 000 | 12 750 € (72 %) |
| Part du forfait pour chaque euro de grille | 5 000 / 17 750 | 0,282 |

À zéro dans ce forfait : le socle web (site public, CMS), la formule minimum et les maquettes. Une application mobile seule part de la base technique d'Entraid'ei (Expo, Supabase) : le socle mobile couvre déjà l'authentification et la mise en production. Le design est fourni et doit suivre le système de design existant, sinon le multiplicateur de complexité s'applique.

Contrôle du plancher : le plancher d'un devis est le nombre de jours de travail × 114 €, avec un minimum de 1 000 €. Sur la base de temps ci-dessous (environ 44 jours), il est de 5 016 € : le forfait de 5 000 € est pile à ce niveau, ce qui est logique puisque le tarif de 114 € vient de ce calcul. Il n'y a donc aucune marge de sécurité sur le prix.

**Base de temps.** Le développement est fait avec Claude, à environ 10 écrans par jour (chiffre fourni, à mesurer).

| Poste | Calcul | Jours |
|---|---|---|
| Écrans mobiles, appels compris (environ 131) et back-office (13) | 144 / 10 | 14,5 |
| Socle mobile et intégrations (passeport, Google et Apple, géocodage, messagerie temps réel, appels) | hypothèse | 14 |
| Hébreu (écriture de droite à gauche) | hypothèse | 3 |
| Relecture, corrections, tests sur appareils | hypothèse, environ 30 % du reste | 10 |
| Stores (soumission, resoumission) | hypothèse | 2 |
| **Total** | | **environ 44** |

Sur 44 jours de travail effectif, 5 000 € font environ **114 € par jour**, et il reste 22 jours de marge sur les 66 du délai. Les lignes marquées « hypothèse » ne viennent pas d'une mesure : voir [Hypothèses et risques](#hypothèses-et-risques).

## Répartition du prix

Le forfait est réparti au prorata de la valeur de la grille. Utile pour les jalons de facturation.

| Poste | Valeur à la grille | Part du forfait |
|---|---|---|
| Socle mobile | 1 000 € | 282 € |
| Accueil et connexion (7 écrans) | 480 € | 135 € |
| Inscription par passeport (6 écrans) | 390 € | 110 € |
| Inscription par formulaire (10 écrans) | 680 € | 192 € |
| Parrainage (10 écrans, ×1,5) | 1 020 € | 287 € |
| Photo, foulard, carte de membre (5 écrans) | 310 € | 87 € |
| Explorer et filtres (11 écrans) | 830 € | 234 € |
| Annonces (8 écrans, ×1,5) | 900 € | 254 € |
| Messages et demandes (9 écrans) | 770 € | 217 € |
| Notifications (1 écran) | 80 € | 23 € |
| Profil, écussons, CV (15 écrans) | 1 090 € | 307 € |
| Paramètres et aide (11 écrans) | 640 € | 180 € |
| Pages légales (6 écrans) | 380 € | 107 € |
| Annuaire, favoris, filtres (21 écrans) | 1 450 € | 408 € |
| États et modération (5 écrans) | 300 € | 84 € |
| Scan et vérification du passeport | 1 200 € | 338 € |
| Connexion Google et Apple | 800 € | 225 € |
| Géocodage des villes et recherche par rayon | 400 € | 113 € |
| Messagerie temps réel (Stream) | 1 200 € | 338 € |
| Appels audio | 1 700 € | 479 € |
| Hébreu | 1 400 € | 394 € |
| Back-office de modération (13 écrans) | 730 € | 206 € |
| **Total** | **17 750 €** | **5 000 €** |

Facturation proposée : 40 % à la signature (2 000 €), 30 % à la préproduction (1 500 €), 30 % à la mise en production (1 500 €).

## Contenu

Les 210 écrans de la maquette, sans exception : les 203 écrans de l'application, les 7 écrans d'appels, en français, en anglais et en hébreu. Les états, variantes et fenêtres sont inclus dans le prix de la vue (un prix par vue distincte, soit environ 131 vues facturées).

Le back-office web couvre les 13 écrans de modération : signalements (liste et fiche), sanctions, fiche membre, demandes d'aide au parrainage, pertes d'accès, référentiels (groupes locaux, secteurs et catégories, langues), FAQ, versions légales, version minimale de l'app, export RGPD.

Entraid'ei n'a pas de paiement. S'il y en avait un, ce serait 60 € de plus par intégration de paiement, hors forfait.

## Hypothèses et risques

1. **Le chiffre de 10 écrans par jour mesure la production, pas la livraison.** Il ne dit pas combien de temps prennent la relecture, la fidélité à la maquette, les tests sur de vrais appareils et les corrections. À valider en chronométrant les 10 premiers écrans, du premier prompt à l'écran relu et testé, avant de signer.
2. **Le forfait ne vaut que grâce à Claude.** Au rythme de la grille (un écran vaut environ une demi-journée à 90 € par jour), tout le périmètre représenterait environ 197 jours de travail à la main. Si l'outil n'est plus disponible ou change de tarif, le prix n'est plus tenable.
3. **Le coût de Claude** (abonnement, jetons) est à retirer du forfait : il réduit le gain réel.
4. **La remise de 72 % n'est pas une remise « modérée ».** La vision prévoit une remise modérée contre un témoignage. À écrire dans le contrat comme une remise pilote : valeur 17 750 €, forfait 5 000 €, avec la contrepartie (témoignage, étude de cas, droit de montrer le produit).
5. **Tout dépassement est pour vous.** Un seul écran refait, un changement de design ou un retard de validation des stores mange la marge. Le périmètre doit être figé par écrit, avec la liste des écrans et la règle de comptage.
6. **Le scan du passeport dépend de l'EEIF.** Sans base d'adhérents à interroger, son prix n'a plus de sens.
7. **Coûts récurrents élevés pour le client.** La messagerie tierce passe d'environ 0 à environ 400 $ par mois au-delà de 1 000 utilisateurs actifs, et les appels audio ajoutent un coût à la minute. Le client doit le savoir avant de signer.
8. **L'hébreu** : l'écriture de droite à gauche touche toutes les mises en page, et les textes doivent être fournis ou relus par le client.
9. **Stores.** Les délais de validation (Apple 1 à 3 jours, parfois plus) et l'ouverture d'un compte Apple organisation (numéro D-U-N-S, plusieurs semaines) sont à lancer dès la signature.
