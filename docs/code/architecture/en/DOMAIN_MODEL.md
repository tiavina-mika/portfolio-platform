# Domain Model

## Table of Contents

- [Overview](#overview)
- [Conventions shared by the collections](#conventions-shared-by-the-collections)
  - [Translated fields](#translated-fields)
  - [Soft delete](#soft-delete)
  - [Files](#files)
- [Content collections](#content-collections)
  - [Project](#project)
  - [Article](#article)
  - [Page](#page)
  - [PageSection](#pagesection)
  - [Category](#category)
  - [App](#app)
- [Visitor collections](#visitor-collections)
  - [Contact](#contact)
  - [Newsletter](#newsletter)
- [Access collections](#access-collections)
  - [User](#user)
  - [Role](#role)
- [Relations](#relations)
- [Server-side behavior on save](#server-side-behavior-on-save)

## Overview

Data lives in MongoDB and is read and written through Parse Server (`apps/server`). The collection names shared by the apps are in `libs/shared-constants/src/collection.constants.ts` (`Article`, `Newsletter`, `Page`, `Category`, `Project`, `Contact`, `App`). `PageSection`, `_User` and `_Role` are used by name in the Cloud Code and are not part of that constant. A `Test` class also exists, used only by the test functions and jobs.

The fields below are the ones the code reads or writes (Cloud Code triggers and the `*Attributes` interfaces of `apps/bo`). Parse adds `objectId`, `createdAt`, `updatedAt` and `ACL` to every class.

## Conventions shared by the collections

### Translated fields

The locales are `fr`, `en` and `mg` (`libs/shared-constants/src/locale.constants.ts`, default `fr`). Texts of Project, Article, Page, PageSection and Category are stored in a `translated` object whose keys are the locales, a fixed set declared by the code:

```ts
translated: { fr: { title, slug, ... }, en: { title, slug, ... }, mg: { ... } }
```

On every save of those collections the server fills the missing `slug` (slugified from the title or name), `metaTitle` and `metaDescription` of each locale present.

### Soft delete

Content, users, contacts and newsletter subscriptions carry a `deleted` boolean. Deleting from the back-office sets `deleted: true` (and `deletedAt` / `deletedBy` where the trigger sets them); the record is destroyed later from the back-office recycle bin (`destroyUsers` only destroys users already marked deleted). Public queries such as `getArticleForClient` filter on `deleted: false` and `active: true`.

### Files

Images and documents are stored on Cloudinary and referenced by an object `{ url, publicId }` (`IFileCloud`). When an item is soft-deleted its files are moved to a `recycleBin/` folder; when an item is destroyed or a file is replaced, the old files are destroyed. The job `clearRecycleBinInCloudJob` empties that folder.

## Content collections

### Project

A portfolio project.

| Field | Content |
|---|---|
| `translated` | per locale: `title`, `name`, `description`, `content`, `societyDescription`, and the SEO fields `slug`, `metaTitle`, `metaDescription`, `tags` |
| `logo`, `image`, `previewImage`, `images` | files |
| `editorFiles` | files inserted in the rich-text editor |
| `website`, `society`, `youtube` | strings |
| `links`, `repositories`, `npm`, `codesandbox` | arrays of `{ url }` |
| `platforms`, `technologies`, `types` | arrays of strings (technologies come from `PROJECT_TECHNOLOGIES` in `libs/shared-domain-constants`) |
| `categories` | pointers to `Category` |
| `dateStart`, `dateEnd` | dates |
| `shares`, `totalMediaShare` | share counters per social network, and their total |
| `active`, `deleted`, `user`, `deletedAt` | publication state, owner, soft delete |

### Article

A blog article.

| Field | Content |
|---|---|
| `translated` | per locale: `title`, `description`, `content`, `slug`, `metaTitle`, `metaDescription`, `tags` |
| `image`, `previewImage`, `images`, `editorFiles` | files |
| `categories` | pointers to `Category`; moved to `deletedCategories` when the article is soft-deleted |
| `shares`, `totalMediaShare` | share counters |
| `active`, `deleted` | publication state, soft delete |
| `user`, `updatedBy`, `deletedBy`, `deletedAt` | audit fields set by the triggers |

### Page

An editorial page.

| Field | Content |
|---|---|
| `translated` | per locale: `name`, `title`, `description`, `content`, `blockTitle`, `blockDescription` and the SEO fields |
| `bannerImage`, `previewImage`, `images`, `editorFiles` | files |
| `categories`, `deletedCategories` | pointers to `Category` |
| `sections` | pointers to `PageSection` |
| `linkLocations` | where the page is linked: `menu`, `footer` |
| `active`, `deleted`, `user`, `updatedBy`, `deletedBy`, `deletedAt` | state and audit fields |

### PageSection

A section grouping pages.

| Field | Content |
|---|---|
| `translated` | per locale: `title`, `description` |
| `pages` | pointers to `Page` |
| `blocks` | list of `{ id, translated, image, imagePosition }` (`imagePosition`: `left`, `right`, `bottom`) |
| `active`, `deleted`, `user`, `updatedBy`, `deletedBy`, `deletedAt` | state and audit fields |

### Category

A category of articles or pages.

| Field | Content |
|---|---|
| `translated` | per locale: `name`, `slug`, `tags` |
| `entity` | `article` or `page`: the kind of item the category applies to |
| `image` | file |
| `itemCount` | number of linked items, maintained by a job |
| `active`, `deleted`, `user`, `updatedBy`, `deletedBy`, `deletedAt` | state and audit fields |

### App

Site-level settings with three files: `image`, `imageForDarkMode` and `cv` (served through `GET /download/cv.pdf`). When one of them changes the old file is destroyed.

## Visitor collections

### Contact

A message sent from the public contact form.

| Field | Content |
|---|---|
| `email`, `name`, `message` | submitted by the visitor; validated server-side (name 120 characters at most, message 500) |
| `locale` | locale of the visitor, passed in the save context |
| `user` | pointer to the `_User` having the same email, if any |
| `replied`, `repliedAt`, `repliedBy` | set when the back-office marks the message as replied |
| `deleted` | soft delete |

### Newsletter

A newsletter subscription.

| Field | Content |
|---|---|
| `email` | subscriber email |
| `language` | locale in which articles are sent |
| `active` | `false` once unsubscribed |
| `unsubscribeAt`, `reason` | date and reason of the unsubscription (`tooFrequent`, `notInterested`, `notRelevant`, `other`) |
| `user` | pointer to the `_User` having the same email, if any |
| `deleted` | soft delete |

## Access collections

### User

A back-office user (`_User`). The email is also the username.

| Field | Content |
|---|---|
| `email`, `username`, `password`, `firstName`, `lastName` | identity; the password is 8 to 64 characters |
| `verified` | email confirmed |
| `verification` | `{ code, expiredAt }`: the 6-digit code is stored encrypted and valid for 1 hour |
| `platforms` | list of `{ name, count, lastConnectedAt }` per platform of connection (`web`, `bo`, `android`, `ios`) |
| `locale` | preferred language |
| `isOnline`, `seen` | presence, and whether the back-office has displayed the new user |
| `banned`, `bans` | ban flag and history of `{ bannedAt, bannedBy, until }` |
| `deleted`, `deletedAt`, `deletedBy` | soft delete |

### Role

A role (`_Role`), standard Parse fields (`name`, `users`, `roles` for the parent roles) plus two custom fields: `rights` (per collection) and `ui` (back-office areas). See [RIGHTS_ROLES.md](RIGHTS_ROLES.md).

## Relations

```text
User ──< Role (users relation)         Role >── Role (parent roles)
User ──< Project / Article / Page / PageSection / Category (user, updatedBy, deletedBy)
Article / Page / Project >──< Category (categories)
Page >──< PageSection (sections / pages)
Contact >── User (user, matched by email)
Newsletter >── User (user, matched by email)
```

## Server-side behavior on save

| Collection | `beforeSave` | `afterSave` / `afterDelete` |
|---|---|---|
| Project | slugs and SEO defaults; sets `user`, `deleted: false` on creation; increments `totalMediaShare` when `shares` changes | moves files to the recycle bin on delete, destroys replaced files; destroys files on destroy |
| Article | same as Page (shared `beforeSave`) | updates category counts; on creation starts the newsletter job; moves files to the recycle bin on delete |
| Page | slugs, titles and SEO defaults; on soft delete moves `categories` to `deletedCategories` | updates category counts; soft-deletes the blocks it holds; on destroy removes the page from its sections and destroys empty sections |
| PageSection | sets `user` / `updatedBy` | on soft delete moves block images to the recycle bin; destroys replaced block images |
| Category | slugs; sets `user` / `updatedBy` | on soft delete moves its image and unlinks it from items; on destroy unlinks it from items |
| Contact | validation, sets `deleted`, `replied`, `locale`, `user` | stamps `repliedAt` / `repliedBy`; creates the contact in Brevo |
| Newsletter | on creation sets `deleted`, `active`, `user`, unless a subscription with the same email already exists (the defaults are then skipped) | on creation starts `createContactToCloudJob` |
| App | none | destroys replaced files |
| `_User` | validation on sign-up; sets `deleted`, `platforms` | verification code on creation, owner role, delete and ban stamps |

The access rules are in [RIGHTS_ROLES.md](RIGHTS_ROLES.md), the emails in [EMAIL_NOTIFICATIONS.md](EMAIL_NOTIFICATIONS.md).
