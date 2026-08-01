#!/usr/bin/env bash
# mirror-widgets.sh — re-sync a consumer's mirrored devbar widgets to the copy
# npm just installed.
#
# Why this exists (#1587): brik-client-portal keeps a copy of the devbar widgets
# under scripts/mockup-shared/ — they ship raw to Supabase Storage and run inside
# self-contained client mockups, where the package cannot be imported. Its #1583
# parity gate asserts the committed copy is byte-identical to the INSTALLED
# package, so a bump that changes a widget invalidates the mirror and the PR
# propagate opens lands red. brikdesigns/brik-client-portal#2585 is one that had
# to be re-synced by hand; the unattended 09:00 run cannot do that.
#
# Source is the consumer's own node_modules, not the BDS working tree: the gate
# compares against what npm installed, so copying from there makes it pass by
# construction even when the local BDS checkout has drifted from the release.
#
# The filename list comes from sync-devbar-widgets.sh --list-portal-mirror, so
# adding a widget there is enough — this file never grows a second list.

# sync_mirrored_widgets <consumer_root> <package_name> <widget_list_cmd...>
#
# Copies each listed widget from <consumer_root>/node_modules/<pkg>/… into
# <consumer_root>/scripts/mockup-shared/ when the two differ, and echoes each
# relative path it changed (one per line) so the caller can `git add` them.
# Silent and successful when the consumer has no mirror, or when nothing drifted.
sync_mirrored_widgets() {
  local consumer_root="$1" pkg="$2"
  shift 2

  local mirror_dir="$consumer_root/scripts/mockup-shared"
  # Not every npm consumer mirrors widgets — that is not an error.
  [ -d "$mirror_dir" ] || return 0

  local installed="$consumer_root/node_modules/$pkg/components/ui/BrikDevBar/widgets"
  if [ ! -d "$installed" ]; then
    echo "mirror-widgets: no installed widgets at $installed" >&2
    return 0
  fi

  local widget
  while IFS= read -r widget; do
    [ -n "$widget" ] || continue
    # Only files the consumer ALREADY mirrors. Propagate must not introduce a new
    # mirrored file as a side effect of a version bump — that is a decision for
    # sync-devbar-widgets.sh, which records state and refuses divergent copies.
    [ -f "$mirror_dir/$widget" ] || continue
    [ -f "$installed/$widget" ] || continue
    if ! cmp -s "$installed/$widget" "$mirror_dir/$widget"; then
      cp "$installed/$widget" "$mirror_dir/$widget"
      echo "scripts/mockup-shared/$widget"
    fi
  done < <("$@")
}
