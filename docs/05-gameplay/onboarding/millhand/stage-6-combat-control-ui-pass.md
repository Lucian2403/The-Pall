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


## Stage 6 battlefield layout refinement — 2026-11-03

Owner reference: widescreen combat screenshot with the alley as the dominant
visual, Flint on the left, the round/telegraph parchment in the upper right,
and all five supplied action icons laid out horizontally along the lower
edge of the scene. The sixth confirmation icon sits at the right end of the
same bar. A slim summary beneath the bar shows the chosen action's actual
server-provided costs and configurable target/position/recovery mode.

Directly below the alley, the status area follows a 3-column rhythm:
**You**, **Flint**, and **Battle Chronicle**. Health bars and
Stamina/Fatigue/Momentum lead. Composure, wounds, bleeding and Health ceiling
remain accessible through expanded condition details. The Chronicle defaults
to the latest three saved entries; its full history is retained unchanged.

On compact viewports, the action bar moves below the environment rather than
covering Flint or the telegraph, the confirmation control becomes a full-width
row, and the stat cards stack. The controls remain keyboard-operable with
text labels and visible focus; this is still an interim UI/UX refinement.

No combat state, battle math, costs, AI, database schema or encounter scripting
changes in this layout-only pass.
