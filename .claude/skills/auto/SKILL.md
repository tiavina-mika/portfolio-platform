---
name: auto
description: Chain portfolio-platform tickets (Markdown files in tickets/) with no human. Starts in a separate window the loop scripts/tickets-loop.ps1, which opens a fresh /dev --auto session per ticket (code, PR, CI, merge). Subcommands - stop, status, resume, a number to limit the tickets. Launch only through /auto.
argument-hint: "[count] [ticket file name] | stop | status | resume"
disable-model-invocation: true
allowed-tools: Read Bash PowerShell Glob Grep
---

# /auto: chain tickets

Launching `/auto` stands for `/deliver` on **every** ticket the loop handles: commit, push, PR against
`develop`, merge commit. The rules and their limits are in `.claude/rules/tickets.md`, "Autonomous mode".

`/auto` develops nothing itself. It starts and watches `scripts/tickets-loop.ps1`, which runs
`claude -p "/dev --auto"` in a loop: a fresh session per ticket, until the queue is empty (`tickets/todo/`,
then `tickets/backlog/` if `todo/` is empty, see "Be intelligent").

If a session ends without an `AUTO:` line while the ticket's PR is open (typical case: "I'm waiting for
CI"), the script waits for the CI itself (`gh pr checks --watch`) then runs `/dev --auto` again, which
resumes the ticket in `in-progress/`, sees the PR and merges it. At most two resumes in a row per ticket,
failures not counted (the counter resets after each delivered or blocked ticket); beyond that, or with no
PR, it is a normal failure (two in a row = stop).

## Be intelligent

Launching `/auto` means "move the project forward". Reason on the intent, not on the letter of this file:

- **Do not stop because a folder is empty.** An empty `todo/` (and empty `in-progress/`) does not mean
  "nothing to do": the tickets are then in `backlog/`. The queue becomes `backlog/`, in file-name order.
  Launching `/auto` is the prioritisation of those tickets, without asking.
- **Conclude the queue is empty only after looking at `todo/`, `in-progress/` and `backlog/`, then
  creating the missing tickets.** The goal is **every** ticket: if the three folders hold no usable ticket,
  `/dev --auto` writes the tickets of what has none yet, in `backlog/`, and goes on. See "Choosing the
  ticket" in [/dev](../dev/SKILL.md).
- **A `feat` ticket with no criteria is not discarded**: `/dev --auto` writes its criteria.
- **Discard what is truly unusable, not what is unusual**: a ticket depending on one in `blocked/`, a
  ticket with a malformed name. Flag it and move on instead of stopping everything.
- **If a dependency is missing (another page, a function, a link), build only this ticket's part**: the
  rest is fake or omitted and listed in the ticket's `remaining.md`. See the matching rule in step 1 of
  [/dev](../dev/SKILL.md).
- **An anomaly that does not prevent progress does not block the loop**: note it in the summary, launch,
  and let the human decide afterwards.
- **Ask nothing whose answer can be deduced from the folders, the docs or this file.** Ask only if a
  secret, an external access or a product decision is truly missing.
- **A red CI is repaired, it does not block the loop**, even when the cause is not in the ticket: see
  "Red CI".

## Red CI

A red CI on a ticket's PR must not stop the loop. `/dev --auto` repairs it itself, in the ticket's session,
then merges once CI is green.

0. **Billing first**: if `gh run view <run>` shows the jobs never started (message about failed payments or
   a spending limit), this is not a red CI. Repair and rerun nothing; report it in the loop output and in
   `status`, and leave the PR open for the human to settle the billing — never merge on assumed checks.
1. **Read the failure**: `gh pr checks <n>` for the red job, then `gh run view <run> --log-failed`. Note
   the failing step and the exact message.
2. **Classify the cause**, comparing to the PR diff (`git diff origin/develop...HEAD --stat`) and to the
   last run of `develop` (`gh run list --branch develop --limit 3`):

| Cause | Repair |
|---|---|
| In the ticket (test, lint, typecheck, build broken by the diff) | Fix in the ticket, push, wait for CI |
| Outside the ticket and passing: network, timeout, third-party service, flaky test (the same test passes on `develop`, nothing in the diff touches it) | `gh run rerun <run> --failed`, once, then wait. **And** fix the cause for next time: if simple and safe, in a separate commit on the ticket's branch; otherwise an `urgent-<verb>-…` ticket in `todo/` (see "Do what is recommended") |
| Outside the ticket and lasting: `develop` already red, broken CI tool, wrong test | Fix on the ticket's branch in a **separate commit** `fix(<scope>): …`, push, wait. Say it in the PR description and in `implemented.md` ("fix outside the ticket: …") |

