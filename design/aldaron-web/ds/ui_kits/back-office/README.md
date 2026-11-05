# UI kit — Back-office du socle

Recréation cliquable du back-office livré dans le socle Aldaron à 5 000 €. Aucune maquette source n'existait : les écrans sont composés à partir des composants du système, d'après le périmètre décrit dans la vision de la société (auth + MFA, rôles, CMS, contacts, journal d'audit, paramètres). À recaler sur 1lalana-platform (`_core`) lors de l'extraction du template.

Parcours : Connexion → code MFA (6 chiffres) → Tableau de bord → Utilisateurs (inviter, actions de ligne, suppression avec annulation) → Contenus (filtres, éditeur FR/EN) → Paramètres (onglets). Thème sombre dans la barre du haut ou le menu du profil.

| Fichier | Contenu |
|---|---|
| `Shell.jsx` | Barre latérale, barre du haut, en-tête de page |
| `Login.jsx` | Connexion, erreur, étape MFA |
| `Dashboard.jsx` | Statistiques, graphique, journal, derniers contacts |
| `Users.jsx` | Tableau, invitations, dialogue d'invitation |
| `Content.jsx` | Liste d'articles, éditeur bilingue |
| `Settings.jsx` | Profil, sécurité, notifications |

Non recréés (placeholder) : Contacts reçus, Rôles et droits, Journal d'audit.
