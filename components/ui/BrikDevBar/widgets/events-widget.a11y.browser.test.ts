/**
 * WCAG 2.1 AA gate for the events widget chrome (brik-bds#1802).
 *
 * `events-widget.js` inlines raw hexes (it ships to Supabase Storage and runs in
 * self-contained client mockups where the BDS token sheet is absent), so
 * tokens-gate.yml's contrast job cannot see it. It had never been measured; this
 * test renders the panel in each state, runs axe against the resolved cascade,
 * and hovers the action buttons so the `:hover` fill is audited too (axe reads
 * computed style, so a forced hover is a real measurement).
 *
 * Runs under the `components-browser` vitest project (see vitest.config.ts).
 */
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import axe from "axe-core";
// Raw source so the IIFE runs as a real inline <script>, like the sibling gates.
import widgetSource from "./events-widget.js?raw";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

interface FakeEvent {
  name: string;
  timestamp: string;
  surface: string;
  distinct_id: string;
  user_id?: string;
  properties?: Record<string, unknown>;
}

// The widget talks to these globals; typed loosely because BrikDevBar.tsx and
// EventsWidget.stories.tsx each augment `Window` with narrower, unrelated shapes.
const win = window as unknown as Record<string, unknown> & {
  BrikDevBarQueue?: Array<{ id: string; onActivate: () => void }>;
};

/** Boot the widget and open its panel the way the DevBar would. */
function mountAndOpen(events: FakeEvent[] | null): void {
  win.__brikEventsMemory =
    events === null
      ? undefined
      : { getEvents: () => events, subscribe: () => () => {}, clear: () => {} };
  const script = document.createElement("script");
  script.textContent = widgetSource;
  document.body.appendChild(script);
  const slot = win.BrikDevBarQueue?.find((d) => d.id === "events");
  if (!slot)
    throw new Error(
      "widget did not register its slot — the audit would be vacuous",
    );
  slot.onActivate();
}

const settle = () => new Promise((r) => setTimeout(r, 200));

/**
 * White label on the Poppy-500 brand fill, 3.78:1. ADR-015 (:114-118, operator
 * said 2026-10-22, "Do not reopen") keeps the vibrant fill + white label at every
 * size and records the ratio as owner-accepted debt; scripts/lint-brand-fill-text.js
 * enforces the white. Darkening these fills to poppy-700 is the repaint the ADR
 * forbids, so they are listed here by selector rather than fixed. Everything else
 * in the panel must clear 4.5:1.
 */
const ACCEPTED_BRAND_FILL = new Set([
  ".bev-count|#ffffff|#e35335|3.78",
  'button[data-action="copy"]|#ffffff|#e35335|3.78',
  'button[data-action="clear"]|#ffffff|#e35335|3.78',
]);

/**
 * Collect colour-contrast failures from BOTH axe buckets. axe files a short text
 * node (the `.bev-count` digit) under `incomplete` ("content is too short to
 * determine if it is actual text") with the measured ratio attached, so reading
 * `violations` alone reports that 3.78:1 pill as clean.
 */
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
  delete win.__brikEventsWidgetInitialized;
  delete win.__brikEventsMemory;
  delete win.BrikDevBarQueue;
});

const SAMPLE: FakeEvent[] = [
  {
    name: "cta_clicked",
    timestamp: "2026-11-05T12:00:00.000Z",
    surface: "portal",
    distinct_id: "anon-1234567890abcdef",
    user_id: "user-abcdef123456",
    properties: { plan: "pro" },
  },
  {
    name: "page_viewed",
    timestamp: "2026-11-05T12:00:05.000Z",
    surface: "portal",
    distinct_id: "anon-1234567890abcdef",
  },
];

describe("events widget — WCAG 2.1 AA (#1802)", () => {
  it("panel with events has no violations", async () => {
    mountAndOpen(SAMPLE);
    await settle();
    expect(
      document.querySelectorAll(".bev-row").length,
      "event rows did not render — the audit would be vacuous",
    ).toBe(2);
    expect(document.querySelectorAll(".bev-count").length).toBe(1);
    const { failures, accepted } = await audit();
    expect(failures).toEqual([]);
    // The allowlist must not go stale: if the pill is ever repainted this fails
    // and the entry is deleted, instead of silently excusing a pair that is gone.
    expect(accepted).toEqual([".bev-count|#ffffff|#e35335|3.78"]);
  });

  it("empty and SDK-missing states have no violations", async () => {
    mountAndOpen(null);
    await settle();
    expect(
      document.querySelectorAll(".bev-empty code").length,
      "placeholder did not render — the audit would be vacuous",
    ).toBeGreaterThan(0);
    expect((await audit()).failures).toEqual([]);
  });

  it.each(["copy", "clear"])(
    "hovered %s action has no violations",
    async (action) => {
      mountAndOpen(SAMPLE);
      await settle();
      const btn = document.querySelector<HTMLElement>(
        `[data-action="${action}"]`,
      );
      expect(btn, `${action} button missing`).not.toBeNull();
      await userEvent.hover(btn as HTMLElement);
      await settle();
      expect(
        getComputedStyle(btn as HTMLElement).backgroundColor,
        "hover did not apply — the audit would be vacuous",
      ).not.toBe("rgba(0, 0, 0, 0)");
      const { failures, accepted } = await audit();
      expect(failures).toEqual([]);
      expect(accepted).toContain(
        `button[data-action="${action}"]|#ffffff|#e35335|3.78`,
      );
    },
  );
});
