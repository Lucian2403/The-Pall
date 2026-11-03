# Stage 6 Combat Control UI — Owner icon integration

**Date:** 2026-11-03
**Status:** Owner-requested interim UI/UX improvement; not final game UI.
**Scope:** Millhand Stage 6 / Flint combat only.

## Owner-provided action icons

The six original transparent PNGs were optimized to 176 × 176 WebP,
preserving their pictograms, silhouette and transparent backgrounds.
Each stays a separate asset in
`platform/apps/web/static/ui-kit/combat-actions/`:

| Source file | UI asset | Mechanic |
|---|---|---|
| `Attack01_Icon.png` | `strike.webp` | Strike / engine action `attack` |
| `Guard01_Icon.png` | `guard.webp` | Guard / `guard` |
| `Reposition01_Icon.png` | `reposition.webp` | Reposition / `move` |
| `Recove01_Icon.png` | `recover.webp` | Recover / `recover` |
| `PressAdvantage01_Icon.png` | `press-advantage.webp` | Press Advantage / `technique` |
| `ConfirmAction01_Icon.png` | `confirm-action.webp` | Confirm the selected action |

The icon occupies the primary visual area of each action; a subdued but
legible text label remains underneath. Icons are marked decorative for
assistive technology because each button has a full accessible name.
Selected and unavailable actions remain visually distinct. Keyboard
focus is visible. No icon represents an additional playable mechanic.

## Consolidated presentation

- Retain Flint, the cart and industrial passage as the environmental anchor.
- Reduce the encounter parchment to the current round, intent and distance.
- Place the two combatants in one compact status board with prominent HP bars.
- Keep the action tiles, contextual choice and confirm control together.
- Keep the original Battle Chronicle intact, displaying the latest six lines
  by default; a toggle reveals the complete saved history.
- Adapt the same hierarchy for narrow viewports without hiding any action,
  stat or journal entry.

The Stage 6 encounter is still rendered from the existing
`CombatSnapshot`; action submission continues through `perform()` and
the authenticated server-side v0.5.1 engine. **No combat rule, action
cost, AI choice, damage, save data, or monetary reward is changed.**

This pass does not resolve any independent `Internal Server Error`
returned by the combat API. Such failures require the server error
trace and must not be disguised by UI changes.
