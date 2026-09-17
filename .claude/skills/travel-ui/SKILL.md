---
name: travel-ui
description: Build or refactor this repository's travel screens with the shared design contract and reusable src/travel-ui components, without destination-specific UI drift.
---

# Travel UI

For UI-only changes, follow the canonical skill at `.agents/skills/travel-ui/SKILL.md`. Read `README.md`, `AGENTS.md`, `src/travel-ui/`, `src/Prototype.tsx`, `src/prototype.css`, and the linked `design-system.md` and `component-contract.md` before editing. Keep `TravelHeader`, `TravelBottomNav`, `TravelCategoryLegend`, `TravelPlaceCard`, `TravelGuideSheet`, and `TravelDataTransferSheet` as the shared building blocks; keep destination differences in `trip.json` or thin data adapters. Preserve the Pretendard-first visual system, category colors/icons, header-owned DAY controls, compact sticky map, scrollable detail sheets, responsive no-overflow behavior, and marker/card interaction split. Run the repository validation commands and update the design docs and README when the contract changes.
