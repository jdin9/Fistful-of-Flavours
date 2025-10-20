#!/usr/bin/env bash
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

remember_current_env() {
  local var="$1"
  if [[ ${!var+x} ]]; then
    ORIGINAL_SET["$var"]=1
    ORIGINAL_VALUE["$var"]="${!var}"
  else
    ORIGINAL_SET["$var"]=0
    ORIGINAL_VALUE["$var"]=""
  fi
}

clear_proxies() {
  local var
  for var in "${PROXY_VARS[@]}"; do
    remember_current_env "$var"
    unset "$var"
  done
}

check_registry() {
  local status
  if ! command -v curl >/dev/null 2>&1; then
    echo "Bootstrap: curl not available; skipping registry preflight check."
    return 0
  fi

  status=$(curl --silent --head --output /dev/null --write-out "%{http_code}" --max-time 5 https://registry.npmjs.org/ || true)

  if [[ -z "$status" || "$status" == "000" ]]; then
    echo "Bootstrap: network request to https://registry.npmjs.org/ failed."
    return 1
  fi

  if [[ "$status" != "200" && "$status" != "301" && "$status" != "302" ]]; then
    echo "Bootstrap: registry.npmjs.org responded with HTTP $status."
    return 1
  fi

  return 0
}

# Try with the original proxy configuration first.
for var in "${PROXY_VARS[@]}"; do
  remember_current_env "$var"
done

if check_registry; then
  echo "Bootstrap: registry reachable with existing proxy configuration."
  npm install "$@"
  exit 0
fi

echo "Bootstrap: attempting install after clearing proxy variables that may block the registry."

clear_proxies

if check_registry; then
  npm install "$@"
  exit 0
fi

cat <<'EONOTICE'
Bootstrap: Unable to reach https://registry.npmjs.org/ with or without the configured proxies.
Bootstrap: Skipping npm install. Re-run this script once you have connectivity to proceed with dependency installation.
EONOTICE
