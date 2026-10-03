#!/usr/bin/env python3
"""report-meta.py — The metadata contract for docs/reports, and its gate.

ADR-046 Decision 1 makes a portal table the index of every infra report, and
names the prerequisite: reports must carry metadata the index can read. Before
brik-llm#4101 none did. 11 of 47 brik-llm reports had any `<meta name=…>`, and
the only name among them was `viewport`. So nothing could answer "what is
stale", "what supersedes this" or "who owns it".

This one file defines the contract, stamps it onto a report, checks it, and
writes the manifest the index reads. The contract itself, with field meanings,
is documented in docs/reports/README.md § Metadata contract.

Every committed report under docs/reports/ carries these seven tags:

    report-status      current | archived | superseded
    report-subject     brik | bds | portal | llm
    report-owner       a GitHub login
    report-generated   YYYY-MM-DD — the date the content describes
    report-supersedes  repo-relative path of the report this replaces, or none
    report-cadence     once | on-demand | daily | weekly | monthly
    report-source      repo-relative path of the generator, or manual

The filename carries no data: `<kebab-slug>.html`. The date is read from
`report-generated`, never parsed from the name, so the three repos' existing
names (undated, date-suffixed, date-prefixed) all conform with no rename.

This file is a WATCHED TWIN (scripts/audit/overlap-twin-drift.py::TWINS). The
canonical copy is brik-llm's. Edit it there, then re-sync the consumers.

Usage (global flags go before the subcommand):
    report-meta.py [--json] check              # exit 1 on any violation
    report-meta.py [--dry-run] manifest [--write]
    report-meta.py parse FILE...               # JSON {path: meta}
    report-meta.py [--dry-run] [--json] stamp FILE --status S --subject S
                   [--owner O] [--generated D] [--supersedes P] [--cadence C] [--source P]
    Every subcommand takes --root DIR (default: the repo containing the cwd).

`check` fails on: a missing, duplicated or invalid tag; a subject that
disagrees with the report's folder; a status that disagrees with an
`[ARCHIVED]` title prefix; a supersedes pointer to a missing report, or one
that is not marked superseded; a `superseded` report nothing points at; a
source path that does not exist; a non-kebab filename; a stale manifest.

Exit codes: 0 clean · 1 violations · 2 usage or unreadable input.

Requirements: Python 3.9+ (stdlib only), git. No network.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import html.parser
import json
import re
import subprocess
import sys
from pathlib import Path

REPORTS_REL = "docs/reports"
MANIFEST_REL = f"{REPORTS_REL}/manifest.json"
CANONICAL = "brikdesigns/brik-llm:scripts/reports/report-meta.py"

FIELDS = (
    "report-status",
    "report-subject",
    "report-owner",
    "report-generated",
    "report-supersedes",
    "report-cadence",
    "report-source",
)
STATUSES = ("current", "archived", "superseded")
SUBJECTS = ("brik", "bds", "portal", "llm")
CADENCES = ("once", "on-demand", "daily", "weekly", "monthly")
OWNER_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*\.html$")
ARCHIVED_PREFIX = "[ARCHIVED]"

BLOCK_OPEN = "<!-- report-meta: contract in docs/reports/README.md (ADR-046) -->"
BLOCK_CLOSE = "<!-- /report-meta -->"
BLOCK_RE = re.compile(re.escape(BLOCK_OPEN) + r".*?" + re.escape(BLOCK_CLOSE) + r"\n?", re.S)


class _MetaParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.meta: dict[str, list[str]] = {}
        self.title: str | None = None
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and (a.get("name") or "").startswith("report-"):
            self.meta.setdefault(a["name"], []).append((a.get("content") or "").strip())
        elif tag == "title" and self.title is None:
            self._in_title = True
            self.title = ""

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def git_root(start: Path) -> Path:
    out = subprocess.run(["git", "-C", str(start), "rev-parse", "--show-toplevel"],
                         capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit(f"report-meta: not a git checkout: {start}")
    return Path(out.stdout.strip())


def tracked_reports(root: Path) -> list[str]:
    """Report paths in git's index — tracked or staged — sorted.

    The index, not the filesystem: an untracked draft is not a committed report,
    and pre-commit sees exactly what is about to land.
    """
    out = subprocess.run(["git", "-C", str(root), "ls-files", "--", f"{REPORTS_REL}/*.html"],
                         capture_output=True, text=True, check=True)
    return sorted(p for p in out.stdout.splitlines()
                  if Path(p).name != "index.html" and (root / p).is_file())


def parse_file(path: Path) -> tuple[dict[str, list[str]], str]:
    p = _MetaParser()
    p.feed(path.read_text(encoding="utf-8", errors="replace"))
    return p.meta, (p.title or "").strip()


def flat(meta: dict[str, list[str]]) -> dict[str, str]:
    return {k: v[0] for k, v in meta.items() if k in FIELDS and v}


def folder_subject(rel: str) -> str | None:
    """The subject a report's folder implies, when it sits in a subject folder."""
    parts = Path(rel).relative_to(REPORTS_REL).parts
    return parts[0] if len(parts) > 1 and parts[0] in SUBJECTS else None


