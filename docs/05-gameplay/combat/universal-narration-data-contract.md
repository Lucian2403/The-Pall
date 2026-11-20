# Universal combat narration — structured event contract

Status: implemented as a presentation adapter in PR #60. **This document does not create new combat mechanics or AI.**

## Data flow

1. A combat resolver commits its action and calculates movement, hits, protection, wounds, abilities and effects. All combat numbers remain authoritative.
2. It emits events with the normal `round`, `kind`, `actor`, `target`, `damage`, `raw`, `guarded`, `condition` and any applicable factual `narration` metadata.
3. `narrateCommittedTurn` adds a saved `story: {version:2,line,detail,hidden?}` without changing an original event field. A source event's original `text` remains intact.
4. The API saves the complete events in the same transaction as the turn. The UI shows `story.line`, then `story.detail`. Older v1 stories and events with no story are displayed as recorded.
5. Two fighters currently use this adapter: Flint and Dogman. A future encounter including Owler can call the same adapter once its own combat resolver produces events.

### Factual event sample (a generated ability)

```json
{
  "round": 3,
  "kind": "damage",
  "actor": "enemy",
  "target": "player",
  "damage": 7,
  "raw": 7,
  "text": "Raw engine event retained for older clients.",
  "narration": {
    "actionId": "turn3-action2",
    "ability": {"id": "generated.881", "name": "Silt Latch", "category": "control"},
    "action": {
      "verb": {"base": "bind", "thirdPerson": "binds"},
      "instrument": {"kind": "body_part", "name": "vine", "phrase": "with its vine"},
      "hitPart": "ankle"
    },
    "effects": [
      {"kind": "status", "label": "Slowed", "applied": true, "target": "player", "durationRounds": 2},
      {"kind": "damage", "label": "Health", "applied": true, "target": "player", "amount": 7}
    ]
  }
}
```

This yields a plain description with the real name, real action and real ability, plus `−7 Health · Slowed (2 rounds)`. Damage appears **once**. A missed attack must use `kind:"miss"`; a planned effect must not have `applied:true` unless it occurred.

## Field meaning and safety

- `narration.action.verb`: optional base and third-person forms from the ability/attack definition, such as `push/pushes` or `wrap/wraps`. No verb list or generated ability names are built into the narrator. Unknown or incomplete forms get a neutral `hits` or `attacks but misses` fallback.
- `narration.action.instrument`: optional actual instrument. The `kind` is `weapon`, `body_part` or `other`. A body-part instrument is mentioned **only** when the resolver supplies a complete `phrase` (for example `with its tail`). A weapon label is displayed when it is provided by the committed action or the equipped prototype weapon's passive display metadata.
- `narration.action.hitPart` or `event.hitPart`: an actually hit body region. Aimed `zone` alone is **not** a confirmed body part. The narrator never assumes a creature has hands, arms, a head or a human shape.
- `narration.ability`: optional name and stable ID. A name never implies damage or effects. The resolver must record the ability as actually used.
- `narration.effects`: each resolved effect has `kind` and `applied`. Only `applied:true` is displayed as an outcome. Optional `label`, `amount`, `unit`, `durationRounds` and a clear, resolver-supplied `text` explain even unknown future effects. Text for failed or merely possible effects is not reported as a result.
- `narration.movement.kind`: resolved `side`, `back`, `close`, `cover`, `leave` or `other`. A place may be shown only if recorded. Unknown kinds get `moves`, not fabricated climbing, dodging or retreating.
- `narration.openingUsed:true`: a consumed Opening. A positive authoritative `openingDamageBonus` also proves one was used. Merely **having** an Opening does not mean it was used.
- `narration.outcome`: optionally records actual surrender, withdrawal, incapacitation, escape or stopping. Without it the narrator reports only the authoritative win/loss/escape, not an invented retreat or death.
- `event.target`: use the actual resolved target, including self-targeted abilities. The narrator reads this before assuming the other fighter in older two-person encounters. Damage to the player is shown as lost Health even when it is self-inflicted.
- When a custom effect has a label and a different numeric unit, show both (for example `Pushed back: 2 steps` rather than an unexplained `+2 steps`). Signed resource changes remain signed.
- `narration.actionId`: optional identifier for grouping the cost/resource events with the action that caused them. An ID mismatch prevents folding. Older prototype events can use their known within-turn event order when IDs are not present.

For attacks and effects not covered by this contract, preserve the original engine text. Do not silently interpret free-form descriptions as evidence for wounds, movement or creature abilities.

## Compatibility and boundaries

