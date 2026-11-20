# Offre et prix : composants réutilisables

Emplacement supposé : `pages/pricing/Pricing.dc.html`. À confirmer avec le dépôt de code ; les blocs ci-dessous sont à extraire dans `containers/pricing/` (domaine tarif) quand le chemin est validé.

## PlanCard (carte de formule)
Rôle : présenter un point d'entrée (prix, contenu, non-inclus, délai). Construit sur `Card`.
Variantes : `default` (formule minimum) ; `inverted` (socle complet, une seule par section). Option : bloc « Non inclus » présent seulement si renseigné.

## OptionsTable (tableau d'options)
Rôle : lister les options à la carte, une ligne par option : libellé, précision, prix en mono.
Variantes : lignes avec ou sans précision ; en étroit, le prix passe sous le libellé. Même gabarit pour la grille des écrans mobiles (libellé + prix, sans précision).

## QuoteLine (ligne de devis)
Rôle : une ligne de calcul. Deux usages : (1) récapitulatif du simulateur (libellé, montant, fond encre) ; (2) exemple de devis (cas, détail, total, bouton « Charger dans le simulateur »).
Variantes : récapitulatif / exemple ; total « à partir de » en texte.

## RuleBlock (bloc de règles)
Rôle : énoncer une règle de périmètre ou de facturation : étiquette mono + phrase. Construit sur `Card` `default`.
Variantes : avec ou sans titre ; grille auto-ajustée (1 à 3 colonnes).

## Stepper (ligne du simulateur)
Rôle : choisir une quantité (− n +, 44 px) avec libellé et prix unitaire. Variante désactivée (45 %) quand la formule minimum exclut le poste.
