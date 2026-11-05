/**
 * WCAG 2.1 AA gate for the dev bar chrome (brik-bds#1802).
 *
 * `devbar.js` inlines raw hexes (it ships to Supabase Storage and runs in
 * self-contained client mockups where the BDS token sheet is absent), so
 * tokens-gate.yml's contrast job cannot see it. This test renders the bar in each
 * state (idle, badged, active, hovered), runs axe against the resolved cascade
 * (a forced hover is a real measurement: axe reads computed style), and reads
 * BOTH axe buckets: a short text node such as the one-digit badge is filed under
 * `incomplete` ("content too short") with its ratio attached, so `violations`
 * alone reports it clean.
 *
 * Runs under the `components-browser` vitest project (see vitest.config.ts).
 */
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import axe from "axe-core";
// Raw source so the IIFE runs as a real inline <script>, like the sibling gates.
import widgetSource from "./devbar.js?raw";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/**
 * White on the Poppy-500 brand fill (or the inverse), 3.78:1. ADR-015:114-118
 * (operator said 2026-10-22, "Do not reopen") keeps the vibrant fill + white label
 * at every size and records the ratio as owner-accepted debt;
 * scripts/lint-brand-fill-text.js enforces the white. Darkening the bar to poppy-700
 * is the repaint the ADR forbids, so these are listed by selector rather than fixed.
 * Everything else must clear 4.5:1.
 */
const LOGO = ".bdb-logo > span:nth-child(2)|#ffffff|#e35335|3.78";
const ACTIVE_BADGE =
  'button[data-slot-id="inspect"] > .bdb-slot__badge|#e35335|#ffffff|3.78';
const ACCEPTED_BRAND_FILL = new Set<string>([LOGO, ACTIVE_BADGE]);

// The widget talks to these globals; typed loosely because BrikDevBar.tsx augments
// `Window` with its own narrower shapes.
const win = window as unknown as Record<string, unknown> & {
  BrikDevBar?: {
    register: (def: Record<string, unknown>) => void;
    setActive: (id: string, active: boolean) => void;
  };
};

const ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>';

/** Load the dev bar and register two slots: one badged, one badged + (optionally) active. */
function mountBar(opts: { active?: boolean } = {}): void {
  const script = document.createElement("script");
  script.textContent = widgetSource;
  document.body.appendChild(script);
  const bar = win.BrikDevBar;
  if (!bar)
    throw new Error("devbar did not initialise — the audit would be vacuous");
  bar.register({
    id: "events",
    label: "Events",
    icon: ICON,
    order: 10,
    badge: 3,
  });
  bar.register({
    id: "inspect",
    label: "Inspect",
    icon: ICON,
    order: 20,
    badge: 5,
  });
  if (opts.active) bar.setActive("inspect", true);
}

const settle = () => new Promise((r) => setTimeout(r, 200));

async function audit(): Promise<{ failures: string[]; accepted: string[] }> {
  const results = await axe.run(document.body, {
    runOnly: { type: "tag", values: AXE_TAGS },
  });
  const failures: string[] = results.violations
    .filter((v) => v.id !== "color-contrast")
    .flatMap((v) =>
      v.nodes.map(
        (n) =>
          `${v.id} [${v.impact}] ${n.target.join(" ")} — ${n.failureSummary ?? ""}`,
      ),
    );
  const accepted: string[] = [];
  const contrastNodes = [
    ...results.violations
      .filter((v) => v.id === "color-contrast")
      .flatMap((v) => v.nodes),
    ...results.incomplete
      .filter((v) => v.id === "color-contrast")
      .flatMap((v) => v.nodes),
  ];
  for (const n of contrastNodes) {
    const d = (n.any[0]?.data ?? {}) as {
      fgColor?: string;
      bgColor?: string;
      contrastRatio?: number;
    };
    if (typeof d.contrastRatio !== "number" || d.contrastRatio >= 4.5) continue;
    const key = `${n.target.join(" ")}|${d.fgColor}|${d.bgColor}|${d.contrastRatio}`;
    (ACCEPTED_BRAND_FILL.has(key) ? accepted : failures).push(key);
  }
  return { failures, accepted };
}

afterEach(() => {
  document.body.innerHTML = "";
  document.querySelectorAll("style").forEach((s) => s.remove());
  delete win.BrikDevBar;
});

describe("dev bar — WCAG 2.1 AA (#1802)", () => {
  // `accepted` is asserted exactly, so an allowlist entry goes stale (and the test
  // fails) the moment the pair is repainted, instead of silently excusing it.
  it("idle bar with badged slots", async () => {
    mountBar();
    await settle();
    expect(
      document.querySelectorAll(".bdb-slot__badge").length,
      "badges did not render — the audit would be vacuous",
    ).toBe(2);
    const { failures, accepted } = await audit();
    expect(failures).toEqual([]);
    expect(accepted).toEqual([LOGO]);
  });

  it("active slot with badge", async () => {
    mountBar({ active: true });
    await settle();
    expect(
      document.querySelectorAll('.bdb-slot[data-active="true"]').length,
      "no slot became active — the audit would be vacuous",
    ).toBe(1);
    const { failures, accepted } = await audit();
    expect(failures).toEqual([]);
    expect(accepted).toEqual([LOGO, ACTIVE_BADGE]);
  });

  it.each([false, true])("hovered slot (active=%s)", async (active) => {
    mountBar({ active });
    await settle();
    const slot = document.querySelector<HTMLElement>(
      '.bdb-slot[data-slot-id="inspect"]',
    );
    expect(slot, "slot missing").not.toBeNull();
    await userEvent.hover(slot as HTMLElement);
    await settle();
    expect(
      getComputedStyle(slot as HTMLElement).backgroundColor,
      "hover did not apply — the audit would be vacuous",
    ).not.toBe("rgba(0, 0, 0, 0)");
    const { failures, accepted } = await audit();
    expect(failures).toEqual([]);
    expect(accepted).toEqual(active ? [LOGO, ACTIVE_BADGE] : [LOGO]);
  });
});
