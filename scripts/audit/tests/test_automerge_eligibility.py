#!/usr/bin/env python3
"""test_automerge_eligibility.py — contract gate for the auto-merge policy.

This suite IS the CI assertion required by brik-llm#2046 AC-2 ("exclusion list is
CI-asserted, not advisory"). Auto-merge removes the reviewer, so the exclusion
table is the last thing standing between an agent-authored PR and `main`. A
pattern that silently matches nothing is indistinguishable from a comment — and
it would look identical in review — so every exclusion is asserted against a real
path from this repo, and every one is paired with a near-miss that must NOT match.

The near-miss pairs are the load-bearing half. A table of `**` globs that matched
everything would pass an exclusions-only suite and block every PR forever; a
table that matched nothing would pass an equally naive suite and auto-merge the
secrets registry. Only both directions pin the behaviour.

Three groups:

    1. exclusions   — real repo paths that MUST be blocked, one per policy bullet
    2. near-misses  — ordinary paths that must NOT be blocked
    3. drift        — every hard-exclusion bullet in session-contract.md
                      § Auto-merge policy has a pattern here, and vice versa

Plus the qa-freshness rules, which are the criterion most likely to be quietly
weakened: a `pass` older than the head commit reviewed different code.

brik-bds port of the brik-llm suite (brik-llm#3396; origin #2046). The MUST_BLOCK
/ MUST_NOT_BLOCK path lists and the policy-drift subjects are this repo's; the
qa-freshness, gh-scalar and disarm-tolerance groups are behavioural and ported
unchanged. No package form here — scripts/ is not a Python package in this repo.

Run from the repo root:
    python3 scripts/audit/tests/test_automerge_eligibility.py
"""

import importlib.util
import os
import shlex
import subprocess
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "automerge-eligibility.py"
REPO_ROOT = Path(__file__).resolve().parents[3]

_spec = importlib.util.spec_from_file_location("automerge_eligibility", MODULE_PATH)
ame = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ame)


class TestExcludedPaths(unittest.TestCase):
    """Real paths from this repo that must never auto-merge."""

    # (path, the policy bullet it stands for). Each path is checked to exist in
    # the repo below, so a rename that strands a pattern fails here rather than
    # in production.
    MUST_BLOCK = [
        ("tokens/animations.css", "design tokens"),
        ("tokens/contrast-pairings.json", "design tokens"),
        ("design-tokens/foundations.json", "design tokens"),
        (".github/workflows/gitleaks.yml", "CI workflows"),
        (".github/required-checks.json", "required-check declaration"),
        ("CLAUDE.md", "canon"),
        ("BDS-CONSUMER.md", "consumer canon"),
        (".claude/hooks/secret-capture-guard.sh", "canon hooks"),
        (".husky/pre-commit", "git hooks"),
        ("package.json", "npm publish manifest"),
        (".env.example", "environment file"),
    ]

    # Paths that exist in the repo but are ordinary work. If any of these blocks,
    # the table is over-broad and auto-merge never fires.
    MUST_NOT_BLOCK = [
        "scripts/audit/automerge-eligibility.py",
        "scripts/canonical-check.mjs",
        "scripts/lint-merge-queue-readiness.mjs",
        "components/ui/Accordion/Accordion.tsx",
        "components/ui/Accordion/Accordion.css",
        "stories/ThemeSwitcher.stories.tsx",
        "README.md",
        "content-system/blueprints/astro/types.ts",
    ]

    def test_policy_paths_are_blocked(self):
        for path, bullet in self.MUST_BLOCK:
            with self.subTest(path=path, bullet=bullet):
                self.assertTrue(
                    ame.path_blockers([path]),
                    f"{path} ({bullet}) must be excluded from auto-merge",
                )

    def test_policy_paths_still_exist(self):
        """A pattern guarding a path that no longer exists is a dead rule."""
        for path, _ in self.MUST_BLOCK:
            with self.subTest(path=path):
                self.assertTrue(
                    (REPO_ROOT / path).exists(),
                    f"{path} is gone — update the exclusion table, do not leave it stale",
                )

    def test_ordinary_paths_are_not_blocked(self):
        for path in self.MUST_NOT_BLOCK:
            with self.subTest(path=path):
                self.assertEqual(
                    [],
                    ame.path_blockers([path]),
                    f"{path} is ordinary work — an over-broad pattern blocks every PR",
                )

    def test_nested_paths_match(self):
        """`a/**` must reach arbitrary depth, not only one level.

        fnmatch has no `**`, so this is hand-expanded in path_blockers. A one-
        level-only expansion is the exact bug that would leave
        design-tokens/themes/*.json auto-mergeable.
        """
        self.assertTrue(ame.path_blockers(["design-tokens/themes/nested/theme.json"]))
        self.assertTrue(ame.path_blockers([".claude/references/chromatic.md"]))
        self.assertTrue(ame.path_blockers([".github/workflows/nested/deep.yml"]))

    def test_root_level_doublestar_matches(self):
        """`**/CLAUDE*.md` must also match a bare `CLAUDE.md` at the root."""
        self.assertTrue(ame.path_blockers(["CLAUDE.md"]))
        self.assertTrue(ame.path_blockers(["docs-site/CLAUDE.md"]))

    def test_one_excluded_file_blocks_the_whole_pr(self):
        mixed = ["scripts/canonical-check.mjs", "tokens/animations.css"]
        self.assertEqual(1, len(ame.path_blockers(mixed)))

    def test_blocker_names_the_rule(self):
        """A blocked PR must say WHICH rule blocked it."""
        (hit,) = ame.path_blockers(["tokens/animations.css"])
        self.assertIn("design tokens", hit)


