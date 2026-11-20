# Entraid'ei — tout pour 5 000 € (design fourni)

## Table des matières

- [Base de calcul](#base-de-calcul)
- [Répartition du prix](#répartition-du-prix)
- [Contenu](#contenu)
- [Hypothèses et risques](#hypothèses-et-risques)

> Tout le projet Entraid'ei pour 5 000 € en 3 mois, design fourni : les 210 écrans de la maquette (appels compris), l'hébreu, la messagerie temps réel, le scan du passeport, Google et Apple, et le back-office de modération. Même grille que [la vision Aldaron](ALDARON_VISION.FR.md) ; le détail écran par écran est dans le [devis complet](ENTRAIDEI_QUOTE.FR.md). Les montants sont des hypothèses à valider.

## Base de calcul

Le périmètre est fixé (tout) et le prix est un forfait : Entraid'ei a été réalisé pour 5 000 €, et la grille mobile de [la vision Aldaron](ALDARON_VISION.FR.md) est calée sur ce projet. La grille donne la **valeur** du périmètre (5 006 €), et le forfait de 5 000 € est le prix de la grille (remise de 6 €, environ 0 %).

| Étape | Calcul | Résultat |
|---|---|---|
| Socle mobile | | 270 € |
| Écrans mobiles (environ 125) | | 2 483 € |
| Intégrations : passeport 200 €, Google 90 € et Apple 120 €, géocodage 60 €, messagerie temps réel (Stream) 500 € | | 970 € |
| Appels audio (environ 6 écrans à 133 € et une intégration à 500 €) | | 633 € |
| Hébreu (15 % du coût des écrans traduits) | 15 % de 2 483 € | 372 € |
| Back-office de modération (13 écrans) | | 278 € |
| **Valeur du périmètre à la grille** | | **5 006 €** |
| Forfait | | 5 000 € |
| Remise | 5 006 − 5 000 | 6 € (≈ 0 %) |
| Part du forfait pour chaque euro de grille | 5 000 / 5 006 | 0,9988 |

À zéro dans ce forfait : le socle web (site public, CMS), la formule minimum et les maquettes. Une application mobile seule part de la base technique d'Entraid'ei (Expo, Supabase) : le socle mobile couvre déjà l'authentification et la mise en production. Le design est fourni et doit suivre le système de design existant, sinon le multiplicateur de complexité s'applique.

Trois précisions de lecture de la grille :

- **Connexion et inscription.** Le socle mobile couvre la logique d'authentification (comptes, sessions, mise en production). Les écrans « Accueil et connexion » et d'inscription sont facturés à part parce qu'ils reprennent la mise en page de la maquette : ce n'est pas un doublon.
- **Base de l'hébreu.** Les 15 % portent sur les seuls écrans mobiles (2 483 €). Les écrans d'appels (environ 133 €) et le back-office, non traduits, sont hors de cette base ; l'écart d'environ 20 € sur les écrans d'appels est absorbé dans le forfait.
- **Intégrations à la première implémentation.** Chaque service est compté une seule fois, configuration comprise : passeport 200 €, Google 90 € et Apple 120 €, autocomplétion d'adresse 60 € (pour le géocodage des villes), messagerie temps réel 500 €. Les appels audio sont chiffrés au prix de la messagerie temps réel (500 €), faute de ligne dédiée dans la grille.

Contrôle du plancher : le plancher d'un devis est le nombre de jours de travail × 114 €, avec un minimum de 1 000 €. Sur la base de temps ci-dessous (environ 44 jours), il est de 5 016 € : le forfait de 5 000 € est pile à ce niveau, ce qui est logique puisque le tarif de 114 € vient de ce calcul. Il n'y a donc aucune marge de sécurité sur le prix. Ce tarif de 114 € par jour est celui du travail effectif avec Claude ; il ne se compare pas aux 90 € par jour du risque 2, qui servent à valoriser le même périmètre fait à la main.

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
| Socle mobile | 270 € | 270 € |
| Accueil et connexion (7 écrans) | 127 € | 127 € |
| Inscription par passeport (6 écrans) | 104 € | 104 € |
| Inscription par formulaire (10 écrans) | 181 € | 181 € |
| Parrainage (10 écrans, ×1,5) | 272 € | 272 € |
| Photo, foulard, carte de membre (5 écrans) | 83 € | 83 € |
| Explorer et filtres (11 écrans) | 221 € | 221 € |
| Annonces (8 écrans, ×1,5) | 240 € | 240 € |
| Messages et demandes (9 écrans) | 204 € | 204 € |
| Notifications (1 écran) | 21 € | 21 € |
| Profil, écussons, CV (15 écrans) | 291 € | 290 € |
| Paramètres et aide (11 écrans) | 171 € | 171 € |
| Pages légales (6 écrans) | 101 € | 101 € |
| Annuaire, favoris, filtres (21 écrans) | 387 € | 386 € |
| États et modération (5 écrans) | 80 € | 80 € |
| Scan et vérification du passeport | 200 € | 200 € |
| Connexion Google et Apple | 210 € | 210 € |
| Géocodage des villes et recherche par rayon | 60 € | 60 € |
| Messagerie temps réel (Stream) | 500 € | 499 € |
| Appels audio | 633 € | 632 € |
| Hébreu | 372 € | 371 € |
| Back-office de modération (13 écrans) | 278 € | 277 € |
| **Total** | **5 006 €** | **5 000 €** |

Facturation proposée : 40 % à la signature (2 000 €), 30 % à la préproduction (1 500 €), 30 % à la mise en production (1 500 €).

## Contenu

Les 210 écrans de la maquette, sans exception : les 203 écrans de l'application, les 7 écrans d'appels, en français, en anglais et en hébreu. Les états, variantes et fenêtres sont inclus dans le prix de la vue (un prix par vue distincte, soit environ 131 vues facturées).

Le back-office web couvre les 13 écrans de modération : signalements (liste et fiche), sanctions, fiche membre, demandes d'aide au parrainage, pertes d'accès, référentiels (groupes locaux, secteurs et catégories, langues), FAQ, versions légales, version minimale de l'app, export RGPD.

Entraid'ei n'a pas de paiement. S'il y en avait un, ce serait 500 € de plus pour le premier paiement, puis 80 € par paiement supplémentaire, hors forfait.

## Hypothèses et risques

1. **Le chiffre de 10 écrans par jour mesure la production, pas la livraison.** Il ne dit pas combien de temps prennent la relecture, la fidélité à la maquette, les tests sur de vrais appareils et les corrections. À valider en chronométrant les 10 premiers écrans, du premier prompt à l'écran relu et testé, avant de signer.
2. **Le forfait ne vaut que grâce à Claude.** La grille (écran à 16 €) suppose le rythme de 10 écrans par jour avec l'outil. À la main, un écran vaut environ une demi-journée à 90 € par jour : tout le périmètre représenterait environ 160 jours de travail. Si l'outil n'est plus disponible ou change de tarif, le prix n'est plus tenable.
3. **Le coût de Claude** (abonnement, jetons) est à retirer du forfait : il réduit le gain réel.
4. **La remise est négligeable (environ 0 %).** La valeur à la grille est de 5 006 € et le forfait de 5 000 € : le forfait est le prix de la grille, sans remise commerciale à écrire dans le contrat.
5. **Tout dépassement est pour vous.** Un seul écran refait, un changement de design ou un retard de validation des stores mange la marge. Le périmètre doit être figé par écrit, avec la liste des écrans et la règle de comptage.
6. **Le scan du passeport dépend de l'EEIF.** Sans base d'adhérents à interroger, son prix n'a plus de sens.
7. **Coûts récurrents élevés pour le client.** La messagerie tierce passe d'environ 0 à environ 400 $ par mois au-delà de 1 000 utilisateurs actifs, et les appels audio ajoutent un coût à la minute. Le client doit le savoir avant de signer.
8. **L'hébreu** : l'écriture de droite à gauche touche toutes les mises en page, et les textes doivent être fournis ou relus par le client.
9. **Stores.** Les délais de validation (Apple 1 à 3 jours, parfois plus) et l'ouverture d'un compte Apple organisation (numéro D-U-N-S, plusieurs semaines) sont à lancer dès la signature.
