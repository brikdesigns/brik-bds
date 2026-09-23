#!/usr/bin/env python3
"""
unguarded-grep-scan.py — flag `grep` in a command substitution under `set -e` (#2423)

THE DEFECT CLASS. In a script running `set -euo pipefail`, the exit status of
`$(…)` IS the assignment's status. `grep` exits 1 when it matches nothing, and
matching nothing is usually the HEALTHY case. So the script aborts on the healthy
path, and any guard written on the following line is unreachable — including, in
the worst instances, the handler written for exactly that case.

This has landed three times in the same 3,700-line script:
  #2417  three instances in scripts/morning-check.sh, fixed
  #2168  ten checks silently skipped, the outage that surfaced the class
  #2423  scripts/morning-check.sh:2870 — the rc=2 branch below it, which names
         PyYAML and the provisioning script by hand, was dead code for two days
         while brik-mini's morning-check truncated at 20% short of the end

`test-morning-check-abort-trap.sh` REPORTS a truncated run. It does not prevent
one. This script is the preventer, and it runs over every `-e` shell script in
the repo rather than one file.

WHAT COUNTS. A finding needs all four:
  1. the file enables `-e` (`set -e`, `set -eu`, `set -euo pipefail`, `set -o errexit`)
  2. `-e` is still in force at that line (a preceding `set +e` clears the file)
  3. an assignment of the form `VAR=$(…)` or `VAR="$(…)"`, `local`/`export` included
  4. the substitution pipes into `grep`, with no `|| true` / `|| :` / `|| echo` guard

`grep -q` inside an `if`/`&&`/`||` test is NOT in the class: the conditional
consumes the status. Neither are `awk` and `sed`, which exit 0 on no match.

Backslash continuations are JOINED before matching. The instance that motivated
this gate spans two physical lines with the `grep` on the second, and #2423's
original one-line scan could not see it.

EXEMPTION. Put `# unguarded-grep-ok: <reason>` on the line above. A bare marker
with no reason does not count — the reason is the point.

Exit codes: 0 clean · 1 findings · 2 usage/config error

Usage:
    scripts/audit/unguarded-grep-scan.py                  # scan scripts/ + operations/
    scripts/audit/unguarded-grep-scan.py --ci             # ::error annotations
    scripts/audit/unguarded-grep-scan.py --negative-control
    scripts/audit/unguarded-grep-scan.py path/to/one.sh
    scripts/audit/unguarded-grep-scan.py .                # a directory expands
                                                           # to its *.sh descendants
                                                           # (#3714) — the way a
                                                           # sibling repo with no
                                                           # scripts/+operations/
                                                           # layout runs this scan
"""

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCAN_DIRS = ("scripts", "operations")

SET_E = re.compile(r"^\s*set\s+(-[a-z]*e[a-z]*\b|-o\s+errexit\b)")
UNSET_E = re.compile(r"^\s*set\s+(\+[a-z]*e[a-z]*\b|\+o\s+errexit\b)")
# `local x=$(`, `export X="$(`, `X=$(` — the leading keyword is optional.
ASSIGN = re.compile(r"^\s*(?:local\s+|export\s+|declare\s+(?:-\w+\s+)*)?"
                    r"[A-Za-z_][A-Za-z0-9_]*=\"?\$\(")
IS_GREP = re.compile(r"^\s*(?:command\s+)?e?grep\b")
PIPEFAIL = re.compile(r"^\s*set\s+(?:-[a-z]*o\s+pipefail\b|-o\s+pipefail\b)")
GUARD = re.compile(r"\|\|\s*(?:true\b|:|echo\b|[A-Za-z_][A-Za-z0-9_]*=)")
EXEMPT = re.compile(r"#\s*unguarded-grep-ok:\s*\S")

MSG = ("grep in a command substitution under `set -e` — no-match exits 1 and "
       "aborts the script on the healthy path; append `|| true` (brik-llm#2423)")


def logical_lines(text):
    """Yield (first_physical_lineno, joined_line), joining backslash continuations."""
    out, buf, start = [], "", None
    for i, raw in enumerate(text.splitlines(), 1):
        if start is None:
            start = i
        stripped = raw.rstrip()
        if stripped.endswith("\\"):
            buf += stripped[:-1] + " "
            continue
        out.append((start, buf + stripped))
        buf, start = "", None
    if start is not None:
        out.append((start, buf))
    return out


def substitution_body(line):
    """Return the text inside the assignment's `$(…)`, balanced-paren aware."""
    start = line.find("$(")
    if start < 0:
        return ""
    depth, i = 0, start + 1
    while i < len(line):
        if line[i] == "(":
            depth += 1
        elif line[i] == ")":
            depth -= 1
            if depth == 0:
                return line[start + 2:i]
        i += 1
    return line[start + 2:]


