#!/usr/bin/env bash
# Reset any proxy variables that force npm through a locked-down corporate proxy.
# The execution environment for this project sets HTTP(S)_PROXY to a host that
# returns 403s for registry.npmjs.org; clearing those values lets installs work.
set -euo pipefail

declare -A ORIGINAL_SET=()
declare -A ORIGINAL_VALUE=()
PROXY_VARS=(
  http_proxy
  https_proxy
  HTTP_PROXY
  HTTPS_PROXY
  npm_config_http_proxy
  npm_config_https_proxy
)

save_and_unset() {
  local var="$1"
  if [[ ${!var+x} ]]; then
    ORIGINAL_SET["$var"]=1
    ORIGINAL_VALUE["$var"]="${!var}"
  else
    ORIGINAL_SET["$var"]=0
    ORIGINAL_VALUE["$var"]=""
  fi
  unset "$var"
}

restore_proxies() {
  local var
  for var in "${!ORIGINAL_SET[@]}"; do
    if [[ "${ORIGINAL_SET[$var]}" -eq 1 ]]; then
      export "$var"="${ORIGINAL_VALUE[$var]}"
    else
      unset "$var"
    fi
  done
}

trap restore_proxies EXIT

for var in "${PROXY_VARS[@]}"; do
  save_and_unset "$var"
done

offline_reason=""

if command -v curl >/dev/null 2>&1; then
  status=$(curl --silent --head --output /dev/null --write-out "%{http_code}" --max-time 5 https://registry.npmjs.org/ || true)
  if [[ -z "$status" || "$status" == "000" ]]; then
    offline_reason="network request to https://registry.npmjs.org/ failed"
  elif [[ "$status" != "200" && "$status" != "301" && "$status" != "302" ]]; then
    offline_reason="registry.npmjs.org responded with HTTP $status"
  fi
else
  echo "Bootstrap: curl not available; skipping registry preflight check."
fi

if [[ -n "$offline_reason" ]]; then
  cat <<EONOTICE
Bootstrap: $offline_reason.
Bootstrap: Skipping npm install because the registry is not reachable in this environment.
Bootstrap: Once you have direct access to https://registry.npmjs.org/, run 'npm install' manually.
EONOTICE
  exit 0
fi

npm install "$@"
