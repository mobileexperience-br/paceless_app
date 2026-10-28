#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/store/screenshots"
chrome="${CHROME_BIN:-$(command -v google-chrome || command -v chromium || command -v "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" || true)}"

if [ -z "$chrome" ]; then
  echo "Chrome não encontrado. Defina CHROME_BIN com o caminho do executável." >&2
  exit 1
fi

count="$(node -e "global.window={};require('$src/config.js');console.log(window.STORE_SCREENSHOTS.slides.length)")"

render() {
  local store="$1" width="$2" height="$3"
  local out="$root/store/$store/screenshots"
  mkdir -p "$out"
  for ((i = 0; i < count; i++)); do
    local name
    name="$(node -e "global.window={};require('$src/config.js');console.log(window.STORE_SCREENSHOTS.slides[$i].file)")"
    "$chrome" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
      --force-device-scale-factor=1 --window-size="$width,$height" --virtual-time-budget=3000 \
      --screenshot="$out/$name.png" "file://$src/template.html?slide=$i" >/dev/null 2>&1
    magick "$out/$name.png" -alpha off -strip "$out/$name.png"
    echo "$store/$name.png"
  done
}

read_size() {
  node -e "global.window={};require('$src/config.js');const s=window.STORE_SCREENSHOTS.sizes['$1'];console.log(s.width+' '+s.height)"
}

render app-store $(read_size app-store)
render google-play $(read_size google-play)
