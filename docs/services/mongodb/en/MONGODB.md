# MongoDB

## Table of Contents

- [What it is used for](#what-it-is-used-for)
- [Where the code is](#where-the-code-is)
- [Variables](#variables)
- [Setup](#setup)
- [Gotchas](#gotchas)

## What it is used for

MongoDB is the only database: Parse Server stores every collection in it (see [collections and indexes](../../../inventory/code/en/COLLECTIONS_AND_INDEXES.md)). It can run locally or on a hosted cluster such as MongoDB Atlas.

## Where the code is

`apps/server/src/index.ts` passes `MONGO_URL` to Parse Server as `databaseURI`. Neither `web` nor `bo` connects to the database: they go through Parse Server.

## Variables

| Variable | App | Purpose |
|---|---|---|
| `MONGO_URL` | server | Connection string, with credentials (secret, required at boot) |

## Setup

1. Local: start a MongoDB instance and point `MONGO_URL` at it in `apps/server/.env.preprod`.
2. Hosted (Atlas): create a cluster and a database user, allow the IP addresses of the host (and of your machine for local work), and copy the connection string.
3. Use one database per environment (development, pre-production, production).

## Gotchas

- No index is created by the code (see [collections and indexes](../../../inventory/code/en/COLLECTIONS_AND_INDEXES.md#indexes)): list views rely on collection scans.
- The Atlas free tier has a small storage quota and pauses idle clusters.
- An Atlas IP allow-list that misses the host IP makes the server fail at start with a connection error.
