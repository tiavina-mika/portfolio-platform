# Generated, not yet wired

## Table of Contents

- [How to use this file](#how-to-use-this-file)
- [Pending items](#pending-items)
- [Switch](#switch)
- [Tabs](#tabs)
- [Table](#table)
- [Badge](#badge)
- [CardEyebrow](#cardeyebrow)

## How to use this file

Lists the code that was written but is not yet called from anywhere (Cloud Function, job, route, cron, action, service) because the call site was out of scope of the task. One `##` entry per item, with its file, type, what it does, where it must be wired and why it was deferred (see `.claude/rules/implementation-completeness.md`). Remove an entry as soon as it is wired.

## Pending items

The items below.

## Switch

- **File**: `apps/aldaron-web/components/ui/Switch.tsx`
- **Type**: Component
- **What it does**: Toggle a setting that applies at once
- **Needs wiring in**: the pages of the Aldaron public site that need it
- **Why deferred**: part of the Aldaron design system, but the public site is only designed in step 2; only its story uses it today

## Tabs

- **File**: `apps/aldaron-web/components/ui/Tabs.tsx`
- **Type**: Component
- **What it does**: Split a screen in sections or filter a list
- **Needs wiring in**: the pages of the Aldaron public site that need it
- **Why deferred**: part of the Aldaron design system, but the public site is only designed in step 2; only its story uses it today

## Table

- **File**: `apps/aldaron-web/components/ui/Table.tsx`
- **Type**: Component
- **What it does**: Show a list of data
- **Needs wiring in**: the pages of the Aldaron public site that need it
- **Why deferred**: part of the Aldaron design system, but the public site is only designed in step 2; only its story uses it today

## Badge

- **File**: `apps/aldaron-web/components/ui/Badge.tsx`
- **Type**: Component
- **What it does**: Show the status of an item
- **Needs wiring in**: the pages of the Aldaron public site that need it
- **Why deferred**: part of the Aldaron design system, but the public site is only designed in step 2; only its story uses it today

## CardEyebrow

- **File**: `apps/aldaron-web/components/ui/Card.tsx`
- **Type**: Component
- **What it does**: Mono label above the title of a card, and the `muted`, `inverted` and `elevated` card variants
- **Needs wiring in**: the pages of the Aldaron public site that need it
- **Why deferred**: part of the Aldaron design system, but the public site is only designed in step 2; only its story uses it today
