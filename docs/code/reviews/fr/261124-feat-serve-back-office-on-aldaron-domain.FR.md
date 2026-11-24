# Review — Servir le back-office sur un domaine Aldaron

- **Branche** : `feat/serve-back-office-on-aldaron-domain`
- **Type** : Nouvelle fonctionnalité
- **Auteur** : tiavina-mika — `tiavinamika@gmail.com`
- **Créé** : 2026-11-24 à 08:32
- **Apps touchées** : Serveur, Back-office

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

L'équipe Aldaron peut désormais avoir sa propre adresse de back-office au lieu de celle du portfolio. Un employé invité avec des rôles Aldaron uniquement reçoit un lien vers cette adresse, et l'e-mail d'invitation porte le nom et le site d'Aldaron. Ouvert sur cette adresse, le back-office démarre dans l'espace Aldaron. Rien ne change tant que les nouveaux réglages facultatifs ne sont pas renseignés.

## Base de données

Aucun changement en base.

## Serveur

- Trois réglages facultatifs : `AGENCY_SERVER_URL`, `AGENCY_WEBSITE_URL`, `AGENCY_APP_NAME`. Chacun retombe sur la valeur du portfolio quand il n'est pas défini ou laissé vide. Ils sont listés dans `docs/inventory/README.md`, `.env.example` et le guide de déploiement Render.
- L'invitation (`sendBOInvitation`) déduit l'espace des rôles accordés, jamais de la requête : Aldaron seulement si aucun rôle n'ouvre le portfolio, portfolio sinon (les rôles les plus élevés restent sur le portfolio).
- Le cadre de l'e-mail (lien du logo, liens du pied de page, nom) suit le même espace.
- Documentation : [EMAIL_NOTIFICATIONS.FR.md](../../architecture/fr/EMAIL_NOTIFICATIONS.FR.md).

## Back-office

- Sur l'adresse Aldaron (`VITE_AGENCY_HOSTNAME`), une première visite démarre dans l'espace Aldaron ; un choix mémorisé l'emporte, et un compte qui n'a que l'espace portfolio y reste.
- Les envois de fichiers appellent maintenant l'adresse d'où la page a été ouverte, comme le reste du back-office le faisait déjà.
- Aucune page modifiée : la page d'invitation reste `/invite`.

## Voir le résultat en local

`pnpm nx run server:dev` et `pnpm nx run bo:dev` (back-office sur `http://localhost:5174`). Tester une seconde adresse demande une entrée dans le fichier hosts : les étapes sont dans `tickets/work/serve-the-back-office-on-an-aldaron-domain/tc-manual.md`. Aucune story modifiée.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🔴 Haute | Bug | Un réglage laissé vide dans le fichier d'environnement (comme `.env.example` le fournit) arrêtait le serveur au démarrage : le contrôle d'URL simple refuse une valeur vide | Copie de `.env.example` sans remplir les nouvelles lignes | ✅ corrigé sur la branche : une valeur vide veut dire « non défini » (vérifié avec une valeur vide, valide et invalide) |
| 🟡 Faible | Régression | Les envois de fichiers appelaient une adresse fixe des réglages de build ; ils appellent maintenant l'adresse de la page, qui diffère si le back-office était hébergé à part du serveur | Back-office déployé sur un autre hôte que le serveur | ⏳ reporté — [dette n°1](debt/261124-feat-debt-serve-back-office-on-aldaron-domain.FR.md#1-les-envois-de-fichiers-suivent-ladresse-de-la-page) |
| 🟡 Faible | Bug | Les autres e-mails à un employé Aldaron (code de vérification, mot de passe oublié, alertes) gardent le cadre et le nom du portfolio | Tout e-mail de ce type | ⏳ reporté, existait avant la branche — [dette n°2](debt/261124-feat-debt-serve-back-office-on-aldaron-domain.FR.md#2-les-autres-e-mails-gardent-le-cadre-du-portfolio) |
| 🟡 Faible | Bug | Une personne invitée avec des rôles qui ouvrent les deux espaces reçoit le lien du portfolio | Invitation à rôles mixtes | ⏳ reporté — [dette n°3](debt/261124-feat-debt-serve-back-office-on-aldaron-domain.FR.md#3-les-rôles-mixtes-reçoivent-le-lien-du-portfolio) |

Détails et corrections : [fichier de dette](debt/261124-feat-debt-serve-back-office-on-aldaron-domain.FR.md).

## Ce qui reste à faire

- Nom de domaine, DNS et certificat HTTPS, puis les quatre réglages (de votre côté). À renseigner en dernier : un lien vers une adresse qui ne répond pas encore serait cassé.
- Les cas manuels de `tc.md` (seconde adresse) n'ont pas été exécutés.