class TestPolicyDrift(unittest.TestCase):
    """The prose and the table must not drift apart.

    The fleet prose lives in brik-llm's session-contract.md § Auto-merge policy,
    which this repo's checkout cannot read — so the drift assertion here is
    against the subjects this repo's table must cover, and the pointer test runs
    on the brik-llm side (its suite asserts the canon names the script).
    """

    def test_every_bullet_has_a_pattern(self):
        """Each hard-exclusion subject of this repo's policy is represented."""
        reasons = " ".join(why for _, why in ame.EXCLUDED_PATHS).lower()
        for subject in ("tokens", "canon", "workflow", "hooks", "publish", "environment", "key material"):
            with self.subTest(subject=subject):
                self.assertIn(subject, reasons)

    def test_allowed_sizes_match_the_canon(self):
        self.assertEqual({"size:xs", "size:s"}, ame.ALLOWED_SIZES)

    def test_allowed_types_match_the_canon(self):
        self.assertEqual({"Task", "Bug"}, ame.ALLOWED_TYPES)


class TestQaFreshness(unittest.TestCase):
    """A qa review is evidence about the code it read, and nothing else."""

    HEAD = "2026-08-08T12:00:00Z"

    def _pass(self, at):
        return {"createdAt": at, "body": f"looks good\n{ame.QA_PASS_MARKER}"}

    def _findings(self, at):
        return {"createdAt": at, "body": f"two issues\n{ame.QA_FINDINGS_MARKER}"}

    def test_fresh_pass_satisfies(self):
        self.assertIsNone(ame._qa_verdict([self._pass("2026-08-08T12:30:00Z")], self.HEAD))

    def test_pass_at_exactly_head_time_satisfies(self):
        self.assertIsNone(ame._qa_verdict([self._pass(self.HEAD)], self.HEAD))

    def test_stale_pass_blocks(self):
        reason = ame._qa_verdict([self._pass("2026-08-08T11:00:00Z")], self.HEAD)
        self.assertIsNotNone(reason)
        self.assertIn("older than the head commit", reason)

    def test_no_review_blocks(self):
        reason = ame._qa_verdict([{"createdAt": self.HEAD, "body": "lgtm"}], self.HEAD)
        self.assertEqual("no qa review comment on the PR", reason)

    def test_findings_after_pass_blocks(self):
        comments = [self._pass("2026-08-08T12:10:00Z"), self._findings("2026-08-08T12:20:00Z")]
        reason = ame._qa_verdict(comments, self.HEAD)
        self.assertIn("unresolved findings", reason)

    def test_pass_after_findings_satisfies(self):
        comments = [self._findings("2026-08-08T12:10:00Z"), self._pass("2026-08-08T12:20:00Z")]
        self.assertIsNone(ame._qa_verdict(comments, self.HEAD))

    def test_out_of_order_input_is_sorted(self):
        """Comment order from the API is not guaranteed; the verdict must not
        depend on it."""
        comments = [self._findings("2026-08-08T12:20:00Z"), self._pass("2026-08-08T12:10:00Z")]
        self.assertIn("unresolved findings", ame._qa_verdict(comments, self.HEAD))


