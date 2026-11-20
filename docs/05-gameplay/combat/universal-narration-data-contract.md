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