def validate(root: Path, rel: str, meta: dict[str, list[str]], title: str) -> list[str]:
    errs: list[str] = []
    name = Path(rel).name
    if not NAME_RE.match(name):
        errs.append(f"filename is not <kebab-slug>.html: {name}")
    for f in FIELDS:
        vals = meta.get(f, [])
        if not vals:
            errs.append(f"missing <meta name=\"{f}\">")
        elif len(vals) > 1:
            errs.append(f"{f} appears {len(vals)} times")
    for extra in sorted(set(meta) - set(FIELDS)):
        errs.append(f"unknown tag {extra} (the contract has {len(FIELDS)} fields)")
    m = flat(meta)

    def bad(field, ok, expect):
        if field in m and not ok(m[field]):
            errs.append(f"{field}=\"{m[field]}\" — expected {expect}")

    bad("report-status", lambda v: v in STATUSES, " | ".join(STATUSES))
    bad("report-subject", lambda v: v in SUBJECTS, " | ".join(SUBJECTS))
    bad("report-owner", OWNER_RE.match, "a GitHub login")
    bad("report-cadence", lambda v: v in CADENCES, " | ".join(CADENCES))
    if "report-generated" in m:
        v = m["report-generated"]
        try:
            ok = bool(DATE_RE.match(v)) and dt.date.fromisoformat(v) <= dt.date.today()
        except ValueError:
            ok = False
        if not ok:
            errs.append(f"report-generated=\"{v}\" — expected a real YYYY-MM-DD, not in the future")
    if "report-source" in m and m["report-source"] != "manual" and not (root / m["report-source"]).is_file():
        errs.append(f"report-source=\"{m['report-source']}\" — no such file in this repo (or use: manual)")
    if "report-supersedes" in m and m["report-supersedes"] != "none":
        tgt = m["report-supersedes"]
        if tgt == rel:
            errs.append("report-supersedes points at itself")
        elif not (root / tgt).is_file():
            errs.append(f"report-supersedes=\"{tgt}\" — no such report (or use: none)")
    want = folder_subject(rel)
    if want and m.get("report-subject") not in (None, want):
        errs.append(f"report-subject=\"{m['report-subject']}\" but the report sits in {want}/")
    archived_title = title.startswith(ARCHIVED_PREFIX)
    if archived_title and m.get("report-status") not in (None, "archived"):
        errs.append(f"title starts {ARCHIVED_PREFIX} but report-status=\"{m['report-status']}\"")
    if m.get("report-status") == "archived" and not archived_title:
        errs.append(f"report-status=\"archived\" but the <title> lacks the {ARCHIVED_PREFIX} prefix")
    return errs


def collect(root: Path) -> list[dict]:
    rows = []
    for rel in tracked_reports(root):
        meta, title = parse_file(root / rel)
        rows.append({"path": rel, "title": title, "meta": meta})
    return rows


