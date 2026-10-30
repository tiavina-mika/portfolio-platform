# Revue — Adoption du back-office 1lalana avec une séparation `_core` / `_domain`

- **Branche** : `feat/core-domain-split`
- **Type** : Nouvelle fonctionnalité (grosse refonte de la structure)
- **Auteur** : tiavina-mika — `tiavinamika@gmail.com` (GitHub : `tiavina-mika`)
- **Créé** : 2026-10-30 à 08:17
- **Apps touchées** : Serveur, Back-office, Site web, bibliothèques partagées

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Back-office](#back-office)
- [Site web](#site-web)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

Le portfolio tourne maintenant sur le back-office générique de la plateforme 1lalana. Le code du serveur et du back-office est séparé en une partie générique (`_core` : comptes, rôles, contenu, tickets, notifications, signalements, tableaux de bord) et la partie propre au portfolio (`_domain` : les projets), décrite dans [CORE_DOMAIN.FR.md](../../architecture/fr/CORE_DOMAIN.FR.md). L'administrateur dispose de nombreux nouveaux écrans (notifications, signalements, journal d'audit, invitation d'utilisateurs avec double authentification). Le site garde le design du portfolio sur la structure de 1lalana : le blog remplace l'adresse des articles, la page de contact passe en `/contact`, un abonnement à la newsletter doit maintenant être confirmé par e-mail, et les pages peuvent être imbriquées par catégorie. Les anciennes adresses redirigent définitivement. Les rôles sont renommés (`OWNER`, `SUPER_ADMIN`, ...), et un serveur déployé refuse maintenant de démarrer sans deux adresses de propriétaires ni les clés SMS et de cache.

## Base de données

| Classe | Nouvelle ? | Champs ajoutés / modifiés | À quoi ça sert |
|---|---|---|---|
| `_Role` | non | noms en majuscules ; `countries`, délai d'inactivité | rôles `OWNER`, `SUPER_ADMIN`, `MANAGER`, `SUPPORT_VIEWER`, `TEAM_LEAD` |
| `_User` | non | `emailVerified`, `phoneVerified`, `phone`, champs MFA et sessions | contacts vérifiés, double authentification |
| `Contact` | non | `reference`, `priority`, `subject`, `phone`, `source`, `lastMessageAt`, `seen` | le formulaire de contact devient un ticket de support |
| `Newsletter` | non | `confirmed`, `confirmationTokenHash`, `seen` | double opt-in |
| `Invitation`, `TicketMessage`, `Notification`, `NotificationResend`, `Payment`, `Report`, `UserAuditLog`, `RoleAuditLog`, `SessionAuditLog`, `MfaAuditLog`, `UserSession`, `ContentVersion`, `ImpersonationSession`, `PushReceipt`, `UserModerationLog`, `PenaltyLog` | oui | tous | back-office générique (liste complète dans [l'inventaire](../../../inventory/code/fr/COLLECTIONS_AND_INDEXES.FR.md)) |

Index : déclarés dans le code par le core (voir la page d'inventaire ci-dessus). Les lignes créées avant la branche n'ont aucun des nouveaux champs : les lectures les traitent comme absents.

## Serveur

- Dossiers séparés en `_core` / `_domain` ; les fonctions de `Project` sont `getProjects`, `getProject`, `getProjectForClient`, avec leurs triggers, chiffres de tableau de bord et entrée de recherche globale.
- Environ 150 Cloud Functions, 13 tâches planifiées, constructeurs d'e-mails et de SMS, limitation de débit sur Redis, alertes Slack (voir [l'inventaire](../../../inventory/README.md)).
- Nouvelles variables d'environnement et services : Upstash Redis, MMSDuck (SMS), Expo push, webhook d'alertes Slack, Sentry, `WEBSITE_REVALIDATE_SECRET`. L'en-tête de requête est maintenant `X-portfolio-key`.
- `validateEnv` : en `preProduction` et `production`, `OWNERS_EMAILS` exige deux adresses distinctes, et `MMSDUCK_API_KEY` et `WEBSITE_REVALIDATE_SECRET` sont requis.

## Back-office

- **Pages touchées** : tout le back-office (URL locale : le serveur de dev Vite de `pnpm nx run bo:dev`, ou l'URL du serveur une fois le build copié).
- Le menu comprend maintenant Tableau de bord, Contenu (articles, pages, catégories, projets), Opérations (contacts en tickets, signalements, notifications, paiements, finance, statistiques), Utilisateurs, Rôles, Paramètres, Divers. L'inscription se fait sur invitation uniquement ; la double authentification, les sessions, l'usurpation d'identité et un journal des rôles existent. Les pages de fonctionnalités sont dans [docs/features/bo](../../../features/bo/README.md).
- Les écrans de projets (liste, aperçu, ajout / modification) vivent dans `_domain`.

## Site web

- **Pages touchées** (langue par défaut `fr`, `http://localhost:9012/fr/...`) : accueil, `/projects`, `/projects/<slug>`, `/blog`, `/blog/<slug>`, `/contact`, `/newsletter/confirmer/<jeton>`, `/newsletter/<chiffré>/se-desabonner`, pages imbriquées `/<slug>/<sous-catégorie>/...`, `/sitemap`.
- `/articles` redirige vers `/blog` et `/contact-me` vers `/contact` (définitif). Nouveau : `/pages/sitemap.xml`, `/api/revalidate` (le serveur demande au site de rafraîchir son cache). Supprimé : `/api/recaptcha-verification` (la vérification est passée côté serveur).
- Le visiteur reçoit un e-mail d'accusé de réception après le formulaire de contact, et doit confirmer un abonnement à la newsletter. Les pages de fonctionnalités sont dans [docs/features/web](../../../features/web/README.md).

## Voir le résultat en local

```bash
pnpm nx run server:dev
pnpm nx run bo:dev
pnpm nx run web:dev
```

Les ports viennent du fichier d'environnement de chaque app (site : `http://localhost:9012`). Le site a Storybook (`pnpm nx run web:sb`, `http://localhost:6016`), inchangé par cette branche.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟠 Moyenne | Régression | Les comptes d'une base existante gardent les rôles `Owner` / `Administrator` / `Manager`, que le code ne reconnaît plus : personne n'est de niveau le plus haut et le BO n'affiche rien | premier déploiement sur une base existante | ⏳ reporté — [dette n°1](debt/261030-feat-debt-core-domain-split.FR.md#1-les-rôles-existants-ne-sont-pas-renommés) |
| 🟠 Moyenne | Bug | Un portfolio à un seul propriétaire ne démarre pas une fois déployé (2 adresses, clé SMS, secret de cache requis) | déploiement en pré-production / production | ⏳ reporté — [dette n°2](debt/261030-feat-debt-core-domain-split.FR.md#2-un-serveur-déployé-exige-deux-propriétaires-et-une-clé-sms) |
| 🟡 Faible | Bug | Des classes vides et verrouillées (`Ride`, `Request`, ...) peuvent être créées au démarrage par la reconstruction des permissions de classe | démarrage | ⏳ reporté — [dette n°3](debt/261030-feat-debt-core-domain-split.FR.md#3-des-noms-de-classes-de-covoiturage-restent-dans-le-core) |
| 🟡 Faible | Bug | La colonne « projets récents » du tableau de bord et la recherche de projets par auteur ne fonctionnent pas ; la restauration de version n'est pas branchée pour les projets | tableau de bord, liste des projets | ⏳ reporté — [dette n°4](debt/261030-feat-debt-core-domain-split.FR.md#4-trous-sur-les-projets-dans-le-tableau-de-bord-la-recherche-et-les-versions) |
| 🟡 Faible | Bug | Le back-office appelle 17 Cloud Functions que le serveur ne définit pas (finance, 4 vues de statistiques sur 5, suspensions, réservations) ; l'entrée de menu `Diffusion` est masquée pour tous | ouverture de ces écrans | ⏳ reporté — [dette n°5](debt/261030-feat-debt-core-domain-split.FR.md#5-écrans-du-back-office-sans-serveur-ni-source-de-données) |
| 🟡 Faible | Bug | `next build` du site exige un serveur Parse joignable | build local / CI | ⏳ reporté — [dette n°6](debt/261030-feat-debt-core-domain-split.FR.md#6-le-build-du-site-exige-un-serveur-parse) |
| 🟡 Faible | Faille | `resubscribeNewsletter` réactive une adresse jamais confirmée, depuis n'importe quel lien de désabonnement valide | newsletter | ⏳ reporté — [dette n°7](debt/261030-feat-debt-core-domain-split.FR.md#7-le-réabonnement-contourne-le-double-opt-in) |
| 🟡 Faible | Bug | Restes côté site : langue des messages d'erreur zod, fichiers inutilisés, clés obsolètes, FAQ non portée, pas de langue `mg` | site | ⏳ reporté — [dette n°8](debt/261030-feat-debt-core-domain-split.FR.md#8-restes-côté-site) |
| 🟡 Faible | Bug | Vocabulaire de covoiturage dans les textes finance, statistiques et tickets ; le contenu de la FAQ est l'ancienne FAQ de trajets avec l'ancienne marque | back-office, shared-faq | ⏳ reporté — [dette n°9](debt/261030-feat-debt-core-domain-split.FR.md#9-vocabulaire-et-contenu-de-covoiturage) |
| 🟡 Faible | Dette | Tests, Storybook du back-office, e2e, mobile, app de docs et notation non portés ; deux dépendances inutilisées du back-office | — | ⏳ reporté — [dette n°10](debt/261030-feat-debt-core-domain-split.FR.md#10-non-porté-et-dépendances-inutilisées) |

Rien de ce qui a été trouvé ne bloque la fusion ; les deux premiers points demandent une action au déploiement. Voir le [fichier de dette](debt/261030-feat-debt-core-domain-split.FR.md).

## Ce qui reste à faire

Les dix points de dette ci-dessus. Non testé dans un navigateur pendant cette revue : les correctifs et écrans ont été vérifiés dans le code seulement.
