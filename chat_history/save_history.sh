#!/usr/bin/env bash
set -euo pipefail
mkdir -p "$(dirname "$0")"
now=$(date +"%Y%m%d_%H%M%S")
file="$(dirname "$0")/history_${now}.md"
echo "Digite ou cole o histórico da conversa (Ctrl+D para terminar):"
cat > "$file"
echo "Histórico salvo em: $file"