def manifest_doc(rows: list[dict]) -> str:
    reports = []
    for r in rows:
        m = flat(r["meta"])
        reports.append({"path": r["path"], "title": r["title"],
                        **{f.removeprefix("report-"): m.get(f) for f in FIELDS}})
    doc = {
        "schema": 1,
        "generated_by": CANONICAL,
        "contract": f"{REPORTS_REL}/README.md#metadata-contract",
        "count": len(reports),
        "reports": reports,
    }
    return json.dumps(doc, indent=2, ensure_ascii=False) + "\n"


def cmd_check(root: Path, as_json: bool = False) -> int:
    rows = collect(root)
    problems: list[tuple[str, str]] = []
    by_path = {r["path"]: flat(r["meta"]) for r in rows}
    pointed_at = {}
    for r in rows:
        for e in validate(root, r["path"], r["meta"], r["title"]):
            problems.append((r["path"], e))
        tgt = by_path[r["path"]].get("report-supersedes", "none")
        if tgt != "none" and tgt in by_path:
            pointed_at[tgt] = r["path"]
            if by_path[tgt].get("report-status") != "superseded":
                problems.append((r["path"], f"supersedes {tgt}, which is not marked report-status=\"superseded\""))
    for path, m in by_path.items():
        if m.get("report-status") == "superseded" and path not in pointed_at:
            problems.append((path, "report-status=\"superseded\" but no report names it in report-supersedes"))
    mf = root / MANIFEST_REL
    expected = manifest_doc(rows)
    if not mf.is_file():
        problems.append((MANIFEST_REL, "missing — run: scripts/reports/report-meta.py manifest --write"))
    elif mf.read_text(encoding="utf-8") != expected:
        problems.append((MANIFEST_REL, "stale — run: scripts/reports/report-meta.py manifest --write"))
    if as_json:
        print(json.dumps({"ok": not problems, "count": len(rows),
                          "problems": [{"path": p, "error": e} for p, e in problems]},
                         ensure_ascii=False))
        return 1 if problems else 0
    if not problems:
        print(f"report-meta: {len(rows)} report(s) carry the contract; manifest current.")
        return 0
    print(f"report-meta: {len(problems)} violation(s) across {len({p for p, _ in problems})} file(s):", file=sys.stderr)
    for path, e in problems:
        print(f"  {path}: {e}", file=sys.stderr)
    print("\nFix: stamp the contract with `scripts/reports/report-meta.py stamp <file> --status … --subject …`,\n"
          "then `scripts/reports/report-meta.py manifest --write`. Contract: docs/reports/README.md § Metadata contract.",
          file=sys.stderr)
    return 1


def render_block(values: dict[str, str]) -> str:
    lines = [BLOCK_OPEN]
    for f in FIELDS:
        lines.append(f'<meta name="{f}" content="{html.escape(values[f], quote=True)}">')
    lines.append(BLOCK_CLOSE)
    return "\n".join(lines) + "\n"


def insert_block(text: str, block: str) -> str:
    """Replace an existing block, or insert one at the head of the document."""
    if BLOCK_RE.search(text):
        return BLOCK_RE.sub(lambda _m: block, text, count=1)
    # Only the document head is searched: a `<meta charset>` quoted in the body
    # must not attract the block, and `<head` must not match `<header`.
    head_end = re.search(r"</head\s*>|<body[\s>]", text, re.I)
    region = text[:head_end.start()] if head_end else ""
    for pat in (r"<meta\s+charset[^>]*>\s*\n?", r"<head(?:\s[^>]*)?>\s*\n?"):
        mt = re.search(pat, region, re.I)
        if mt:
            end = mt.end()
            sep = "" if text[mt.start():end].endswith("\n") else "\n"
            return text[:end] + sep + block + text[end:]
    mt = re.search(r"<title[^>]*>", text, re.I)
    if mt:
        return text[:mt.start()] + block + text[mt.start():]
    return block + text


