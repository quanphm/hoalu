#!/usr/bin/env bash
#
# Refresh the read-only reference checkouts under repos/.
#
# These are NOT committed (see .gitignore). They are shallow, single-branch
# clones kept locally so agents and humans can read upstream source. Run this
# once per clone, and again whenever you want to move the references forward.
#
#   bun run repos:sync
#
# Nothing in the build or CI depends on repos/.
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# name|url|branch
readonly REPOS=(
	"effect|https://github.com/Effect-TS/effect.git|main"
	"maple|https://github.com/Makisuo/maple.git|main"
	"flexlayout|https://github.com/caplin/FlexLayout.git|master"
	"tanstack-db|https://github.com/TanStack/db.git|main"
)

status=0
for spec in "${REPOS[@]}"; do
	IFS='|' read -r name url branch <<<"$spec"
	dir="repos/$name"

	if [ -d "$dir/.git" ]; then
		origin="$(git -C "$dir" remote get-url origin 2>/dev/null || true)"
		if [ "$origin" != "$url" ]; then
			printf '! repos/%s points at %s, expected %s — delete it and re-run\n' "$name" "$origin" "$url" >&2
			status=1
			continue
		fi
		printf '==> updating repos/%s (%s)\n' "$name" "$branch"
		git -C "$dir" fetch --depth 1 origin "$branch"
		# read-only reference: local edits are disposable by design
		git -C "$dir" reset --hard FETCH_HEAD
	elif [ -e "$dir" ]; then
		printf '! repos/%s exists but is not a git checkout — delete it and re-run\n' "$name" >&2
		status=1
	else
		printf '==> cloning %s (%s) -> repos/%s\n' "$url" "$branch" "$name"
		mkdir -p repos
		git clone --depth 1 --single-branch --branch "$branch" "$url" "$dir"
	fi
done

exit "$status"
