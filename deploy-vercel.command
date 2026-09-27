#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

# Explicit version avoids the obsolete CLI bundled by next-on-pages.
vercel_cli() { npx --yes vercel@60.1.3 "$@"; }

if ! vercel_cli whoami >/dev/null 2>&1; then
  vercel_cli login
fi
vercel_cli link

printf '设置观影平台访问密码（至少 16 个字符，不会显示）：'
IFS= read -r -s site_password
printf '\n'
if [ ${#site_password} -lt 16 ]; then
  printf '密码过短，部署已停止。\n' >&2
  exit 1
fi
printf '%s' "$site_password" | vercel_cli env add PASSWORD production
unset site_password
vercel_cli --prod
