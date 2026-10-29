---
name: rd
description: Start the application by launching the server plus any combination of bo, web, web:sb (Web Storybook). Terminals already running are skipped, so it can be re-run to add one app to an already-started stack.
allowed-tools: Read Write Edit Bash PowerShell
---

Start the application with Git Bash terminals in a VS Code split panel, through the `run-dev` task of
`.vscode/tasks.json`.

**Server is launched by default** — no flag needed. Pass `--ns` (no server) to leave it out.

Additional terminals are opt-in via params (any combination, any order):

| Param | Terminal | App | Command | Start |
|---|---|---|---|---|
| `bo` | BO | `apps/bo` | `pnpm dev` | waits 30s |
| `web` | Web | `apps/web` | `pnpm dev` | waits 30s |
| `web:sb` | Web: Storybook | `apps/web` | `pnpm sb` | immediate |

BO and Web wait 30s because they call the server API. Web: Storybook starts immediately — it does
not depend on the server. (`apps/bo` has no Storybook script at the moment.)

**Already-running terminals are never relaunched.** Only the requested terminals that are not
already up get launched — including `Server`. Restarting a running dev server would kill the watcher
the user is working against. Use `--force` to relaunch everything regardless.

## Usage

```
/rd                      → Server only
/rd bo                   → Server + BO
/rd web                  → Server + Web
/rd web:sb               → Server + Web: Storybook
/rd --ns web:sb          → Web: Storybook only, no Server
/rd bo web web:sb        → all four terminals
/rd --force bo           → relaunch Server + BO even if they are already running
```

Typical incremental use — Server and Web are already open, and BO is now needed:

```
/rd bo   → only BO is launched; Server and Web are left running as-is
```

## Arguments

Parse all text passed after `/rd` as space-separated tokens:

- `--force` → relaunch every requested terminal even if already running (skip Step 2's filtering)
- `bo`, `web`, `web:sb` → add the matching terminal to the run list
- Any other token → warn the user it is unrecognized and ignore it
- `--ns` → do not add `Server`; with no other token, nothing is launched, so tell the user and stop
- `Server` is in the run list by default, unless `--ns` is passed

Resolve the final label list in this fixed canonical order (drop any not requested):

```
Server, BO, Web, Web: Storybook
```

### Step 1 — Ensure VS Code has the base tasks

Every task command starts with `. ../../.vscode/use-node-24.sh &&` (tasks run from `apps/<name>`).
That script switches the terminal to Node 24 through fnm when `node -v` is on another version.
`.vscode/use-node-24.sh` and `.vscode/tasks.json` already exist in this repo: read `tasks.json` and
check that the labels `Server`, `BO`, `Web`, `Web: Storybook` and the `run-dev` composite exist
(group `portfolio`, shell `C:\Program Files\Git\bin\bash.exe -c`). Only if one is missing, add it
following the shape of the existing ones (`cwd` = `${workspaceFolder}/apps/<app>`, `isBackground:
true`, `panel: dedicated`).

### Step 2 — Drop the terminals that are already running

Skip when `--force` was passed. A listening port means the terminal is up:

| Terminal | Port | Where it is set |
|---|---|---|
| Server | `PORT` of `apps/server/.env.*` | Express |
| BO | Vite port (default `5173` unless `apps/bo/vite.config.ts` sets `server.port`) | Vite |
| Web | `9012` (`apps/web/server.js`, overridable with `PORT`) | Next custom server |
| Web: Storybook | `6016` (`apps/web` → `sb`) | Storybook |

Read the real values first (`.env`, `vite.config.ts`) rather than assuming, then:

```powershell
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in <ports> } |
  Select-Object -ExpandProperty LocalPort -Unique | Sort-Object
```

Remove from the run list every terminal whose port is listening — `Server` included. If the list
ends up **empty**, skip Steps 3 and 4 and tell the user everything is already running (naming the
terminals), plus `--force` to relaunch anyway.

### Step 3 — Set `run-dev`'s `dependsOn` to the resolved label list

Edit the `run-dev` task's `dependsOn` in `.vscode/tasks.json` so it equals the label list left after
Step 2, in canonical order. Do this on every invocation. (The file also has a `run-dev:no-bo` task:
leave it untouched.)

### Step 4 — Trigger the task automatically via PowerShell

Activate the VS Code window **by process id**, not by title (the title carries the active editor's
file name, so a hardcoded title makes `AppActivate` return `False`):

```powershell
$code = Get-Process Code -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowTitle -like '*portfolio-platform*' } | Select-Object -First 1
if (-not $code) { throw 'VS Code window for portfolio-platform not found' }

$wshell = New-Object -ComObject wscript.shell
$activated = $wshell.AppActivate($code.Id)
Write-Output "activated: $activated"
Start-Sleep -Milliseconds 1000
$wshell.SendKeys('^+p')
Start-Sleep -Milliseconds 800
$wshell.SendKeys('Tasks: Run Task')
Start-Sleep -Milliseconds 800
$wshell.SendKeys('{ENTER}')
Start-Sleep -Milliseconds 1200
$wshell.SendKeys('run-dev')
Start-Sleep -Milliseconds 600
$wshell.SendKeys('{ENTER}')
```

Check the `activated:` line — on `False` the keystrokes went elsewhere, so report that instead of
claiming the terminals opened.

### Step 5 — Confirm to the user

- The task has been triggered automatically
- Exactly which terminals are opening, in canonical order, each with its start timing (immediate vs
  waits 30s)
- Which requested terminals were **skipped because already running**, if any
- If nothing happened: `Ctrl+Shift+P` → `Tasks: Run Task` → `run-dev`
