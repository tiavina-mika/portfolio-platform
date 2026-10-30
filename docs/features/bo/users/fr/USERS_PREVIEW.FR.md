# Cas d'utilisation — Utilisateurs (Fiche)

## Table des matières

- [Où trouver cette page](#où-trouver-cette-page)
- [À quoi sert cette page](#à-quoi-sert-cette-page)
- [Qui peut l'utiliser](#qui-peut-lutiliser)
- [Ce que l'on voit à l'écran](#ce-que-lon-voit-à-lécran)
- [Actions possibles](#actions-possibles)
- [Cas d'utilisation typiques](#cas-dutilisation-typiques)
- [Points d'attention / limites actuelles](#points-dattention--limites-actuelles)

## Où trouver cette page

Liste des **Utilisateurs** → clic sur une ligne, ou icône « œil » de la colonne Actions. On y arrive aussi
depuis la recherche globale, une notification ou un signalement.

## À quoi sert cette page

Consulter la fiche d'un compte, l'aider à retrouver l'accès, gérer ses sessions, le suspendre ou le
bannir, lui donner des postes et lui écrire.

## Qui peut l'utiliser

Le droit **Consulter** sur la ressource « Utilisateurs » ouvre la fiche ; sans lui, ou si le compte
n'existe plus, l'écran « introuvable » s'affiche. Les actions sur le compte (fermer des sessions, suspendre,
aide au compte) demandent le droit **Modifier** sur les utilisateurs ; donner des postes demande la gestion
du personnel ; « Se connecter en tant que » demande le droit d'impersonation. Les comptes Owner et Super
Admin ont tous les droits.

## Ce que l'on voit à l'écran

Un en-tête avec le nom, l'état (compte vérifié ou non, en ligne, suspendu, banni, back-office) et la date
d'arrivée. Un bandeau signale un compte suspendu, banni ou supprimé par le membre. Les informations sont
rangées en sections, avec un sommaire :

- **Profil** : détails, contact, contact d'urgence (non modifiable depuis le back-office).
- **Accès** : **sessions actives** (appareil, système, mode de connexion, dernière connexion), **aide au
  compte**, plate-formes utilisées, **postes** (seulement pour un compte créé dans le back-office).
- **Activité** : paiements.
- **Modération** : suspension, historique des bannissements, signalements contre le membre et faits par lui.
- **Échanges** : tickets au support, notifications reçues.
- **Historique** : consultations de la fiche et journaux d'audit du compte.

Les sections qui décrivent un compte de covoiturage (véhicules, trajets, demandes, avis) n'ont pas de
contenu pour un portfolio.

## Actions possibles

Menu **Actions** de l'en-tête :

- **Suspendre le compte** (24 h, 48 h ou 7 jours, avec un motif) et **Lever la suspension**.
- **Bannir** (temporaire ou permanent, avec un motif) et **Débannir**.
- **Déconnecter tous les appareils** ; chaque session peut aussi être déconnectée une à une, avec la
  possibilité de suspendre le compte en même temps.
- **Réinitialiser la double authentification** du compte : le compte est déconnecté partout et devra la
  reconfigurer à sa prochaine connexion.
- **Se connecter en tant que** : démarre une session de support sur ce compte, avec un motif obligatoire
  conservé dans l'historique ; jamais possible sur un compte Owner ou Super Admin.
- **Voir les paiements** et **Voir l'audit** : raccourcis vers ces listes filtrées sur le compte.
- **Écrire à l'utilisateur** : bouton d'envoi de message.

Section **Aide au compte** (chaque action demande un motif, consigné dans l'historique) : renvoyer le code
de vérification, changer le numéro ou l'e-mail, changer le pays, envoyer un code de réinitialisation du mot
de passe.

Section **Postes** : ajouter ou retirer un poste (voir [Droits et postes](../../roles/fr/ROLES.FR.md)).

## Cas d'utilisation typiques

1. **Donner l'accès au back-office** : fiche d'un compte de l'équipe → ajouter un poste.
2. **Suspendre un compte** après un signalement, puis lever la suspension.
3. **Aider quelqu'un qui n'accède plus à son compte** : section Aide au compte.
4. **Couper un appareil perdu** : déconnecter ses sessions.
5. **Reproduire un problème** : session « Se connecter en tant que ».

## Points d'attention / limites actuelles

- Les postes ne se gèrent que pour les comptes créés dans le back-office, et pas pour soi-même.
- Il n'y a pas de bouton de suppression dans la fiche : la suppression se fait depuis la liste.
- La fiche est en lecture seule : on ne modifie ni le nom ni les coordonnées, seulement via l'aide au compte.
- Le bouton « Lever la suspension » de la page Statistiques > Annulations ne fonctionne pas pour l'instant.
- Une grande partie des sections (véhicules, trajets, avis, SMS de secours) vient d'une autre application et
  reste vide.
