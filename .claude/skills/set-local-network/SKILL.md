---
name: set-local-network
description: >
  Detects the local network IPv4 address via ipconfig and updates the local-dev env files that
  point the apps at each other (apps/server/.env.preprod, apps/bo/.env.preprod, apps/web/.env.local).
  Use when testing the apps from another device (phone, tablet) on the same Wi-Fi, or whenever the
  local IP changes.
allowed-tools: Bash Read Edit Write
---

## Goal

Detect the machine's current local IPv4 address and write it into the env files that point the apps at
each other, so the back-office and the website can be opened from another device on the same network.
Only the host part changes; the scheme and ports already in each file are kept.

Read each file first and check the real variable names and ports — the table is a guide, the files are
the truth (each app's `.env.example` lists the variables).

| File | Variables rewritten (host → `<ip>`) |
|---|---|
| `apps/server/.env.preprod` | `SERVER_URL`, `WEBSITE_URL` |
| `apps/bo/.env.preprod` | `VITE_SERVER_URL`, `VITE_WEBSITE_URL` |
| `apps/web/.env.local` | `SERVER_URL`, `NEXT_PUBLIC_SERVER_URL`, `APP_URL`, `NEXT_PUBLIC_APP_URL` |

These are git-ignored local config files: never commit them, and never print the value of any other
variable (keys, secrets) while reading them.

## Steps

### 1 — Get current IP

Run `ipconfig` and extract the **first non-loopback IPv4 address** of a physical or Wi-Fi adapter. Ignore
`127.0.0.1`, `169.254.x.x` (link-local) and virtual adapters (Hyper-V, VirtualBox, WSL, VMware) when a
real adapter is present. Call it `DETECTED_IP`. If none is found, stop and tell the user to check their
network connection.

### 2 — Show what will change

Display the detected IP and, for each file above that exists, the variables whose host will become
`DETECTED_IP` (name and port only — not the other variables).

### 3 — Update the files

For each file and variable that currently points at `localhost`, `127.0.0.1` or a previous private IP
(`192.168.x.x`, `10.x.x.x`, `172.16–31.x.x`), replace only the host with `DETECTED_IP` using an exact
Edit on that line. Leave variables that point at a deployed URL untouched. Skip a file that does not
exist (do not create it) and say so.

### 4 — Confirm

```
Done. <n> variables updated in <m> files with IP: <DETECTED_IP>
Restart the dev servers (server, bo, web) to pick up the change.
```

For another device to reach the apps, the dev servers must listen on all interfaces and the firewall
must allow their ports; mention it if the user reports the page does not load.