class TestWorkflowInvocation(unittest.TestCase):
    """The workflow must invoke the policy script in a way that actually runs.

    automerge.yml called it bare and died with exit 126 on the first PR after it
    landed (#2055): git commits a new file 100644, and 130 shebang-carrying files
    in this repo are 100644 too — so depending on the bit here means depending on
    the exception. The failure is invisible in review and only appears in
    production, where it fails every PR at once.
    """

    WORKFLOW = REPO_ROOT / ".github" / "workflows" / "automerge.yml"
    SCRIPT_REL = "scripts/audit/automerge-eligibility.py"

    def test_workflow_does_not_invoke_the_script_bare(self):
        """Every non-comment mention of the script must carry its interpreter.

        Checked per line rather than by parsing shell: the path appears inside
        a `$(...)` substitution, so anchoring on the start of the line missed
        the very invocation that broke — verified by reverting the fix.
        """
        for lineno, line in enumerate(self.WORKFLOW.read_text().splitlines(), 1):
            stripped = line.strip()
            if self.SCRIPT_REL not in stripped or stripped.startswith("#"):
                continue
            self.assertIn(
                f"python3 {self.SCRIPT_REL}",
                stripped,
                f"{self.WORKFLOW.name}:{lineno} invokes {self.SCRIPT_REL} without "
                "an interpreter — a 100644 file exits 126",
            )

    def test_workflow_actually_references_the_script(self):
        """Guards the test above from passing because the call was renamed away."""
        self.assertIn(
            f"python3 {self.SCRIPT_REL}",
            self.WORKFLOW.read_text(),
            "automerge.yml must still evaluate the policy",
        )

    def test_evaluation_failure_does_not_redden_the_check(self):
        """`set -e` in the evaluate step would fail the job on any script error.

        arm-automerge is advisory and not a required context, so a red X there
        blocks nothing — it only teaches everyone to ignore a check that fails on
        every PR. #2055 spent two minutes being exactly that.
        """
        text = self.WORKFLOW.read_text()
        self.assertNotIn(
            "set -euo pipefail",
            text,
            "the evaluate step must not `set -e` — an unevaluable policy is "
            "'not eligible', not a failed check",
        )
        self.assertIn(
            "treating as not eligible",
            text,
            "a failed evaluation must fall back to a not-eligible verdict",
        )

    def test_concurrency_queues_rather_than_cancels(self):
        """The group must queue its runs, not cancel them (#2278).

        Same concern as the test above, reached by a different route: a cancelled
        run reads as `fail` to `gh pr checks`, so the advisory job reddens every
        affected PR. 41 of 100 runs were cancelled — the LAST run on a PR
        included, leaving nothing to arm or disarm.

        Asserting the ABSENCE of `cancel-in-progress` is not enough on its own,
        which is why both halves are checked. Per the workflow-syntax reference
        `queue` defaults to `single` — "any existing `pending` job or workflow
        run in the same group is canceled and replaced" — so a file with neither
        key still cancels. `queue: max` is the documented opposite, and the two
        keys together are a workflow validation error.

        Text assertions, not a YAML parse: this suite runs under a bare
        `python3 -m unittest` with no PyYAML on the runner, and every sibling
        test in this class reads the workflow the same way.
        """
        text = self.WORKFLOW.read_text()
        self.assertIn(
            "queue: max",
            text,
            "automerge.yml must set `queue: max` — the default `queue: single` "
            "cancels the pending run, which is what reddened 41 of 100 runs",
        )
        for lineno, line in enumerate(text.splitlines(), 1):
            stripped = line.strip()
            if stripped.startswith("#"):
                continue
            self.assertNotIn(
                "cancel-in-progress",
                stripped,
                f"{self.WORKFLOW.name}:{lineno} sets cancel-in-progress — it "
                "cancels runs this workflow needs to finish, and combining it "
                "with `queue: max` is a workflow validation error",
            )

    def test_script_is_executable(self):
        """Belt and braces: the docstring advertises direct invocation."""
        self.assertTrue(
            (REPO_ROOT / self.SCRIPT_REL).stat().st_mode & 0o111,
            f"{self.SCRIPT_REL} is documented as directly invokable",
        )


