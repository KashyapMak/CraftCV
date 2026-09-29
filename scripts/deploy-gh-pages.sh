#!/usr/bin/env bash
# ==============================================================================
# GitHub Pages Deployment Script for CraftCV Pro
# ==============================================================================
# Usage:
#   npm run deploy
#   or
#   bash scripts/deploy-gh-pages.sh [remote_name] [branch_name]
#
# Default remote: origin
# Default branch: gh-pages
# ==============================================================================

set -e

REMOTE=${1:-origin}
BRANCH=${2:-gh-pages}

echo "=========================================="
echo "🚀 CraftCV Pro - GitHub Pages Deployment"
echo "=========================================="

# 1. Build production assets
echo ""
echo "📦 Step 1: Building production bundle with Vite..."
npm run build

# 2. Ensure .nojekyll exists in dist
touch dist/.nojekyll

# 3. Handle Git deployment
echo ""
echo "📤 Step 2: Preparing git deployment to branch '${BRANCH}'..."

cd dist

# Check if git is available
if ! command -v git &> /dev/null; then
  echo "⚠️ git is not installed or not in PATH."
  echo "Built files are ready in ./dist directory."
  exit 0
fi

# Get remote URL from parent repository if available
PARENT_DIR=".."
REMOTE_URL=""
if git -C "${PARENT_DIR}" rev-parse --is-inside-work-tree &> /dev/null; then
  REMOTE_URL=$(git -C "${PARENT_DIR}" remote get-url "${REMOTE}" 2>/dev/null || echo "")
fi

# Initialize temporary git repo in dist
rm -rf .git
git init
git checkout -b "${BRANCH}"
git add -A
git commit -m "Deploy to GitHub Pages: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

if [ -n "${REMOTE_URL}" ]; then
  echo "🚀 Pushing to remote ${REMOTE} (${REMOTE_URL}) on branch ${BRANCH}..."
  git push -f "${REMOTE_URL}" "${BRANCH}"
  echo ""
  echo "✅ Successfully deployed to ${BRANCH} on ${REMOTE}!"
else
  echo ""
  echo "ℹ️  Built bundle committed to local '${BRANCH}' in ./dist"
  echo "To push to your remote repository manually, run:"
  echo "  cd dist"
  echo "  git push -f <your-repo-git-url> ${BRANCH}"
fi

echo ""
echo "🎉 Deployment step complete!"
