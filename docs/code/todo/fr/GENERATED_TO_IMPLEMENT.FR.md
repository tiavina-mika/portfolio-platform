# Généré, pas encore branché

## Table des matières

- [Comment utiliser ce fichier](#comment-utiliser-ce-fichier)
- [Éléments en attente](#éléments-en-attente)
- [Switch](#switch)
- [Tabs](#tabs)
- [Table](#table)
- [Badge](#badge)
- [CardEyebrow](#cardeyebrow)

## Comment utiliser ce fichier

Liste le code écrit mais appelé nulle part (Cloud Function, job, route, cron, action, service) parce que l'endroit d'appel sortait du périmètre de la tâche. Une entrée `##` par élément, avec son fichier, son type, ce qu'il fait, où il doit être branché et pourquoi cela a été reporté (voir `.claude/rules/implementation-completeness.md`). Supprimer une entrée dès qu'elle est branchée.

## Éléments en attente

Les éléments ci-dessous.

## Switch

- **Fichier** : `apps/aldaron-web/components/ui/Switch.tsx`
- **Type** : Composant
- **Ce qu'il fait** : Basculer un réglage à effet immédiat
- **À brancher dans** : les pages du site public Aldaron qui en ont besoin
- **Pourquoi reporté** : fait partie du design system Aldaron, mais le site public n'est conçu qu'à l'étape 2 ; seule sa story l'utilise aujourd'hui

## Tabs

- **Fichier** : `apps/aldaron-web/components/ui/Tabs.tsx`
- **Type** : Composant
- **Ce qu'il fait** : Découper un écran en sections ou filtrer une liste
- **À brancher dans** : les pages du site public Aldaron qui en ont besoin
- **Pourquoi reporté** : fait partie du design system Aldaron, mais le site public n'est conçu qu'à l'étape 2 ; seule sa story l'utilise aujourd'hui

## Table

- **Fichier** : `apps/aldaron-web/components/ui/Table.tsx`
- **Type** : Composant
- **Ce qu'il fait** : Afficher une liste de données
- **À brancher dans** : les pages du site public Aldaron qui en ont besoin
- **Pourquoi reporté** : fait partie du design system Aldaron, mais le site public n'est conçu qu'à l'étape 2 ; seule sa story l'utilise aujourd'hui

## Badge

- **Fichier** : `apps/aldaron-web/components/ui/Badge.tsx`
- **Type** : Composant
- **Ce qu'il fait** : Afficher le statut d'un élément
- **À brancher dans** : les pages du site public Aldaron qui en ont besoin
- **Pourquoi reporté** : fait partie du design system Aldaron, mais le site public n'est conçu qu'à l'étape 2 ; seule sa story l'utilise aujourd'hui

## CardEyebrow

- **Fichier** : `apps/aldaron-web/components/ui/Card.tsx`
- **Type** : Composant
- **Ce qu'il fait** : Étiquette mono au-dessus du titre d'une carte, et les variantes de carte `muted`, `inverted` et `elevated`
- **À brancher dans** : les pages du site public Aldaron qui en ont besoin
- **Pourquoi reporté** : fait partie du design system Aldaron, mais le site public n'est conçu qu'à l'étape 2 ; seule sa story l'utilise aujourd'hui