class TestGhScalar(unittest.TestCase):
    """Regression: `gh api --jq '.type.name'` prints `Task`, not `"Task"`.

    Reading that through json.loads raised JSONDecodeError against a real PR
    (brikdesigns/brik-llm#2053, 2026-08-08) — the Issue Type check crashed the
    script instead of evaluating. Unquoted scalars are not JSON documents.
    """

    def test_bare_scalar_is_not_parsed_as_json(self):
        original = ame._gh
        try:
            ame._gh = lambda args: "Task\n"
            self.assertEqual("Task", ame._gh_scalar(["api", "whatever"]))
        finally:
            ame._gh = original

    def test_empty_scalar_reads_as_empty_string(self):
        """An unset Issue Type must read as 'unset', not blow up."""
        original = ame._gh
        try:
            ame._gh = lambda args: "\n"
            self.assertEqual("", ame._gh_scalar(["api", "whatever"]))
            self.assertNotIn("", ame.ALLOWED_TYPES)
        finally:
            ame._gh = original


class TestDisarmStepTolerance(unittest.TestCase):
    """The disarm step must survive a `gh` that fails (brik-llm#2284).

    `gh pr view --json autoMergeRequest` is a GraphQL call. GitHub's GraphQL
    endpoint returned 503 repeatedly across 2026-08-17, and the step's unguarded
    command substitution let the runner's `bash -e` abort on it — reddening
    arm-automerge on PR #2282, which was correctly not eligible. Re-running the
    same commit with no other change came back green, so the red tracked
    endpoint availability, not the PR.

    Asserted by EXECUTING the step's own `run:` block, not by matching text on
    it. A text assertion would pin one spelling of the guard and pass on a
    rewrite that reintroduced the abort; the exit status is the contract.

    The block is extracted from automerge.yml rather than restated here, so a
    hardening pass that edits the workflow and forgets this file fails instead of
    testing a copy that no longer ships. It is run under `bash -e` because that
    is the runner's default shell for `run:` (`bash -e {0}`) — and because `-e`
    is precisely what turned a failed read into a red check.
    """

    WORKFLOW = REPO_ROOT / ".github" / "workflows" / "automerge.yml"

    @staticmethod
    def _run_block(workflow_text, step_name):
        """Return the `run: |` body of the named step, dedented.

        Text-scanned rather than parsed with PyYAML: this suite runs under a bare
        `python3 -m unittest` and automerge-eligibility-contract.yml installs no
        pyyaml on the runner. Every sibling class here reads the workflow the
        same way.
        """
        lines = workflow_text.splitlines()
        try:
            start = next(
                i for i, ln in enumerate(lines)
                if ln.strip() == f"- name: {step_name}"
            )
        except StopIteration:  # pragma: no cover - guarded by the test below
            raise AssertionError(f"no `- name: {step_name}` step in automerge.yml")
        run_at = next(
            (i for i in range(start, len(lines)) if lines[i].strip() == "run: |"),
            None,
        )
        if run_at is None:
            raise AssertionError(f"the {step_name!r} step has no `run: |` block")
        indent = len(lines[run_at]) - len(lines[run_at].lstrip()) + 2
        body = []
        for line in lines[run_at + 1:]:
            if line.strip() and not line.startswith(" " * indent):
                break
            body.append(line[indent:] if line.strip() else "")
        return "\n".join(body)

    def _exec_disarm(self, gh_exit, gh_stdout="", gh_stderr=""):
        """Run the real disarm block with `gh` stubbed. Returns CompletedProcess."""
        block = self._run_block(self.WORKFLOW.read_text(), "Disarm auto-merge")
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            stub_dir = tmp / "bin"
            stub_dir.mkdir()
            stub = stub_dir / "gh"
            stub.write_text(
                "#!/usr/bin/env bash\n"
                f"printf '%s' {shlex.quote(gh_stdout)}\n"
                f"printf '%s' {shlex.quote(gh_stderr)} >&2\n"
                # Only the FIRST call (`pr view`) is made to fail, so the
                # not-armed and disarm-succeeds paths stay distinguishable.
                f'if [ "$2" = "view" ]; then exit {gh_exit}; fi\n'
                "exit 0\n",
                encoding="utf-8",
            )
            stub.chmod(0o755)
            script = tmp / "disarm.sh"
            script.write_text(block, encoding="utf-8")
            env = {
                "PATH": f"{stub_dir}:{os.environ.get('PATH', '')}",
                "PR": "2282",
                "GITHUB_REPOSITORY": "brikdesigns/brik-bds",
                "GH_TOKEN": "stub",
                "HOME": str(tmp),
            }
            return subprocess.run(
                ["bash", "-e", str(script)],
                env=env, capture_output=True, text=True, timeout=30,
            )

    def test_failed_gh_read_leaves_the_step_green(self):
        """The regression itself: a 503 from GraphQL must not fail the step."""
        result = self._exec_disarm(gh_exit=1, gh_stderr="GraphQL: 503\n")
        self.assertEqual(
            0, result.returncode,
            "a failed `gh pr view` reddened the disarm step — the guard is gone.\n"
            f"stdout: {result.stdout!r}\nstderr: {result.stderr!r}",
        )

    def test_failed_gh_read_says_why_it_skipped(self):
        """Silently exiting 0 is indistinguishable from a PR that was not armed."""
        result = self._exec_disarm(gh_exit=1, gh_stderr="GraphQL: 503\n")
        self.assertIn(
            "skipping the disarm", (result.stdout + result.stderr).lower(),
            "a skipped disarm must say so — otherwise the job log reads identical "
            "to a PR that was never armed",
        )

    def test_armed_pr_still_disarms_when_the_api_is_reachable(self):
        """Tolerating a failed read must not become 'never disarm'.

        The regression in the other direction: if the fix made the step skip
        unconditionally, "eligible at open" would be permanent again — the exact
        hole the step exists to close.
        """
        result = self._exec_disarm(gh_exit=0, gh_stdout="true\n")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn(
            "disarming auto-merge", result.stdout,
            "a reachable API reporting an armed PR must still disarm it",
        )

    def test_unarmed_pr_is_left_alone(self):
        """The common case: not eligible, not armed, nothing to do."""
        result = self._exec_disarm(gh_exit=0, gh_stdout="false\n")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertNotIn("disarming auto-merge", result.stdout)

    def test_empty_stdout_is_not_read_as_armed(self):
        """`gh` can exit 0 with nothing on stdout; that is not 'armed'."""
        result = self._exec_disarm(gh_exit=0, gh_stdout="")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertNotIn("disarming auto-merge", result.stdout)

    def test_extractor_finds_a_non_trivial_block(self):
        """Guards every test above from passing on an empty extraction.

        A `_run_block` that silently returned "" would run an empty script,
        exit 0, and make the tolerance tests vacuous.
        """
        block = self._run_block(self.WORKFLOW.read_text(), "Disarm auto-merge")
        self.assertIn("gh pr view", block)
        self.assertIn("autoMergeRequest", block)


if __name__ == "__main__":
    unittest.main(verbosity=2)