def grep_decides_status(body, pipefail):
    """True when a `grep` in this substitution sets the assignment's exit status.

    Split on top-level `|`. A grep in the LAST segment decides the status on its
    own. A grep EARLIER in the pipeline only decides it under `set -o pipefail` —
    without pipefail the status is the last command's, so it is not this class.
    """
    segs, depth, cur = [], 0, ""
    for ch in body:
        if ch in "([":
            depth += 1
        elif ch in ")]":
            depth -= 1
        if ch == "|" and depth == 0:
            segs.append(cur)
            cur = ""
            continue
        cur += ch
    segs.append(cur)
    # `||` splits into an empty segment; drop those so `x || true` reads as one.
    segs = [s for s in segs if s.strip()]
    if not segs:
        return False
    for idx, seg in enumerate(segs):
        if not IS_GREP.match(seg):
            continue
        if idx == len(segs) - 1 or pipefail:
            return True
    return False


def scan_text(text):
    """Return [(lineno, joined_line)] for one script's source."""
    lines = logical_lines(text)
    if not any(SET_E.match(ln) for _, ln in lines):
        return []
    pipefail = any(PIPEFAIL.match(ln) for _, ln in lines)
    findings, e_active, prev = [], False, ""
    for lineno, line in lines:
        if SET_E.match(line):
            e_active = True
        elif UNSET_E.match(line):
            # A suite that deliberately drives non-zero exits (the control case
            # in #2423 is test-morning-check-cached-artifact.sh:41) turns -e off
            # and never turns it back on. Clearing for the rest of the file is
            # the conservative read: a false negative here beats failing CI over
            # a test that cannot abort.
            e_active = False
        if not e_active:
            prev = line
            continue
        stripped = line.strip()
        if stripped.startswith("#"):
            prev = line
            continue
        if (ASSIGN.match(line)
                and grep_decides_status(substitution_body(line), pipefail)
                and not GUARD.search(line) and not EXEMPT.search(prev)
                and not EXEMPT.search(line)):
            findings.append((lineno, stripped))
        prev = line
    return findings


def shell_files(targets):
    """A directory target expands to its `*.sh` descendants (#3714) — the same
    `rglob("*.sh")` the no-argument default already uses for SCAN_DIRS. Without
    this, `unguarded-grep-scan.py .` handed the directory itself to
    `path.read_text()`, which raised `IsADirectoryError` and exited 2 with the
    findings list still empty on stdout — indistinguishable from a clean scan
    to a caller that does not check the exit code.
    """
    if not targets:
        found = []
        for d in SCAN_DIRS:
            root = REPO_ROOT / d
            if root.is_dir():
                found.extend(sorted(root.rglob("*.sh")))
        return found
    found = []
    for t in targets:
        p = Path(t)
        if p.is_dir():
            found.extend(sorted(p.rglob("*.sh")))
        else:
            found.append(p)
    return found


NEGATIVE_CONTROLS = (
    # The pre-#2417 single-line shape the original scan in #2423 could see.
    ('set -euo pipefail\nx="$(printf y | grep z)"\n', 2),
    # grep as the FIRST command, piped onward — vscode-extensions-drift.sh:185,
    # one of the two sites #2423 was filed to fix. An earlier draft of this
    # scanner missed both, because its controls only covered the `| grep` shape.
    ('set -euo pipefail\napproved="$(grep -oE p f \\\n  | awk \'{print $2}\' | sort -u)"\n', 2),
    # convert-logo.sh:51 — grep first, piped onward, under pipefail (that file
    # sets `-euo pipefail` at :5). Without pipefail this same line is NOT the
    # class, which is why the positive controls carry it in that form too.
    ('set -euo pipefail\nk="$(grep -E p f | head -1 | cut -d= -f2-)"\n', 2),
    # The #2423 shape: unquoted, split across a backslash continuation.
    ('set -euo pipefail\nsummary=$(printf y \\\n  | grep -E z \\\n  | tail -1)\n', 2),
    # `local` inside a function.
    ('set -e\nf() {\n  local n=$(cat f | grep x)\n}\n', 3),
)
POSITIVE_CONTROLS = (
    # Guarded — the fix this gate asks for.
    'set -euo pipefail\nx=$(printf y | grep z || true)\n',
    # -e disabled before the pattern (test-morning-check-cached-artifact.sh:41).
    'set -euo pipefail\nset +e\nx=$(printf y | grep z)\n',
    # No -e at all.
    'x=$(printf y | grep z)\n',
    # grep -q consumed by a conditional, not an assignment.
    'set -euo pipefail\nif printf y | grep -q z; then echo hi; fi\n',
    # awk and sed exit 0 on no match.
    'set -euo pipefail\nx=$(printf y | awk "/z/ {print}")\n',
    # grep mid-pipeline WITHOUT pipefail: `tail` sets the status, so not the class.
    'set -e\nx=$(printf y | grep z | tail -1)\n',
    # Exempted with a stated reason.
    'set -euo pipefail\n# unguarded-grep-ok: allow-list is validated upstream\nx=$(printf y | grep z)\n',
)


