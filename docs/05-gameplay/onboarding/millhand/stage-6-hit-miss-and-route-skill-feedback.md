# Stage 6 floating combat feedback and Stage 3 route-grant display

**Date:** 2026-11-04
**Scope:** Presentation-only; approved combat v0.5.1 and character persistence remain unchanged.

## Combat

A successful, authenticated Stage 6 turn can produce one brief visual
notification per impacted character:

- A `damage` event with positive, finite `damage` and a valid
  `target` floats the **exact damage number** in muted red over the
  corresponding character. No client-side attack or damage roll is performed.
- A `miss` event floats **Miss** over the target inferred from the
  engine's attacker (`actor`). The floating text never assigns a miss to the
  person who attacked.
- The animation lasts 1.1 seconds, fades away and is never persisted.
  It cannot be replayed simply by loading an old Chronicle or refreshing.
  A rejected, duplicate or unknown-history turn cannot produce this effect.
- The Chronicle retains original event text and full history. Actual
  damage events receive a reddish visual accent and misses a pale-gold
  accent. The event text remains the accessibility source of truth.
- When both combatants act in one saved turn, up to one latest impact
  notification per target is shown. Existing SFX and animations remain.

The illustrated Flint and all previously approved UI panels stay in place.
For a player character without a separate illustrated figure, feedback is
anchored directly above the player's status card.

## Skill display

The Stage 3 `millhand-missing-stamp` API already awards the **once-only**
second-job `+1` as `major_skill_bonuses[Industry|Commerce|Scholarship]=1`
on route commitment. The second-job Stage 4 API correctly does not pay the
bonus a second time.

The character Skills page currently displays an unawarded skill as
a **provisional** 1/100 baseline, creating a confusing visual equality:
unawarded 1/100 and awarded grant 1/100 look identical.

For the three authorized Millhand second-job majors **only**, the UI now
displays that saved +1 over its provisional baseline: **2 / 100**.
The original **Craftsmanship 3 / 100** stays unchanged; all other
unawarded skills still show 1 / 100. This calculation is a short-lived
presentation adapter until a complete persisted Major Skill ledger exists.
It does not run any SQL UPDATE, award extra XP or grant an additional skill.

The existing character page fetch already retrieves the saved
`majorSkillBonuses` on mount with `cache:'no-store'`; old characters
receive this display correction without any migration or replay.

## Follow-up: floating text on consecutive rounds (2026-11-04)

The first implementation reconstructed the latest turn by comparing two
`events` arrays. Those arrays are the Battle Chronicle's rolling
120-event window. A failed overlap match meant valid later damage/miss
events were discarded, explaining missing floating feedback after the
first display.

The combat engine already places the exact just-resolved events in
`state.events` before advancing `revision` and `round`. The public
Stage 6 snapshot now includes `turnEvents:state.events` **in addition
to** the unchanged chronological `events` list. Neither engine output
nor chronological record is modified.

The browser processes `turnEvents` exclusively after a successful
turn response where `next.revision === previous.revision + 1`, checking
that each event belongs to the resolved round. It uses the same
authoritative per-turn events for combat SFX. Loading a saved fight does
not trigger a floating animation. Identical revisions, rejected turns,
and stale history do not replay feedback.

The Stage 6 verifier simulates twenty consecutive turns with alternating
damage/miss targets while rotating the entire historical Chronicle,
checking that every eligible turn receives a fresh animation key.
