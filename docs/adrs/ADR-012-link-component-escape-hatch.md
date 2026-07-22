# ADR-012 — `linkComponent` escape hatch for navigation components

**Status:** Accepted (2026-06-16)
**Date:** 2026-06-16
**Supersedes:** —
**Superseded by:** —
**Related:** [#525](https://github.com/brikdesigns/brik-bds/issues/525) (umbrella — link escape-hatch contract), [#379](https://github.com/brikdesigns/brik-bds/issues/379) (SidebarNavigation Next.js interop — first adopter), [#462](https://github.com/brikdesigns/brik-bds/issues/462) (Footer migration), [Framework Guides](../../docs-site/content/docs/getting-started/framework-guides.mdx)
**Owner:** Nick Stanerson

## Context

BDS components that own their anchor rendering (`NavItem` and its containers `SidebarNavigation` / `SubNavigation`, plus `Footer`, `Breadcrumb`, `TabBar`, `TopNavigation`, `Menu`, `Pagination`) emit a bare `<a href>`. In a Next.js / Remix consumer this triggers a **full-page reload on every nav click** instead of client-side routing, and loses automatic prefetch. brik-client-portal is in production with this regression today (#379); brikdesigns.com hit it on the Footer migration (#462).

The fix is not per-component styling — it is one **API contract** every link-emitting component adopts: an injectable component to render in place of the default `<a>`. Deciding it once keeps the surface area consistent and lets the remaining components migrate one PR at a time without re-litigating the shape each time.

A consumer can only fix this when *it* composes the JSX (e.g. `SidebarNavigation`'s `logo` slot already works because the consumer passes the node). The nav items can't, because BDS owns their rendering — hence the escape hatch.

## Decision

Adopt a single optional prop, **`linkComponent`**, on every component that owns anchor rendering. The atom (`NavItem`) holds the contract; containers forward it.

```ts
import { type AnchorHTMLAttributes, type ComponentType } from 'react';

/**
 * Injectable link renderer for navigation components. Pass a router-aware
 * component (Next.js `Link`, Remix `Link`) for client-side routing; defaults
 * to a bare `<a>` when omitted.
 */
export type BdsLinkComponent = ComponentType<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
>;
```

Rules:

1. **Prop name is `linkComponent`** (not `as` / `LinkComponent` / a render-prop). It mirrors the established cross-library pattern (Mantine, Chakra) and reads as "what to render each link with." Note: the layout primitives' `as?: ElementType` (Grid/Stack/Cluster/Frame) is a *different* concept — polymorphic element swap on a single node — and is intentionally not reused here.
2. **Default is a bare `<a>`.** Omitting the prop is the current behavior verbatim — **zero breaking change**, no consumer touches anything until it opts in.
3. **The contract keys on `href`**, plus standard anchor passthrough (`className`, `onClick`, `aria-*`, `tabIndex`). Next.js `Link` and Remix `Link` both accept `href` and forward the rest to their inner `<a>`, so `<SidebarNavigation linkComponent={Link} />` type-checks with no wrapper. react-router's `to`-based `NavLink` is the one exception — consumers wrap it in a one-line `href`→`to` adapter. This is deliberate: all six Brik consumers are Next.js, so `href` is the right default and the type stays simple.
4. **Disabled or href-less items always render `<a>`**, never `linkComponent`. A router `Link` requires `href` and must not navigate when disabled, so the dispatch falls back: `const El = (href && !disabled && linkComponent) ? linkComponent : 'a'`.
5. **Containers forward, they don't re-declare semantics.** `SidebarNavigation` / `SubNavigation` take one `linkComponent` prop and pass it to every `NavItem`. The contract is defined once on the atom.

`TextLink` is **out of scope** — it already extends `AnchorHTMLAttributes` and exposes its anchor, so a consumer composes routing around it directly; it does not own hidden anchor rendering.

## Consequences

- **Non-breaking, opt-in.** Existing call sites are unchanged; the prop is additive with an `<a>` default.
- **Establishes the pattern for the umbrella.** #379 (NavItem + SidebarNavigation + SubNavigation) ships first. Footer, Breadcrumb, TabBar, TopNavigation, Menu, and Pagination each migrate in their own PR referencing this ADR — same prop name, same type, same dispatch rule.
- **Consumer migration is a swap, not a rewrite.** brik-client-portal drops its `aside nav a { cursor }` workaround and passes `linkComponent={Link}`. renew-pms can retire the routing-control reasons it rolls its own `AppSidebar`.
- **The `BdsLinkComponent` type is exported** from the package so consumers and future BDS components share one definition.

## Alternatives considered

| Option | Shape | Why rejected |
|---|---|---|
| **A — `linkComponent` prop** (chosen) | One component-valued prop per link-owning component | — |
| B — `as?: ElementType` per item | Each `SidebarNavItem` carries `as: Link` | Verbose at every call site; repeats the component on every item; conflates with the layout-primitive `as` element-swap concept |
| C — `renderNavItem` render-prop | Consumer renders each item | Moves rendering responsibility back to the consumer, defeating the point of a primitive; inconsistent across the surface area |