- New messages use story version **2**. Historical version **1** and unversioned messages are never regenerated, so old fights still read as originally saved.
- The entire original event stream is preserved in order, including hidden numerical notices. `hidden` affects only the Chronicle presentation, not history, sounds, feedback, mechanics or saved values.
- Narration has no randomness and never writes to a combat fighter. Variation depends on the saved ordered event history.
- All future enemies and generated abilities can supply the same fields, without an NPC-specific narrator file or a new hardcoded name.
- Current `combat-v0.5.1` fixtures can resolve Flint, Dogman, Silas and the injured boar; they **cannot generate or execute new abilities**. The generated-enemy test supplies a deterministic six-round stream of committed events to verify the narrator contract. A later procedural combat engine must be integrated separately to make that generated fight playable.
- Owler Stage VI combat is a separate gameplay task. The universal narrator will display its events when a real Owler encounter is implemented, without adding placeholder Owler stats or AI now.

## Verification

Run `npm run verify:combat-narration` and `npm run verify:stage-six` from `platform`. The existing PostgreSQL integration suite also checks versioned, receipt-backed narration and reload consistency.

## Persisted round Chronicle (version 3)

The API composes `narrateCommittedRounds()` **after** the combat engine and
the existing `narrateCommittedTurn()` adapter. It uses the new round's resolved
ordered events, not anticipated enemy intent. The last committed event in
each round receives `roundStory`:

```json
{
  "version": 3,
  "round": 4,
  "encounterId": "combat-123",
  "line": "You step aside, and Dogman misses you.",
  "detail": "+5 Momentum (You)",
  "eventRefs": [0, 1, 2, 3, 4],
  "tactical": ["Dodge successful (You)", "Opening gained (You)"],
  "actions": [
    {"actorId": "player", "kind": "move", "eventRef": 1},
    {"actorId": "enemy", "kind": "miss", "eventRef": 3}
  ]
}
```

This is a **format example**, not a scripted combat outcome. The action order
and all numbers are taken from the engine. Every index in `eventRefs` and
`actions[].eventRef` is relative to the containing saved round. `actionId`
and `targetId` are carried through when supplied by a future resolver.
The current duel maps the two actor IDs to `You` and the enemy's saved name;
additional IDs may supply `actorName` and `targetName`.

The server saves the round summary atomically alongside the original full
event array. It does **not** re-narrate earlier rounds on read or replay.
The browser reads version-3 summaries and shows the latest **three complete
rounds** by default, with a Full history control and a per-round Details
expander. Details include **all original source events**, even intent notices,
hidden resource notices, failed effects, and exact results. The compact
numeric line prioritises damage, blocked damage and Opening bonuses; minor
resource costs remain in the expanded source history. Important tactical
status labels remain visible in the compact card.

Old histories without a saved v3 summary are grouped only for layout.
Their original text or saved version-1/version-2 story lines are displayed
unchanged. No approximate version-3 story is generated for old rounds.

Because the UI now supports inspecting every completed round, the combat
view returns the saved history instead of cutting it at an arbitrary
120-event boundary. Long-term server pagination is a separate scalability
task, not a reason to cut a round in half.

**Engine boundary:** The system adds passive `openingUsed` metadata to
already resolved attacks, including accuracy-only Openings. It does not change
an attack roll, hit chance, decision, or damage.

## History-aware wording and clean expanded events

The version-3 round composer now reads **prior resolved events**, not earlier sentence text. A small recent-round record tracks consecutive hits, misses, Guard use and consumed Openings. A separate event-based count tracks past uses of the same actor, event kind and stable ability ID, so unfamiliar generated actions can vary naturally even when movement or recovery interrupts them.

The narrator chooses a simple structure for meaningful exchanges: both misses, ordered hits, recovering while an opponent moves, a Guard followed by an attack, and movement followed by an out-of-reach miss. Events remain in initiative order. A failed dodge is not called a successful dodge. When an injury and outcome crowd the last round, the actual finishing hit takes priority over an earlier hit.

Only a recorded `narration.openingUsed` or positive committed Opening damage bonus means an Opening was **used**. Gained, available, expired and granted Openings are shown only when their corresponding structured tactical events exist. Accuracy-only use must not claim extra damage.

In the shared expanded view, the saved `story.line` is displayed separately from its `story.detail`, preventing glued-on numbers in the readable line. The exact original engine text remains available under **Original event**. Effects explicitly recorded with `applied:false` appear as **did not apply**, never as conditions that occurred. No stored event or historical version-1/version-2 story is rewritten by the presentation helpers.

Complete before-and-after test outputs and manual prose notes: `docs/05-gameplay/combat/round-chronicle-writing-before-after.md`.
