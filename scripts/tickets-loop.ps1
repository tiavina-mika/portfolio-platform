# Ticket loop: a fresh `claude -p "/dev --auto"` session per ticket.
# Started by the /auto skill. Clean stop: create the file logs/auto/stop (`/auto stop`).
# Reads the last line `AUTO: <STATE> ...` printed by /dev --auto.
# -Since <ticket file name>: the queue starts at that ticket (see "Starting at a ticket" in /auto).
# -Resume: interrupted loop (window closed, PC off): the first session resumes the ticket in progress on
# its branch, without requiring a clean tree or going back through develop (see `/auto resume`).
param([int]$Max = 0, [string]$Since = '', [switch]$Resume)

if ($Since -and $Since -notmatch '^[a-z0-9][a-z0-9-]*(\.md)?$') {
  throw "Invalid ticket file name: $Since"
}

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

$dir = Join-Path $root 'logs/auto'
New-Item -ItemType Directory -Force $dir | Out-Null
$log = Join-Path $dir 'loop.log'
$stop = Join-Path $dir 'stop'
Remove-Item $stop -ErrorAction SilentlyContinue

function Write-Log([string]$message) {
  $line = '{0} {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $message
  Add-Content -Path $log -Value $line
  Write-Host $line
}

# No free Bash or PowerShell: only the command families of the workflow are allowed. The content of a
# ticket is untrusted input (instruction injection is possible): the deny list below is not a security
# boundary, the allow list is.
$allowed = @(
  'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Skill',
  'Bash(git *)', 'Bash(gh *)', 'Bash(pnpm *)', 'Bash(npx *)', 'Bash(node *)',
  'Bash(ls *)', 'Bash(mkdir *)', 'Bash(date *)', 'Bash(curl http://localhost*)'
) -join ','
$denied = @(
  'Bash(gh secret*)',
  'Bash(gh api *)',
  'Bash(git remote*)',
  'Bash(git config*)',
  'Bash(git push --force*)',
  'Bash(git push -f*)',
  'Bash(git push origin main*)',
  'Bash(git push origin develop*)',
  'Bash(git * --no-verify*)',
  'Bash(gh pr merge * --admin*)'
) -join ','

$done = 0
$failures = 0
$resumes = 0
$resuming = [bool]$Resume
$maxLabel = if ($Max -gt 0) { $Max } else { 'unlimited' }
$sinceLabel = if ($Since) { $Since } else { 'start of the queue' }
$verb = if ($Resume) { 'resumed' } else { 'started' }
Write-Log "Loop $verb (max: $maxLabel, since: $sinceLabel)"
$cmd = '/dev --auto'
if ($Since) { $cmd += " --since $Since" }

try {
while ($true) {
  if (Test-Path $stop) { Write-Log 'Stop requested (logs/auto/stop).'; break }
  if ($Max -gt 0 -and $done -ge $Max) { Write-Log "Maximum reached ($Max tickets)."; break }

  # Clean start: tracked files unmodified, then develop up to date.
  # Not when resuming: after a dead session the modified files are the work of the ticket in progress,
  # which /dev --auto resumes on its branch. Stay on the branch, throw nothing away.
  if ($resuming) {
    $resuming = $false
  } else {
    if (git status --porcelain --untracked-files=no) {
      Write-Log 'Dirty tree (tracked files modified): stop. Commit or cancel, then run /auto again.'
      break
    }
    # Windows PowerShell 5.1 turns native stderr ("Already on 'develop'") into terminating errors under
    # 'Stop': relax it for the git calls and rely on the exit codes instead.
    $ErrorActionPreference = 'Continue'
    git fetch --prune 2>&1 | Out-Null
    git switch develop 2>&1 | Out-Null
    $switchCode = $LASTEXITCODE
    git pull --ff-only 2>&1 | Out-Null
    $pullCode = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($switchCode -ne 0) { Write-Log 'Cannot switch to develop: stop.'; break }
    if ($pullCode -ne 0) { Write-Log 'develop does not fast-forward: stop.'; break }
  }

  $run = Join-Path $dir ('run-{0}.log' -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
  Write-Log "Session $cmd (output: $run)"
  # Windows PowerShell 5.1 turns native stderr into terminating errors under 'Stop': relax it for the call.
  $ErrorActionPreference = 'Continue'
  $out = & claude -p $cmd --model claude-opus-5-5 --effort high --permission-mode acceptEdits --allowedTools $allowed --disallowedTools $denied 2>&1 | Out-String
  $ErrorActionPreference = 'Stop'
  Set-Content -Path $run -Value $out

  if ($out -match '(?i)usage limit|rate limit|limit reached') {
    Write-Log 'Usage limit reached: pausing for 30 minutes.'
    Start-Sleep -Seconds 1800
    continue
  }

  $match = [regex]::Matches($out, '(?m)^AUTO: (\w+)(.*)$') | Select-Object -Last 1
  $state = if ($match) { $match.Groups[1].Value } else { 'FAIL' }
  $detail = if ($match) { $match.Groups[2].Value.Trim() } else { 'no AUTO line at the end of the session' }
  Write-Log "Result: $state $detail"

  if ($state -eq 'EMPTY') { Write-Log 'No more tickets to handle.'; break }
  # Ticket delivered (or blocked): the next one starts with its 2 resumes. Without this reset a ticket
  # that used its resumes would deprive the next one.
  if ($state -in 'DONE', 'TESTER', 'BLOCKED') { $done++; $failures = 0; $resumes = 0; continue }

  # Safety net: session ended without an AUTO line. A `claude -p` session stops when it answers
  # ("I'm waiting for CI"), so the script waits for CI itself (no round limit), then starts a resume
  # session that merges. At most 2 resumes in a row, failures not counted.
  if ($state -eq 'FAIL' -and $resumes -lt 2) {
    $branch = (git branch --show-current)
    if ($branch -and $branch -notin 'develop', 'main') {
      $ErrorActionPreference = 'Continue'
      $pr = gh pr list --head $branch --state open --json number | ConvertFrom-Json | Select-Object -First 1
      $ErrorActionPreference = 'Stop'
      if ($pr) {
        $resumes++
        Write-Log "PR #$($pr.number) open and not merged: waiting for CI."
        $ErrorActionPreference = 'Continue'
        gh pr checks $pr.number --watch 2>&1 | Out-Null
        $ErrorActionPreference = 'Stop'
        Write-Log "CI finished for PR #$($pr.number): resuming the ticket (attempt $resumes/2)."
        $resuming = $true
        continue
      }
      # No PR: session died in the middle of the work (tests, build, commit unfinished). Resume the same
      # branch instead of stopping on the dirty tree.
      $resumes++
      Write-Log "Session ended without AUTO on $branch, no PR: resuming the ticket (attempt $resumes/2)."
      $resuming = $true
      continue
    }
  }
  $resumes = 0

  $failures++
  if ($failures -ge 2) { Write-Log 'Two failures in a row: stop. The ticket stays in in-progress/, see the run-*.log.'; break }
}
} catch {
  Write-Log "Loop crashed: $($_.Exception.Message)"
}

Write-Log "Loop finished: $done ticket(s) handled."