3. **At most three repair rounds** (a rerun counts as one). Beyond: ticket to `blocked/` with the failing
   step, the message and what was tried, PR left open, `AUTO: BLOCKED`. The loop goes to the next ticket.

**Repair, never bypass.** Forbidden to turn CI green: deleting, skipping (`skip`, `.only`) or weakening a
test or an assertion; `continue-on-error`, disabling a job or step; loosening a lint or typing rule for the
whole project; `--admin`, `--no-verify`, touching branch protection. A file of `.github/workflows/` changes
only to fix the real cause, never to avoid a check. The merge always requires a green CI.

## Do what is recommended

In `/auto`, whatever the argument (`status` included), and for any alert received during the session
(automatic security review, CI, loop anomaly), **Claude does not ask "do you want me to…?": it does what it
recommends, then says so.** Launching `/auto` stands for agreement to these actions, as for the loop's
tickets. A recommendation left as a question is an oversight.

Any code change goes through the loop, never through a manual edit: only the loop commits and merges.

| Finding | Action, without asking |
|---|---|
| Security hole, regression or bug, in `develop` or in the current ticket | Check first (read the file, read-only query on a local database). If confirmed: a fix ticket **directly in `todo/`**, named `urgent-<verb>-…`, `## Context` with the proof, acceptance criteria, `type: fix`. Loop active: it takes it at the next ticket. Loop stopped: start it with `-Max 1` (see "Start") |
| Alert about a file the loop is writing | Do not touch the file: the session overwrites it or has pushed it. Create the `urgent-` ticket at once. |
| Loop PR open, CI green, loop stopped | Rerun the loop with `-Max 1`: `/dev --auto` resumes the ticket and merges |
| Loop PR open, CI red, loop stopped | Rerun the loop with `-Max 1`: `/dev --auto` resumes, repairs the CI ("Red CI") and merges |
| Ticket put in `done/` while a case of its `tc.md` was not run | Move it back to `to-test/` with a comment quoting the case (in a ticket branch, committed by the loop) |
| Missing follow-up (a `not implemented` or `link to wire` line with no ticket) | Write the ticket in `backlog/` |
| Product decision to settle (⚠️) | Code nothing here: the loop keeps the recommended option in `recommendation.md`. Quote it in "To reread" |

**The final message lists what was done without asking** (ticket created or moved, loop started), with
file names, before the rest of the report.

**Limits unchanged**: `main` and production, secrets, real data, a migration or schema already pushed, a
merge with a red CI, a loop window killed. A commit or push outside the loop always needs the human's
agreement. If what Claude recommends hits one of these limits, it says so and proposes the closest
allowed path.

## Arguments

| Call | Effect |
|---|---|
| `/auto` | Runs the loop until the queue is empty (`todo/`, else `backlog/`) |
| `/auto 5` | Stops after 5 tickets |
| `/auto show-the-project-filters` | Starts at that ticket: tickets sorting before it are ignored |
| `/auto 5 show-the-project-filters` | Both: 5 tickets starting there |
| `/auto stop` | Clean stop after the current ticket |
| `/auto resume` | Resumes an interrupted loop (window closed, PC off, session killed) where it stopped |
| `/auto status` | Progress and decisions to reread |

## `resume`

For an **interrupted** loop: window closed, PC off or asleep, session killed. The current ticket stayed in
`in-progress/`, with its branch and its modified or uncommitted files. Throw nothing away, do not go back
through `develop`: the first session resumes that ticket on its branch, then the loop goes on normally.

1. **Refuse** and say so if a loop or a `claude -p "/dev --auto"` session is still running
   (`Get-CimInstance Win32_Process`, patterns `*tickets-loop*` and `*dev --auto*`). Never kill a session:
   it may be in the middle of a commit.
