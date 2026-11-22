# Revue — Ajouter un lanceur de tests au serveur

- **Branche** : `chore/add-server-test-runner`
- **Type** : Maintenance
- **Auteur** : tiavina-mika — `tiavinamika@gmail.com` *(identité git locale ; `gh api user` n'était pas disponible)*
- **Créée** : 2026-11-22 à 13:37
- **Apps touchées** : Serveur

## Table des matières

- [En bref](#en-bref)
- [Base de données](#base-de-données)
- [Serveur](#serveur)
- [Voir le résultat en local](#voir-le-résultat-en-local)
- [Bugs, régressions et failles possibles](#bugs-régressions-et-failles-possibles)
- [Résultat par critère d'acceptation](#résultat-par-critère-dacceptation)
- [Vérifications lancées](#vérifications-lancées)
- [Ce qui reste à faire](#ce-qui-reste-à-faire)

## En bref

Le serveur peut maintenant lancer des tests unitaires : `pnpm nx run server:test` lance Vitest (le lanceur
déjà utilisé par le site) sur les fichiers `*.test.ts` placés à côté du code. Un premier test couvre le
masquage des e-mails, numéros de téléphone et identifiants montrés aux admins. Le job CI « Unit tests of
affected projects » n'ignore plus le serveur : une PR qui le touche lance ses tests. Personne n'a rien à
faire : `pnpm install` apporte Vitest, aucune nouvelle variable d'environnement. Aucun changement visible pour
les utilisateurs.

## Base de données

Aucun changement de base de données.

## Serveur

- Nouvelle cible `test` (Vitest, environnement Node, `vitest.config.ts` reprend l'alias `@/` comme les
  configs TypeScript et SWC).
- Le build laisse les `*.test.ts` hors de `dist/` (vérifié après un build : aucun fichier de test dedans).
- `vitest.config.ts` est ignoré par ESLint comme les autres fichiers d'outillage : sinon la correction
  automatique des extensions ESM réécrit `vitest/config` en `vitest/config.js`, que Vitest n'exporte pas.
- Docs : le `CLAUDE.md` du serveur (nouvelle section « Tests »), l'inventaire CI
  ([CI_WORKFLOWS.FR.md](../../../inventory/code/fr/CI_WORKFLOWS.FR.md)) et
  [GETTING_STARTED.FR.md](../../../getting-started/fr/GETTING_STARTED.FR.md) (`pnpm nx run-many -t test`).

## Voir le résultat en local

```bash
pnpm install
pnpm nx run server:test
```

Attendu : `Test Files 1 passed`, `Tests 10 passed`.

## Bugs, régressions et failles possibles

| Gravité | Type | Ce qui peut arriver | Quand | Suite |
|---|---|---|---|---|
| 🟡 Faible | Régression | Le typecheck du build lit maintenant aussi les fichiers de test, qui importent `vitest` : un build lancé sans les dépendances de dev échouerait | Un déploiement qui n'installe que les dépendances de production | ✅ rien à faire : le build a déjà besoin des dépendances de dev (`typescript`, `@swc/cli`) ; le build Render installe avec `--prod=false` |
| 🟡 Faible | Bug | Un utilitaire de test qui ne s'appelle pas `*.test.ts` (données de test, fabriques) est compilé dans `dist/` | Quelqu'un ajoute un tel fichier | ✅ convention écrite dans le `CLAUDE.md` du serveur (tests à côté du code, `*.test.ts`) ; le fichier serait mort, rien ne l'importe à l'exécution |

## Résultat par critère d'acceptation

| Critère | Résultat | Preuve |
|---|---|---|
| `pnpm nx run server:test` tourne et passe avec un test d'exemple | Traité | `pnpm nx run server:test` : 1 fichier, 10 tests passés |
| Le job CI « unit tests of affected projects » lance les tests du serveur | Traité en local, confirmé par la CI de la PR | `.github/workflows/ci.yml` n'exclut plus `server` ; `pnpm nx show projects --with-target test` → `["server"]` |
| Les docs ne disent plus que le serveur n'a pas de lanceur de tests | Partiel | `CLAUDE.md` du serveur, commentaire CI, inventaire CI mis à jour ; `.claude/rules/engineering-principles.md` et `.claude/skills/dev/SKILL.md` le disent encore : les modifications sous `.claude/` ont été refusées dans la session sans humain |

Écart avec le plan : le plan ajoutait `vitest.config.ts` à `tsconfig.json` ; il est ignoré par ESLint à la
place (voir « Serveur »).

## Vérifications lancées

- `pnpm nx run-many -t test lint typecheck build -p server` : les quatre au vert, aucun avertissement de lint.
- `dist/` après le build : aucun fichier `*.test.*`.
- Un test temporaire important via `@/` et `@shared/utils` est passé, puis a été supprimé.
- `pnpm lint:docs`, `pnpm check-doc-links`, `pnpm check-doc-twins --worktree` : au vert.

## Ce qui reste à faire

- Mettre à jour la formulation de `.claude/rules/engineering-principles.md` et `.claude/skills/dev/SKILL.md` :
  ticket `006-update-the-test-runner-wording-of-the-claude-rules` (demande l'accord d'un humain).
- Pas de lanceur dans le back-office (hors périmètre).
