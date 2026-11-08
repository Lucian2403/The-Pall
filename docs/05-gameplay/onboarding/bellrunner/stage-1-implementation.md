# Bellrunner Stage 1 — owner-asset integration (2026-11-08)

**Scope: Stage 1 only.** This is the first playable Bellrunner opening
with a **server-persisted** Stage 1→2 acceptance. Stage 2 courier job
interactions, the condemned-site bell and Stages 3–8 are NOT implemented
by this patch. Do not describe this as a complete Bellrunner tutorial.

## Canon preserved

- Location: shared **Dispatch House**, using the owner's pre-existing
  `/locations/origins/bellrunner-depot.webp` background.
- Recurring NPC: **Hector D. Smoke**, Dispatch Master.
- Exact approved Stage 1 dialogue and optional objection are read unchanged
  from `approved-stage-one.ts`; proposed optional recurring-NPC dialogue is
  intentionally hidden in the Bellrunner scene until individually approved.
- One duty bell rings once on the explicit **Begin the round** interaction.
  The attached `UI_DutyBell.mp3` (8.808 seconds) is retained in its original
  encoded quality at `/audio/bellrunner/duty-bell.mp3`; it is not the later
  condemned-worksite bell. No further bell sounds play in this stage.
  The audio stops when the scene unmounts and does not restart with every line.
- The owner-supplied Hector and three paper PNGs were converted to 84-quality
  transparent WebP files without replacing the originals:
  - `/characters/hector/hector-d-smoke.webp`
  - `/locations/bellrunner/council-work.webp`
  - `/locations/bellrunner/sealed-order.webp`
  - `/locations/bellrunner/route-sheet.webp`
- All three paper illustrations are inspectable, with content descriptions.
  Both Stages 1 and the saved Stage 2 handoff use the **existing Millhand UI
  components**, not another visual treatment: `WorkshopItemPopover` for
  paper inspections, `workshop-object-labels.css` for frame-plaque names,
  and `pall-owner-ui.css` for the dialogue parchment and choice buttons.
  Hector is partly hidden by a second, lower-only mask of the original depot
  image, using the same foreground layering as Guther's workbench.
  Neither the sealed order nor the still-unfilled route sheet reveals the
  Stage 3 closure, working night bell or branch choices. These are **job
  papers**, never inventory item grants or permanent personal possessions.
- **Depot ambience:** the already-committed `depot-ambience.mp3` is reused
  through `TutorialShell`'s existing `depotBackdrop` scene ownership for
  Stage 1 and the Stage 2 accepted-round view. No new or duplicate ambient
  recording is needed. It respects the game's audio control/unlock rules,
  stops outside Depot scenes and must not drown out the separate one-shot
  duty-bell SFX.

## Persistence and safety

The **Take the round** action calls `POST
/api/characters/:id/bellrunner/dispatch` with a UUID request ID and
`expectedRevision:0`. The API checks verified session, owner, origin,
JSON content type, allowed action and stage, then locks the character,
writes an idempotency receipt and advances the character from Stage 1
NOT_STARTED to Stage 2 IN_PROGRESS. Exactly one round can be accepted.
Retries with the same request ID return the saved response. A second
different request is rejected. No coins, ordinary XP, skill level,
item, equipment or permanent quest prop is granted by this action.

The accepted round is visible at
`/characters/:id/bellrunner/dispatch`, and can be revisited from the
character detail screen. The owner-approved **← Back to Stage 1** control
is also available on that page **only for local development** through
the shared `/dev/rewind-stage` API. With a confirmation and the owner
character row locked, it deletes only the accepted round and its stale
receipts before restoring Stage 1. Coins, saved starter gear and Major
Skills do not change. This button is never enabled on a production or
non-loopback API. The next implementation will add Stage 2's
normal route/check/delivery/receiving-mark state machine to that page.
Do not simulate completion, payment, delivery timers or the Stage 3
revelation before then.

## Local owner testing

From the new Bellrunner branch (based on the open inventory PR):

```powershell
cd platform
npm run bellrunner:migrate
npm run dev:api
# In another terminal:
npm run dev:web
```

Create a fresh Bellrunner. Enter the Dispatch House, click **Begin the
round** to hear the duty bell, step through Hector's approved exchange,
try the optional objection, and inspect the three paper cutouts. Click
**Take the round** once. The saved Stage 2 handoff should appear. Refresh
and reenter the character; no second grant or acceptance occurs.

## CI gate

- Owner binary checksums and playable file formats.
- Canonical dialogue and branch parity.
- Svelte build, Fastify typecheck and Stage 1 asset/event wiring.
- PostgreSQL assertions for owner/stranger guards, anonymous access,
  invalid commands, exactly-once acceptance, saved stage, no coin/XP/
  item gain, and idempotent retry.
- Existing inventory, Millhand tutorial and audio regression suites
  remain unchanged and must pass.

**Owner acceptance pending:** scene composition and Hector/paper placement,
mobile layout, and the actual 8.8-second duty bell balance.
