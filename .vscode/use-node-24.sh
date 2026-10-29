# Sourced by the VS Code dev tasks: switch this terminal to Node 24 through fnm when it is on another version
if [ "$(node -v 2>/dev/null | cut -d. -f1)" != "v24" ]; then
  eval "$(fnm env --shell bash)" && fnm use 24 --install-if-missing
  # fnm's Node has no pnpm shim, so `pnpm` would otherwise resolve to an older install (nvm) that runs on Node 14.
  # Only enable it when the shim is missing: the tasks start in parallel, and two simultaneous
  # `corepack enable` runs race on the same files (ENOENT on chmod).
  if [ ! -e "$(dirname "$(command -v node)")/pnpm" ]; then
    corepack enable pnpm
  fi
fi
