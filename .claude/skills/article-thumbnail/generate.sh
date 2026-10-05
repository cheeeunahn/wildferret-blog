#!/usr/bin/env bash
# Draw an article's card thumbnail with Codex and install it as
# public/assets/images/<slug>-card.webp (640×640).
#
#   generate.sh <slug> "<what to draw>"
#
# Codex gets the existing card thumbnails as style references, so a new one
# matches them. The raw PNG is kept in $TMPDIR for a re-roll comparison.
set -euo pipefail

slug="${1:?usage: generate.sh <slug> \"<what to draw>\"}"
subject="${2:?usage: generate.sh <slug> \"<what to draw>\"}"

repo="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
images="$repo/public/assets/images"
out_dir="$(mktemp -d "${TMPDIR:-/tmp}/card-thumb-$slug.XXXX")"
draft="$out_dir/$slug.png"
target="$images/$slug-card.webp"

command -v codex >/dev/null || { echo "codex CLI not found" >&2; exit 1; }
command -v cwebp >/dev/null || { echo "cwebp not found (brew install webp)" >&2; exit 1; }

# The style references. These three are the canonical look; keep them in sync
# with the list in SKILL.md if one is ever replaced.
refs=()
for name in mgs-2026-play-hall-card ai-git-101-for-designers-card synthetic-user-reading-card; do
  refs+=(-i "$images/$name.webp")
done

read -r -d '' prompt <<EOF || true
Generate ONE image with your image generation tool, then save it as a PNG at exactly:
  $draft

What to draw: $subject

Match the attached reference images exactly in style — they are thumbnails from
the same blog and the new one must look like it belongs in the set:
- Hand-drawn black marker doodle line art, like a felt-tip pen sketch.
- Pure black strokes on a pure white background. No color, no gray, no
  shading, no gradients, no fills except tiny solid details.
- Thick, even, slightly wobbly lines with rounded ends.
- One simple, recognizable central motif (an object or small scene), centered,
  with generous white margin on every side (about 15% of the canvas).
- At most a few small accents around it (motion ticks, sparkles, dots).
- Square 1:1 canvas.
- Absolutely no text, letters, numbers, logos or watermarks.
- No people's faces in detail; keep it iconic and minimal.

Do not modify any file in the repository. Only write $draft.
When done, reply with the path you saved.
EOF

marker="$out_dir/.start"
touch "$marker"

codex exec \
  --skip-git-repo-check \
  -s workspace-write \
  -C "$repo" \
  --add-dir "$out_dir" \
  "${refs[@]}" \
  -o "$out_dir/codex-last-message.txt" \
  "$prompt" >"$out_dir/codex.log" 2>&1 || {
  echo "codex exec failed — log: $out_dir/codex.log" >&2
  exit 1
}

# Codex keeps every generated image under ~/.codex/generated_images; if it did
# not copy the file out itself, take the newest one from this run.
if [[ ! -s "$draft" ]]; then
  newest="$(find "${CODEX_HOME:-$HOME/.codex}/generated_images" -type f \
    \( -name '*.png' -o -name '*.webp' -o -name '*.jpg' \) -newer "$marker" \
    -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -1 || true)"
  [[ -n "$newest" ]] && cp "$newest" "$draft"
fi

[[ -s "$draft" ]] || {
  echo "Codex produced no image — log: $out_dir/codex.log" >&2
  exit 1
}

cwebp -quiet -q 85 -resize 640 640 "$draft" -o "$target"

echo "draft:  $draft"
echo "card:   $target"
echo "path:   /assets/images/$slug-card.webp"
