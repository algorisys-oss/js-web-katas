#!/usr/bin/env bash
# Build the kata app and publish it to the gh-pages branch of origin.
#
# Environment overrides:
#   BASE_PATH         URL path the site is served from. Default "/js-web-katas/".
#                     Must start and end with "/". Use "/" for a user/org page
#                     or a custom domain served at the site root.
#   GH_PAGES_BRANCH   Target branch on the remote. Default "gh-pages".
#   GH_PAGES_REMOTE   Remote name. Default "origin".
#
# Usage:
#   bash scripts/deploy-pages.sh
#   BASE_PATH=/ bash scripts/deploy-pages.sh          # publish at site root
#   GH_PAGES_BRANCH=docs bash scripts/deploy-pages.sh

set -euo pipefail

BASE_PATH="${BASE_PATH:-/js-web-katas/}"
BRANCH="${GH_PAGES_BRANCH:-gh-pages}"
REMOTE="${GH_PAGES_REMOTE:-origin}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

APP_DIR="app"
BUILD_DIR="app/dist"
WORKTREE_DIR=".gh-pages-worktree"

if [[ "${BASE_PATH:0:1}" != "/" || "${BASE_PATH: -1}" != "/" ]]; then
  echo "BASE_PATH must start and end with '/' (got: '$BASE_PATH')" >&2
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "No git remote '$REMOTE' configured." >&2
  echo "Add one first, e.g.:" >&2
  echo "  git remote add origin git@github.com:<owner>/js-web-katas.git" >&2
  exit 1
fi

REMOTE_URL="$(git remote get-url "$REMOTE")"
COMMIT_SHA_SHORT="$(git rev-parse --short HEAD)"

echo "Deploying to $REMOTE_URL"
echo "  branch:    $BRANCH"
echo "  base path: $BASE_PATH"
echo "  source:    HEAD = $COMMIT_SHA_SHORT"
echo

# Build the app with the right base URL.
(
  cd "$APP_DIR"
  [[ -d node_modules ]] || npm install
  VITE_BASE="$BASE_PATH" npm run build
)

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build did not produce $BUILD_DIR" >&2
  exit 1
fi

# SPA deep-link fallback: GitHub Pages serves 404.html for unknown paths while
# preserving the URL, so a copy of index.html lets any route load the app.
cp "$BUILD_DIR/index.html" "$BUILD_DIR/404.html"
# Stop Jekyll from ignoring files/dirs that start with an underscore.
touch "$BUILD_DIR/.nojekyll"

# Clean any stale worktree from a previous run.
git worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 || true
rm -rf "$WORKTREE_DIR"

# Attach a worktree to the gh-pages branch, creating it if necessary.
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git worktree add "$WORKTREE_DIR" "$BRANCH"
elif git ls-remote --exit-code --heads "$REMOTE" "$BRANCH" >/dev/null 2>&1; then
  git fetch "$REMOTE" "$BRANCH:$BRANCH"
  git worktree add "$WORKTREE_DIR" "$BRANCH"
else
  echo "Creating orphan branch $BRANCH (first deploy)"
  git worktree add --detach "$WORKTREE_DIR" HEAD
  (
    cd "$WORKTREE_DIR"
    git checkout --orphan "$BRANCH"
    git rm -rf . >/dev/null 2>&1 || true
  )
fi

# Replace worktree contents with the fresh build output.
find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp -R "$BUILD_DIR"/. "$WORKTREE_DIR"/

# Commit and push.
(
  cd "$WORKTREE_DIR"
  git add -A
  if git diff --cached --quiet; then
    echo "No changes to publish."
  else
    git -c user.email="deploy@local" -c user.name="deploy" \
        commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ) from $COMMIT_SHA_SHORT"
    git push -q "$REMOTE" "$BRANCH"
  fi
)

git worktree remove --force "$WORKTREE_DIR"

OWNER="$(basename "$(dirname "$REMOTE_URL")" | sed 's/.*://')"
REPO="$(basename "$REMOTE_URL" .git)"
echo
echo "Done. GitHub Pages usually serves the new build within 1-2 minutes."
echo "    URL: https://${OWNER}.github.io/${REPO}/"
echo "    First time only: GitHub repo -> Settings -> Pages ->"
echo "      Source: 'Deploy from a branch', Branch: ${BRANCH} / (root), then Save."
