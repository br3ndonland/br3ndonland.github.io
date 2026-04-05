#!/usr/bin/env bash
set -euo pipefail

echo "[bootstrap] Initializing Git LFS and pulling objects..."
git lfs install --local
git lfs pull
echo "[bootstrap] Git LFS objects are ready."

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
