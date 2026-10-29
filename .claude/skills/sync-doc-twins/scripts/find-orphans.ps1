# Lists the docs/ markdown files whose translated twin is missing or misplaced.
# Run from the workspace root: pwsh .claude/skills/sync-doc-twins/scripts/find-orphans.ps1
$all = git ls-files 'docs/*.md'
$set = @{}
$all | ForEach-Object { $set[$_] = 1 }
$isReadme = { param($p) $p -match '(^|/)README(\.[A-Z]+)?\.md$' }

Write-Output '=== FR_WITHOUT_EN (fr/ doc, no en/ twin) ==='
$all | Where-Object { $_ -match '/fr/' -and $_ -match '\.FR\.md$' -and -not (& $isReadme $_) } | ForEach-Object {
  $twin = ($_ -replace '/fr/', '/en/') -replace '\.FR\.md$', '.md'
  if (-not $set.ContainsKey($twin)) { $_ }
}

Write-Output '=== EN_WITHOUT_FR (en/ doc, no fr/ twin) ==='
$all | Where-Object { $_ -match '/en/' -and $_ -notmatch '\.FR\.md$' -and -not (& $isReadme $_) } | ForEach-Object {
  $twin = ($_ -replace '/en/', '/fr/') -replace '\.md$', '.FR.md'
  if (-not $set.ContainsKey($twin)) { $_ }
}

Write-Output '=== FRENCH_FILE_IN_EN_FOLDER (*.FR.md under en/ : stale copy, not a translation) ==='
$all | Where-Object { $_ -match '/en/' -and $_ -match '\.FR\.md$' -and -not (& $isReadme $_) } | ForEach-Object {
  $fr = $_ -replace '/en/', '/fr/'
  $state = if ($set.ContainsKey($fr)) {
    if ((Get-FileHash $_).Hash -eq (Get-FileHash $fr).Hash) { 'identical-to-fr' } else { 'diverged-from-fr' }
  } else { 'no-fr-copy' }
  "$state`t$_"
}

Write-Output '=== OUTSIDE_LANG_FOLDER (not under en/ or fr/) ==='
$all | Where-Object { $_ -notmatch '/(fr|en)/' -and -not (& $isReadme $_) }