2. **Read the starting state**, without modifying any file:
   - the last `Loop started` or `Loop resumed` line of `logs/auto/loop.log`: the `max`, the `since` and
     the origin;
   - the number of `Result: DONE|TESTER|BLOCKED` lines that follow (X);
   - the line before `Loop finished`, if any, for the stop reason;
   - the ticket in `tickets/in-progress/`, the current branch (`git branch --show-current`),
     `git status --porcelain --untracked-files=no`, and the PR of the branch
     (`gh pr list --head <branch> --state all`).
3. **Decide**:

| Finding | Resume |
|---|---|
| A ticket in `in-progress/`, on its branch (its `branch:` field) | `-Resume`: `/dev --auto` resumes the ticket, sees the PR or the finished files, and completes it |
| A ticket in `in-progress/`, but the current branch is `develop` or another one | Do not start. Say it in one line with both names: the human decides the branch |
| No ticket in `in-progress/`, clean tree | No `-Resume`: it is a normal start of the next ticket |
| No ticket in `in-progress/`, tracked files modified | Do not start. List the files, the human commits or cancels |
| Stop reason = `two failures in a row` | Start anyway, but quote the end of the faulty `run-*.log`: the cause may still be there |

4. **Compute the rest**: `original max − X` (if `max` was unlimited, pass no `-Max`). If the rest is 0, say
   so: the loop had finished, nothing to resume. Reuse the same `-Since`. An explicit `/auto resume 3`
   replaces the computation: 3 more tickets.
5. **Start**, as in "Start" point 5, with `-Resume` added.
6. **Confirm**: the resumed ticket (file name, branch, PR if any), the rest to handle, the journal
   `logs/auto/loop.log` (line `Loop resumed`).

## Start

1. **Audit** of the repository state (fetch, open PRs, branches ahead), in one line.
2. **Refuse to start** and say so if:
   - `logs/auto/loop.log` shows a loop still active: a window running `tickets-loop.ps1`
     (`Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*tickets-loop*' }`);
   - **tracked** files are modified (`git status --porcelain --untracked-files=no`): the loop starts again
     from `develop` and would stop at once. Untracked files do not matter.
3. **Check the ticket names**: a file whose name is not kebab-case, a front matter without `type`, two
   tickets with the same name in different folders. Flag them, exclude them from the queue, never rename.
4. **Summarise the queue** before starting: list `tickets/todo/`, `tickets/in-progress/`,
   `tickets/blocked/` **and `tickets/backlog/`**, and give the number of tickets, the folder the queue
   comes from and the planned order (file-name order, `urgent-` first). Empty `todo/`: the queue is
   `backlog/`, start anyway.
5. **Start** in an independent window that survives this session:

```powershell
$shell = if (Get-Command pwsh -ErrorAction SilentlyContinue) { 'pwsh' } else { 'powershell' }
$args = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/tickets-loop.ps1')
if ($n) { $args += @('-Max', $n) }
if ($since) { $args += @('-Since', $since) }   # ticket file name given as argument
Start-Process $shell -WorkingDirectory (Get-Location) -ArgumentList $args
```

6. **Confirm**: loop started, number of tickets in the queue, path of the journal `logs/auto/loop.log`,
   and `/auto stop` to stop it. Remind that the PC must stay on, and that each ticket leaves in
   `tickets/work/<ticket>/` an `implemented.md` (what is delivered) and a `remaining.md` (what is missing or
   blocks), which `/auto status` gathers.

## Queue order

Inside `todo/` then `backlog/`, tickets are taken in **file-name order**. A numeric prefix
(`010-…`) forces an order; a name starting with `urgent-` comes before every other one. The queue is
`todo/` first; if `todo/` is empty, `backlog/`. Tickets are not sorted by creation date or by anything
inside the file.

| Finding | Action |
|---|---|
| A name that is not kebab-case or has no `type` in its front matter | Flag it, exclude it from the queue, do not rename |
| Two tickets with the same name | Flag it, keep the order of the folders (`todo/` before `backlog/`) |

Never guess or fix a name: write it in the queue summary, the human decides.

## Starting at a ticket (`<ticket file name>`)

With a ticket name, the queue starts at that file. Before starting:

- find and read the ticket; if it is not found or is in neither `todo/` nor `backlog/`, refuse to start and
  say so;
- the queue announced at step 4 keeps only tickets sorting after it or equal to it. The ignored tickets
  are listed in one line;
