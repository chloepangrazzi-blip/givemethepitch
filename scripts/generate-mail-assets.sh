#!/bin/zsh
set -euo pipefail

ROOT="/Users/chloepangrazzi/Desktop/Playground/site"
SRC_DIR="$ROOT/public/mail-assets-src"
OUT_DIR="$ROOT/public/mail-assets"

mkdir -p "$SRC_DIR" "$OUT_DIR"

render_png() {
  local src="$1"
  local size="$2"
  local base
  base="$(basename "$src")"
  rm -f "$OUT_DIR/$base.png"
  qlmanage -t -s "$size" -o "$OUT_DIR" "$src" >/dev/null 2>&1
  mv "$OUT_DIR/$base.png" "$OUT_DIR/${base%.svg}.png"
}

cat > "$SRC_DIR/pill-deadline-7days.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="168" viewBox="0 0 1200 168">
  <rect x="4" y="4" width="1192" height="160" rx="80" fill="#080808" stroke="#f5c6d8" stroke-width="2"/>
  <text x="600" y="98" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="38" font-weight="300" letter-spacing="6" fill="#f5c6d8">VOUS DISPOSEZ DE 7 JOURS POUR TESTER MARÉE NOIRE.</text>
</svg>
SVG

cat > "$SRC_DIR/pill-deadline-48h.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="168" viewBox="0 0 1200 168">
  <rect x="4" y="4" width="1192" height="160" rx="80" fill="#080808" stroke="#f5c6d8" stroke-width="2"/>
  <text x="600" y="98" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="40" font-weight="300" letter-spacing="6" fill="#f5c6d8">IL VOUS RESTE 48H POUR TESTER MARÉE NOIRE</text>
</svg>
SVG

cat > "$SRC_DIR/launch-pitch-card.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
  <rect x="4" y="4" width="1192" height="752" rx="48" fill="#080808" stroke="#c8f5e8" stroke-width="2"/>
  <text x="76" y="116" font-family="Helvetica, Arial, sans-serif" font-size="42" font-weight="400" fill="#ffffff">
    <tspan x="76" dy="0">Huit ans après sa disparition, Noé réapparaît sur la côte, vivant. Il n'a pas vieilli.</tspan>
    <tspan x="76" dy="88">Où était-il pendant tout ce temps ? Pourquoi revient-il maintenant ? Tandis que</tspan>
    <tspan x="76" dy="68">l'enquête reprend, la ville se fissure : certain·es cherchent à comprendre,</tspan>
    <tspan x="76" dy="68">d'autres à reprendre le contrôle, d'autres encore à donner une forme</tspan>
    <tspan x="76" dy="68">à l'inexplicable.</tspan>
    <tspan x="76" dy="88">Autour de la digue, au rythme des marées, un phénomène étrange</tspan>
    <tspan x="76" dy="68">s'installe, insidieusement.</tspan>
  </text>
</svg>
SVG

cat > "$SRC_DIR/closing-opium-card.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="470" viewBox="0 0 1200 470">
  <rect x="4" y="4" width="1192" height="462" rx="48" fill="#080808" stroke="#f5c6d8" stroke-width="2"/>
  <text x="64" y="92" font-family="Helvetica, Arial, sans-serif" font-size="50" font-weight="400" fill="#ffffff">Opium</text>
  <text x="64" y="140" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="300" letter-spacing="4" fill="#c8f5e8">UCHRONIE · 6 × 52 MIN</text>
  <text x="64" y="208" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="400" fill="#d9d9d9">
    <tspan x="64" dy="0">Aujourd’hui Mathilde fête ses 15 ans dans un monde où</tspan>
    <tspan x="64" dy="52">l’héroïne réglementaire rend les gens meilleurs.</tspan>
  </text>
</svg>
SVG

cat > "$SRC_DIR/closing-consentement-mutuel-card.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="470" viewBox="0 0 1200 470">
  <rect x="4" y="4" width="1192" height="462" rx="48" fill="#080808" stroke="#f5c6d8" stroke-width="2"/>
  <text x="64" y="92" font-family="Helvetica, Arial, sans-serif" font-size="50" font-weight="400" fill="#ffffff">Consentement Mutuel</text>
  <text x="64" y="140" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="300" letter-spacing="4" fill="#c8f5e8">DRAMÉDIE · 8 × 26 MIN</text>
  <text x="64" y="208" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="400" fill="#d9d9d9">
    <tspan x="64" dy="0">Marie et Eli divorcent parfaitement, jusqu’au moment</tspan>
    <tspan x="64" dy="52">où la réalité déborde le mode d’emploi.</tspan>
  </text>
</svg>
SVG

cat > "$SRC_DIR/closing-kim-card.svg" <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="470" viewBox="0 0 1200 470">
  <rect x="4" y="4" width="1192" height="462" rx="48" fill="#080808" stroke="#f5c6d8" stroke-width="2"/>
  <text x="64" y="92" font-family="Helvetica, Arial, sans-serif" font-size="50" font-weight="400" fill="#ffffff">Kim</text>
  <text x="64" y="140" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="300" letter-spacing="4" fill="#c8f5e8">DRAMÉDIE · 30 × 26 MIN</text>
  <text x="64" y="208" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="400" fill="#d9d9d9">
    <tspan x="64" dy="0">Belge, drôle et trop franche, Kim débarque à Paris</tspan>
    <tspan x="64" dy="52">persuadée qu’elle va y faire du cinéma.</tspan>
  </text>
</svg>
SVG

render_png "$SRC_DIR/pill-deadline-7days.svg" 1200
render_png "$SRC_DIR/pill-deadline-48h.svg" 1200
render_png "$SRC_DIR/launch-pitch-card.svg" 1200
render_png "$SRC_DIR/closing-opium-card.svg" 1200
render_png "$SRC_DIR/closing-consentement-mutuel-card.svg" 1200
render_png "$SRC_DIR/closing-kim-card.svg" 1200

echo "mail assets generated"
