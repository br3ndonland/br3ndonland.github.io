#!/usr/bin/env sh
set -e

# Setup script for Codex Web cloud environments
# https://developers.openai.com/codex/cloud/environments

for command in git git-lfs pnpm; do
  if ! command -v $command >/dev/null 2>&1; then
    case $command in
    pnpm) npm install --global pnpm@latest-10 ;;
    *) echo "[bootstrap] ERROR: $command is required" >&2 && exit 1 ;;
    esac
  fi
done

error='ERROR: Please supply a script argument in org/repo format.'
REPO=${1?$error}
echo "[bootstrap] \$PWD: $PWD"

DEFAULT_ORIGIN_URL="https://github.com/$REPO.git"
ORIGIN_URL="$(git config --local --default '' --get remote.origin.url)"
if [ -z "$ORIGIN_URL" ]; then
  echo "[bootstrap] remote.origin.url is empty; setting it to $DEFAULT_ORIGIN_URL"
  git config remote.origin.url "$DEFAULT_ORIGIN_URL"
fi

echo "[bootstrap] Initializing Git LFS and pulling objects..."
git lfs install --local
if git lfs pull; then
  echo "[bootstrap] Git LFS objects are ready"
else
  echo "[bootstrap] ERROR: git lfs pull failed" >&2
  exit 1
fi

echo "[bootstrap] Installing dependencies..."
CI=true pnpm install --frozen-lockfile
pnpm run astro telemetry disable
echo "[bootstrap] Dependencies installed."

echo "[bootstrap] Running repository checks..."
pnpm run check
echo "[bootstrap] Checks complete."

echo "[bootstrap] Running production build..."
pnpm run build
echo "[bootstrap] Build complete."

echo "[bootstrap] Done."