def check_directory_handling():
    """A directory arg must expand to its `*.sh` descendants, an EMPTY
    directory must exit non-zero rather than reporting a clean scan, and a
    directory OUTSIDE this repo (a sibling repo's own checkout) must not crash
    on the `relative_to()` used to print a finding's path (#3714 — found by
    running the fixed scanner against brikdesigns/claude-talk-to-figma-mcp).
    """
    import subprocess
    import tempfile

    ok = True
    with tempfile.TemporaryDirectory() as d:
        root = Path(d)
        nested = root / "sub"
        nested.mkdir()
        target = nested / "x.sh"
        target.write_text("set -euo pipefail\nx=$(printf y | grep z)\n")
        found = [p.resolve() for p in shell_files([str(root)])]
        if found != [target.resolve()]:
            print(f"FAIL: shell_files([{d!r}]) = {found}, expected [{target}]",
                  file=sys.stderr)
            ok = False

        proc = subprocess.run(
            [sys.executable, str(Path(__file__).resolve()), str(root)],
            capture_output=True, text=True,
        )
        if proc.returncode != 1 or str(target) not in proc.stdout:
            print(f"FAIL: scanning {root} (outside REPO_ROOT) with a real "
                  f"finding — rc={proc.returncode}, stdout={proc.stdout!r}, "
                  f"stderr={proc.stderr!r}", file=sys.stderr)
            ok = False

    with tempfile.TemporaryDirectory() as empty_dir:
        proc = subprocess.run(
            [sys.executable, str(Path(__file__).resolve()), empty_dir],
            capture_output=True, text=True,
        )
        if proc.returncode == 0:
            print(f"FAIL: scanning empty directory {empty_dir!r} exited 0 "
                  f"(silently clean) instead of erroring", file=sys.stderr)
            ok = False
    return ok


def negative_control():
    """Prove the scanner fires on known-bad and stays silent on known-good."""
    ok = True
    for src, want_line in NEGATIVE_CONTROLS:
        got = scan_text(src)
        if len(got) != 1 or got[0][0] != want_line:
            print(f"FAIL: expected one finding at line {want_line}, got {got}",
                  file=sys.stderr)
            ok = False
    for src in POSITIVE_CONTROLS:
        got = scan_text(src)
        if got:
            print(f"FAIL: false positive {got} on:\n{src}", file=sys.stderr)
            ok = False
    ok = check_directory_handling() and ok
    print("negative control: "
          f"{len(NEGATIVE_CONTROLS)} bad shape(s) caught, "
          f"{len(POSITIVE_CONTROLS)} good shape(s) clean, "
          "directory expansion + zero-file guard hold"
          if ok else "negative control FAILED", file=sys.stderr)
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("paths", nargs="*", help="scripts to scan (default: scripts/ + operations/)")
    ap.add_argument("--ci", action="store_true",
                    help="emit GitHub Actions ::error annotations")
    ap.add_argument("--negative-control", action="store_true",
                    help="self-test the matcher against known-bad and known-good shapes")
    ap.add_argument("--json", action="store_true",
                    help="emit findings as a JSON object on stdout")
    args = ap.parse_args()

    if args.negative_control:
        return negative_control()

    files = shell_files(args.paths)
    if not files:
        if args.paths:
            print(f"unguarded-grep-scan: no *.sh files found under "
                  f"{', '.join(args.paths)} — zero-file scan, not a clean one",
                  file=sys.stderr)
        else:
            print("unguarded-grep-scan: no shell scripts found — wrong repo root?",
                  file=sys.stderr)
        return 2

    total = 0
    findings = []
    for path in files:
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            print(f"unguarded-grep-scan: cannot read {path}: {exc}", file=sys.stderr)
            return 2
        # An absolute path outside REPO_ROOT (a sibling repo's own checkout,
        # scanned by directory — #3714) is not relative_to()-able; print it as
        # given rather than crashing.
        rel = (path.relative_to(REPO_ROOT)
                if path.is_absolute() and path.is_relative_to(REPO_ROOT)
                else path)
        for lineno, snippet in scan_text(text):
            total += 1
            findings.append({"file": str(rel), "line": lineno,
                             "snippet": snippet[:200], "message": MSG})
            if not args.json:
                print(f"{rel}:{lineno}: {snippet[:120]}")
            if args.ci:
                print(f"::error file={rel},line={lineno},title=Unguarded grep::{MSG}")

    if args.json:
        json.dump({"scanned": len(files), "count": total, "findings": findings},
                  sys.stdout, indent=2)
        sys.stdout.write("\n")
    print(f"scanned {len(files)} shell script(s); {total} unguarded grep(s)",
          file=sys.stderr)
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main())
