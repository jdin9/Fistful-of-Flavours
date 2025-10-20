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

run_npm_install() {
  local log_file
  log_file=$(mktemp)

  set +e
  npm install "$@" 2>&1 | tee "$log_file"
  local npm_status=${PIPESTATUS[0]}
  set -e

  if [[ $npm_status -eq 0 ]]; then
    rm -f "$log_file"
    return 0
  fi

  if grep -qiE '\b(403|E403|EAI_AGAIN|ECONN|ETIMEDOUT|ENOTFOUND|EHOSTUNREACH|ECONNRESET)\b' "$log_file"; then
    rm -f "$log_file"
    return 10
  fi

  rm -f "$log_file"
  return $npm_status
}

skip_install_notice() {
  echo "Network unavailable — skipping dependency installation. You can install manually later with \`npm install\`."
  exit 0
}

# Try with the original proxy configuration first.
for var in "${PROXY_VARS[@]}"; do
  remember_current_env "$var"
done

if check_registry; then
  echo "Bootstrap: registry reachable with existing proxy configuration."
  if run_npm_install "$@"; then
    exit 0
  fi

  install_status=$?
  if [[ $install_status -eq 10 ]]; then
    echo "Bootstrap: npm install failed due to network or proxy issues."
  else
    echo "Bootstrap: npm install failed with exit code $install_status."
    exit "$install_status"
  fi
fi

echo "Bootstrap: attempting install after clearing proxy variables that may block the registry."

clear_proxies

if check_registry; then
  if run_npm_install "$@"; then
    exit 0
  fi

  install_status=$?
  if [[ $install_status -eq 10 ]]; then
    skip_install_notice
  fi

  echo "Bootstrap: npm install failed with exit code $install_status."
  exit "$install_status"
fi

skip_install_notice
