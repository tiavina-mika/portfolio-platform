# Entraid'ei — tout pour 5 000 € (design fourni)

## Table des matières

- [Base de calcul](#base-de-calcul)
- [Paiement](#paiement)
- [Contenu](#contenu)
- [Hypothèses et risques](#hypothèses-et-risques)

> Le projet Entraid'ei à prix fixe, environ 5 000 €, design fourni : l'application mobile, la messagerie temps réel, le scan du passeport, Google et Apple, et le back-office de modération. Le client ne voit que le prix. Les jours ci-dessous sont l'estimation interne d'Aldaron, qui fixe le prix à la valeur interne de 114 € par jour (voir [la vision Aldaron](ALDARON_VISION.FR.md) et l'[estimation de faisabilité](ENTRAIDEI_QUOTE.FR.md)). Les montants sont des hypothèses à valider.

## Base de calcul

Calcul interne, jamais montré au client. L'estimation du périmètre donne 39,1 jours ; avec une marge de 10 % pour la relecture, les tests et les imprévus, cela fait 44 jours annoncés (39,1 ÷ 0,9, arrondi au jour supérieur), soit 5 016 € à 114 € par jour, chiffrés **5 000 €** (arrondi à la centaine la plus proche, bien au-dessus du minimum de 2 500 €). Le prix est fixe : les jours de marge ne sont pas facturés à part, ils absorbent les imprévus.

| Poste | Jours |
|---|---|
| Socle mobile | 2,4 |
| Écrans mobiles (environ 125) | 21,8 |
| Intégrations : passeport, Google et Apple, géocodage, messagerie temps réel | 8,5 |
| Back-office de modération (13 écrans) | 6,4 |
| **Total** | **39,1** |
| Jours annoncés (39,1 ÷ 0,9, arrondi au jour supérieur) | 44 |

L'estimation occupe 89 % des jours annoncés : les environ 5 jours de marge servent à la relecture, aux tests et aux imprévus.

Deux précisions de lecture :

- **Connexion et inscription.** Le socle mobile couvre la logique d'authentification (comptes, sessions, mise en production). Les écrans « Accueil et connexion » et d'inscription sont comptés à part parce qu'ils reprennent la mise en page de la maquette : ce n'est pas un doublon.
- **Intégrations.** Chaque service est compté une seule fois, configuration comprise.

**Deuxième estimation, par le bas.** Le développement est fait avec Claude, à environ 10 écrans par jour (chiffre fourni, à mesurer).

| Poste | Calcul | Jours |
|---|---|---|
| Écrans mobiles (environ 125) et back-office (13) | 138 / 10 | 13,8 |
| Socle mobile et intégrations (passeport, Google et Apple, géocodage, messagerie temps réel) | hypothèse | 12 |
| Relecture, corrections, tests sur appareils | hypothèse, environ 30 % du reste | 8 |
| Stores (soumission, resoumission) | hypothèse | 2 |
| **Total** | | **environ 36** |

Les deux estimations (36 et 39 jours) tiennent dans les 44 jours annoncés, avec une marge de 5 à 8 jours. Les lignes marquées « hypothèse » ne viennent pas d'une mesure : voir [Hypothèses et risques](#hypothèses-et-risques).

## Paiement

Le prix de 5 000 € est payé en trois échéances liées à l'avancement : **2 000 € à la signature (40 %), 1 500 € à la livraison du premier lot (30 %), 1 500 € à la mise en ligne (30 %)**, avant la remise du code et des comptes. Le premier lot ([52 écrans](ENTRAIDEI_LOT_5000.FR.md), en interne environ 14 jours de travail) fait office de démonstration de mi-parcours. Si la startup arrête en cours de route, les échéances déjà payées restent acquises à Aldaron et le code produit jusqu'à la dernière échéance payée lui est remis.

## Contenu

Les 203 écrans de l'application, en français et en anglais. Les états, variantes et fenêtres sont inclus dans la vue (une vue distincte compte pour un écran, soit environ 125 vues).

Le back-office web couvre les 13 écrans de modération : signalements (liste et fiche), sanctions, fiche membre, demandes d'aide au parrainage, pertes d'accès, référentiels (groupes locaux, secteurs et catégories, langues), FAQ, versions légales, version minimale de l'app, export RGPD.

Entraid'ei n'a pas de paiement. S'il y en avait un, ce serait en interne environ 4 à 5 jours de plus, soit environ 500 € de plus sur le devis.

## Hypothèses et risques

1. **Le chiffre de 10 écrans par jour mesure la production, pas la livraison.** Il ne dit pas combien de temps prennent la relecture, la fidélité à la maquette, les tests sur de vrais appareils et les corrections. À valider en chronométrant les 10 premiers écrans, du premier prompt à l'écran relu et testé, avant de signer.
2. **Le prix ne tient que grâce à Claude.** Les jours internes supposent environ 10 écrans par jour avec l'outil. À la main, un écran prend environ une demi-journée : les 138 écrans représenteraient environ 69 jours, et tout le périmètre environ 100 jours de travail. Si l'outil n'est plus disponible ou change de tarif, le prix fixe n'est plus tenable et la perte est pour Aldaron.
3. **Le coût de Claude** (abonnement, jetons) est à retirer du prix : il réduit le gain réel.
4. **La marge est faible.** Environ 5 jours sur 44. La valeur interne de 114 € par jour vient de ce calcul (5 000 € pour 44 jours) : elle n'apporte aucune sécurité sur le prix.
5. **Un dépassement est pour Aldaron.** Le prix est fixe : un écran refait, un changement de design ou un retard de validation des stores consomme la marge, puis oblige à retirer un besoin ou à faire un nouveau devis pour l'ajout. La liste initiale des besoins est écrite au contrat, avec la règle de comptage des écrans.
6. **Le scan du passeport dépend de l'EEIF.** Sans base d'adhérents à interroger, il ne tient plus : un essai court et borné (en interne 2 jours), puis décision du client.
7. **Coûts récurrents élevés pour le client.** La messagerie tierce passe d'environ 0 à environ 400 $ par mois au-delà de 1 000 utilisateurs actifs. Le client doit le savoir avant de signer.
8. **Stores.** Les délais de validation (Apple 1 à 3 jours, parfois plus) et l'ouverture d'un compte Apple organisation (numéro D-U-N-S, plusieurs semaines) sont à lancer dès la signature.