- the script passes `--since <ticket>` to each `/dev --auto` session, so the floor holds for the whole
  loop. Nothing is moved or renamed.

## `stop`

`New-Item -ItemType File -Force logs/auto/stop`. The script stops at the end of the current ticket. Tell the
user. Never kill the window: a ticket would be cut in the middle of its work.

## `status`

Read, without modifying any repository file, then apply "Do what is recommended" to each finding:

- the last 20 lines of `logs/auto/loop.log`;
- the queue: the file names of `todo/`, `in-progress/`, `to-test/`, `blocked/`, and what is in `done/`
  since the start (`git log` on `tickets/done`);
- the decisions to reread: `tickets/work/*/recommendation.md` and `tickets/work/*/blocked-key.md` (Glob),
  with the ticket name and date;
- **what is left to do**: read the `tickets/work/*/remaining.md` of the tickets handled since the start,
  ignore those that only say "Nothing to report.", and group the rest by type (`blocker worked around`
  first, then `not implemented`, `link to wire`, `to validate`, `to verify`) with the origin ticket and
  the ticket that carries the follow-up;
- **what was delivered**: one line per ticket, taken from `tickets/work/*/implemented.md`;
- the open PRs (`gh pr list --state open`), with the CI state
  (`gh pr view <n> --json statusCheckRollup,mergeStateStatus`). **A loop PR open with a green CI is an
  oversight of the loop, not something the human waits for**: say it first, with the reason read at the
  end of the matching `run-*.log`, and rerun the loop with `-Max 1` so it merges it (loop stopped). Never
  answer "I do not merge myself": `/auto` stands for `/deliver`.

**Two lines at the top of the message, before everything else:**

- **Loop finished: `yes` or `no`.** `no` if a process runs `tickets-loop.ps1`
  (`Get-CimInstance Win32_Process`); otherwise `yes`, followed by the reason read in the line before
  `Loop finished` in `loop.log` (`maximum reached`, `no more tickets`, `two failures in a row`,
  `dirty tree`, `stop requested`).
- **State: `X/N`** (e.g. `4/5`). Start from the last `Loop started (max: N, …)` or `Loop resumed (max: N, …)`
  line of `loop.log` (after a resume, N is the rest computed by `/auto resume`, not the original max; say
  so). X = the number of `Result: DONE|TESTER|BLOCKED` lines that follow it (the `FAIL`s of a resumed
  session do not count), or the number of the `Loop finished: X ticket(s) handled` line if it exists.
  `max: unlimited`: write `X/∞`. Loop active: add `, ticket X+1 in progress`.

Example: `Loop finished: no · State: 4/5, ticket 5 in progress`.

**Table of the open PRs, right after those two lines.** One row per open PR: full link, ticket, open for
(duration), CI (`green`, `red`, `running`, `absent`), mergeable (`yes`, `conflict`), and a plain status:
`TO MERGE (CI green, the loop forgot)`, `CI running, the loop waits`, `CI red, to fix` or `conflict`. For
each PR, read in the matching `run-*.log` why it was not merged (one sentence). No open PR: write "no open
PR". If the loop is stopped and a PR is `TO MERGE`, rerun the loop with `-Max 1` and say so in a sentence.

**Current ticket, right after the PR table.** The ticket in `in-progress/`: file name, start date and time,
elapsed time, branch, PR link if any. Start = the `Session` line of `loop.log` that launched it. None:
"no ticket in progress".

**Tickets already delivered by the loop.** One row per ticket handled since the start: file name, PR link,
result (`DONE`, `TESTER`, `BLOCKED`, `FAIL`), duration (from the `Session` line to the next `Result` line in
`loop.log`; add up the sessions of a resumed ticket). Oldest first, with the total duration last.

Then a short table: ticket, result, PR, what is delivered (one line of `implemented.md`). Then, in this
order: what **blocks** progress (`blocker worked around`), the rest to do grouped as above, and the list of
files to reread first. A handled ticket with no `implemented.md` or no `remaining.md` is to be flagged: the
`/dev --auto` session skipped a step.

## Forbidden

- Merging, moving a ticket to `done/` or touching `main` or production from this skill: only the loop, via
  `/dev --auto`, delivers into `develop`.
- Starting two loops at the same time.
- Bypassing a loop stop (dirty tree, two failures in a row) without explaining it.
