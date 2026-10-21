#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/store/google-play"
bold="$(ls "$root"/node_modules/@expo-google-fonts/inter/700Bold/*.ttf | head -1)"
regular="$(ls "$root"/node_modules/@expo-google-fonts/inter/400Regular/*.ttf | head -1)"
title="${STORE_TITLE:-Corra no seu ritmo.}"
subtitle="${STORE_SUBTITLE:-Planos de corrida, GPS e evolução semanal}"

mkdir -p "$out"

magick "$root/assets/icon.png" -resize 512x512 -strip "$out/icon-512.png"

magick -size 1024x500 xc:'#111111' \
  \( "$root/assets/hero-welcome.jpg" -resize 1024x -crop 1024x500+0+520 +repage -fill black -colorize 50% \) \
  -compose over -composite \
  \( "$root/assets/logo-mark.png" -resize 230x230 \) -geometry +72+40 -compose over -composite \
  -font "$bold" -pointsize 52 -fill white -annotate +80+330 "$title" \
  -font "$regular" -pointsize 28 -fill '#BCD243' -annotate +82+378 "$subtitle" \
  -depth 8 -strip "$out/feature-1024x500.png"

echo "Gerado em $out"
