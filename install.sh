#!/bin/bash

# Install ascii-magic from this checkout: fetch upstream's pieces, install
# screensaver-session, put ascii-magic on PATH, and link it in as the
# screensaver-rotation runner `magic`.

set -euo pipefail

repo=$(cd "$(dirname "$0")" && pwd)

for tool in gjs cargo; do
  command -v "$tool" >/dev/null || { echo "install.sh: needs $tool" >&2; exit 1; }
done
gjs -c 'imports.gi.versions.WebKit2 = "4.1"; imports.gi.WebKit2;' 2>/dev/null ||
  { echo "install.sh: needs WebKitGTK 4.1 (webkit2gtk-4.1)" >&2; exit 1; }

git -C "$repo" submodule update --init
cargo install --locked --quiet --root "$HOME/.local" \
  --git https://github.com/igouss/screensaver-session screensaver-session
ln -sfn "$repo/bin/ascii-magic" "$HOME/.local/bin/ascii-magic"
echo "linked ~/.local/bin/ascii-magic"
runners="$HOME/.local/lib/screensaver-rotation/runners"
mkdir -p "$runners"
ln -sfn "$repo/bin/ascii-magic" "$runners/magic"
echo "linked runner magic ($("$repo/bin/ascii-magic" --list | wc -l) pieces)"
