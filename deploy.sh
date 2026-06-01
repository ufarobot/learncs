#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

log_file="DEPLOY_LOG.md"

if [ "${1:-}" = "log" ]; then
  shift
  note="$*"
  if [ -z "$note" ]; then
    echo 'Usage: ./deploy.sh log "what changed"'
    exit 1
  fi
  printf -- "- %s %s\n" "$(date '+%Y-%m-%d %H:%M')" "$note" >> "$log_file"
  tail -n 1 "$log_file"
  exit 0
fi

if [ "$#" -gt 0 ]; then
  echo 'Usage: ./deploy.sh'
  echo '       ./deploy.sh log "what changed"'
  exit 1
fi

message_file="$(mktemp)"
trap 'rm -f "$message_file"' EXIT

if [ -s "$log_file" ]; then
  first_note="$(head -n 1 "$log_file" | sed -E 's/^- [0-9-]+ [0-9:]+ //')"
  {
    echo "deploy: ${first_note:-site updates}"
    echo
    cat "$log_file"
  } > "$message_file"
else
  echo "deploy: site updates" > "$message_file"
fi

npm run check:prod
npm run publish:local
git add -A
git commit -F "$message_file"
git push origin main

: > "$log_file"