def cmd_stamp(root: Path, args) -> int:
    path = Path(args.file).resolve()
    if not path.is_file():
        print(f"report-meta: no such file: {args.file}", file=sys.stderr)
        return 2
    existing = flat(parse_file(path)[0])
    values = {
        "report-status": args.status,
        "report-subject": args.subject,
        "report-owner": args.owner,
        "report-generated": args.generated or dt.date.today().isoformat(),
        "report-supersedes": args.supersedes,
        "report-cadence": args.cadence,
        "report-source": args.source,
    }
    values = {k: (v if v is not None else existing.get(k)) for k, v in values.items()}
    missing = [k for k, v in values.items() if not v]
    if missing:
        print(f"report-meta: stamp needs a value for {', '.join(missing)}", file=sys.stderr)
        return 2
    text = path.read_text(encoding="utf-8")
    if not BLOCK_RE.search(text) and existing:
        print(f"report-meta: {args.file} has report-* tags outside a stamped block; remove them first", file=sys.stderr)
        return 2
    new_text = insert_block(text, render_block(values))
    rel = str(path.relative_to(root)) if path.is_relative_to(root) else str(path)
    p = _MetaParser()
    p.feed(new_text)
    errs = validate(root, rel, p.meta, (p.title or "").strip())
    if not args.dry_run:
        path.write_text(new_text, encoding="utf-8")
    if args.json:
        print(json.dumps({"path": rel, "values": values, "changed": new_text != text,
                          "written": not args.dry_run, "errors": errs}, ensure_ascii=False))
    else:
        if args.dry_run:
            print(f"report-meta: dry-run, would {'stamp' if new_text != text else 'leave unchanged'} {rel}",
                  file=sys.stderr)
        for e in errs:
            print(f"  {rel}: {e}", file=sys.stderr)
    return 1 if errs else 0


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--root", help="checkout to operate on (default: the repo containing the cwd)")
    ap.add_argument("--dry-run", action="store_true",
                    help="stamp and manifest --write report what they would change, and write nothing")
    ap.add_argument("--json", action="store_true",
                    help="machine-readable output for check and stamp (manifest and parse are always JSON)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check", help="exit 1 when any committed report breaks the contract")
    mp = sub.add_parser("manifest", help="print, or --write, docs/reports/manifest.json")
    mp.add_argument("--write", action="store_true")
    pp = sub.add_parser("parse", help="JSON {path: {field: value}} for the given files")
    pp.add_argument("files", nargs="+")
    sp = sub.add_parser("stamp", help="write or replace the contract block in one report")
    sp.add_argument("file")
    sp.add_argument("--status", choices=STATUSES)
    sp.add_argument("--subject", choices=SUBJECTS)
    sp.add_argument("--owner")
    sp.add_argument("--generated", help="YYYY-MM-DD (default: today, for a new report)")
    sp.add_argument("--supersedes", help="repo-relative report path, or none")
    sp.add_argument("--cadence", choices=CADENCES)
    sp.add_argument("--source", help="repo-relative generator path, or manual")
    args = ap.parse_args(argv)

    root = git_root(Path(args.root) if args.root else Path.cwd())
    if args.cmd == "check":
        return cmd_check(root, args.json)
    if args.cmd == "manifest":
        doc = manifest_doc(collect(root))
        if args.write and args.dry_run:
            mf = root / MANIFEST_REL
            same = mf.is_file() and mf.read_text(encoding="utf-8") == doc
            print(f"report-meta: dry-run, {MANIFEST_REL} is {'current' if same else 'stale; would rewrite it'}",
                  file=sys.stderr)
        elif args.write:
            (root / MANIFEST_REL).write_text(doc, encoding="utf-8")
            print(f"report-meta: wrote {MANIFEST_REL}", file=sys.stderr)
        else:
            sys.stdout.write(doc)
        return 0
    if args.cmd == "parse":
        out = {}
        for f in args.files:
            p = Path(f) if Path(f).is_absolute() else root / f
            out[f] = flat(parse_file(p)[0]) if p.is_file() else None
        print(json.dumps(out, ensure_ascii=False))
        return 0
    return cmd_stamp(root, args)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
