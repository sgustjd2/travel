---
name: travel-ui
description: Build or refactor this repository's travel screens with the shared design contract and reusable src/travel-ui components, without destination-specific UI drift.
---

# Travel UI

Use this skill for UI-only work: visual fixes, responsive behavior, shared component extraction, layout refactors, and regression repair. For new destinations, place research, trip data, travel-record behavior, or GitHub Pages deployment, use `travel-map-builder` and load this skill only for the UI portion.

## Source of truth

Read these files before changing app-owned UI:

- `README.md` and the nearest `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md`
- `src/travel-ui/components.tsx`, `src/travel-ui/types.ts`, `src/travel-ui/category.ts`, and `src/travel-ui/index.ts`
- `src/Prototype.tsx` and `src/prototype.css`
- [the visual contract](../travel-map-builder/references/design-system.md)
- [the component contract](../travel-map-builder/references/component-contract.md)

The Kyoto/Kobe screen is the visual baseline. `src/travel-ui/` owns reusable UI, category tokens, and shared types; `Prototype.tsx` owns state, data adaptation, map behavior, and screen composition; `prototype.css` owns shared layout and responsive styling.

## Required composition

Use the shared components as the default public UI API:

- `TravelHeader`: title, period, and compact `DAY · date` controls inside `.header-copy .header-meta`; never put day controls over the map.
- `TravelBottomNav`: the fixed four-item schedule/map/reservations/saved navigation.
- `TravelCategoryLegend`: the shared category colors, labels, and icons.
- `TravelPlaceCard`: category-colored number/icon/accent, reserved right-side controls and preview, closure state, favorite, and visit check.
- `TravelGuideSheet`: grouped `must`/`warning`/`tip` preparation checklist with source links and local completion state.
- `TravelDataTransferSheet`: scrollable travel-record JSON export/import sheet.

Use `src/travel-ui/index.ts` for new imports when practical. A destination may add a thin data adapter for preview text or images, but may not copy the full header, card, navigation, or sheet JSX. Do not add destination-specific dashboard markup, duplicate CSS, or a second design system.

## Boundary with travel records

The travel app already exposes place add/edit/delete, visit checks, favorites, notes, and JSON export/import through the shared screen. Preserve those entry points while changing layout. Do not move record state into a destination folder or redesign the transfer flow as a UI-only shortcut; `Prototype.tsx` remains the state/orchestration owner and `TravelDataTransferSheet` remains the shared surface.

For documentation changes, keep the user-facing route in `README.md` short and link to this skill, the canonical `travel-map-builder` skill, and the four reference contracts instead of copying their full instructions. The README must keep actual GitHub Pages demo links clickable and explain that JSON is required to share LocalStorage records.

## Visual and interaction invariants

- Keep Pretendard-first typography, pale background, white bordered surfaces, clear section boundaries, and the shared type scale.
- Keep category colors and icons consistent for cards, numbers, map markers, and the legend.
- Keep the quick-menu `준비·꿀팁` entry and render `Trip.guideItems` through `TravelGuideSheet`; do not place preparation content over the map or duplicate it in destination CSS.
- Keep the compact sticky route preview map below the header. Collapse it to its summary bar during itinerary scrolling while reserving its layout slot; cards must not be covered and the scroll position must not bounce.
- A map marker focuses and scrolls to its card without opening a detail sheet. A card body opens the phone-scoped `BottomSheet` detail view.
- Detail sheets own their scroll container and must reach both the first and last content, including menus, photos, alternatives, and notes.
- Reserve right-side room for thumbnails and controls. Test long titles, closure labels, Korean/Japanese menu lines, and images at 360, 393, and 430 CSS pixels plus the wide simulated-phone viewport.
- Failed remote images must show a local/map/category fallback, never a broken-image icon. Resolve local assets through `import.meta.env.BASE_URL`.
- The guide sheet must scroll to its final item at 360px, support check/uncheck for `checkable` items, and preserve `completedGuideIds` through LocalStorage and JSON transfer.

## Workflow and verification

1. Inspect the current component tree and CSS before editing.
2. Change the shared component/API when the anatomy is shared; keep `Prototype.tsx` as orchestration only.
3. Re-check the Kyoto/Kobe screen and the real narrow widths after the change.
4. Run `npm run validate:trip`, `npm run check:runtime`, `npm run build`, `npm run test:sites`, and `git diff --check`.
5. Refresh `public/assets/readme/` screenshots with `scripts/capture-readme-screenshots.mjs` after a substantial visual change.

Do not commit, push, or deploy for a UI-only task unless the user explicitly requests publication. When a UI contract changes, update `design-system.md`, `component-contract.md`, and the README in the same change.
