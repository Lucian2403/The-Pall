# Stage 7 — Millhand clinic playable integration

**Status:** Stage 7 server-backed implementation; provisional presentation.
**Scope:** Follows the approved Stage 7 editorial script and the later shared
post-clinic-readiness policy. No reimplementation of combat mechanics or
Stage 8 home/rent notice.

## Authoritative entry and clinical record

Stage 6 finishes and saves Flint's original outcome, chronological combat
events, Health, wounds and other combat state. **Both** `player_victory` and
`player_defeat`, including zero Health, may enter the clinic. Entry creates
a separate clinic record containing the actual saved post-fight condition.
No artificial injury, scripted hit or automatic stabilization is added.
The Stage 6 encounter and Chronicle are never overwritten by the clinic.

## Approved interaction sequence

1. **Arrive** at clinic from the battle outcome. This is an idempotent
   initialization, not an extra paid action.
2. **Examine condition:** show exactly the saved post-fight Health, wounds,
   bleeding, Stamina, Composure, Fatigue, Stress, and Momentum.
3. **Speak to clinician:** "Sit. Let me see." The cut/dressing line is
   shown **only** when the combat engine recorded a `cut` wound; an
   unhurt patient receives "No injuries found. No treatment needed."
   Other conditions receive a generic factual examination result.
4. **Review the price:** 10 coins for an examination and basic care
   where necessary, without additional charges.
5. **Pay 10 coins:** update coins and Health in one PostgreSQL transaction
   and store a once-only request receipt. Tutorial discharge restores full
   starting Health and combat-only reserves using the original combat
   fixture defaults. No normal-skill progress, items, XP or hidden fee.
6. **Leave clinic:** advance the character to Stage 8 only after the
   examination is paid. The shared Stage 8 home/rent scene is **not**
   implemented in this change. It will be a separate integration.

The server rejects actions in the wrong order, unsigned ownership,
unauthorized identities, insufficient balance, stale revisions, changed
request-ID payloads, or attempting to enter before the fight is finished.
Retries return the original receipt. Simultaneous Pay requests cannot
charge twice. Reloads restore the exact clinical phase and saved condition.

## Condition and post-care policy

The later owner correction to the shared clinic policy governs the
tutorial discharge: immediately after payment, the character is ready
for ordinary play at **full 50/50 Health** with normal starting combat
condition, even after defeat. The temporary combat-fixture defaults are
Stamina 90, Composure 80, Fatigue 0, Stress 0, Momentum 0, Bleed 0 and
no active wounds. These are **not permanent origin-specific maximum
values or a general-purpose medical healing formula.**

An unhurt patient receives **no dressing or Health restoration**;
combat-only reserves are still reset to their starting values for the
tutorial exit. A recorded cut may use the already approved cleaning/
dressing dialogue. Other injuries receive no invented specific
diagnosis or procedure.

The clinic's pre-care and post-care snapshots are stored separately.
The v0.5.1 battle history retains its exact original HP and wound data.

## Persistence and verification

New additive `0008_millhand_clinic.sql` creates a state table and
request receipt table with restrictive character foreign keys.
Authenticated character deletion clears both before its parent.
No existing character or saved fight is reset.

Run once after pulling Stage 7:

```sh
cd platform
npm run clinic:migrate
npm run build:packages
```

Restart the API and web servers.

CI runs the original 49 combat tests, the Stage 6 regression verifier,
the Stage 7 pure-transition tests, real PostgreSQL integration covering
victory/defeat/unhurt care, exactly-once payment, concurrency, authorization,
character Health/coins, existing combat history and Stage 8 handoff.
API type-check and production web build are also mandatory.

A later milestone must implement the approved shared home scene. No
invented rent notice, new NPC identity, new named clinic or additional
health-system mechanics are included here.


## Owner clinic background and local replay (2026-11-04)

Stage 7 paints the owner's supplied `Clinic_Workshop_cold.png` image,
optimized losslessly in dimension to `static/locations/clinic/clinic-workshop-cold.webp`
(1672 × 941, WebP quality 84). The complete scene remains visible behind
translucent clinic UI surfaces. The existing two-column condition/examination
layout, spoken dialogue, fee, approved framed buttons and Personal Journal
remain in the same order and retain their current logic.

The existing loopback-only developer `Back to Stage` control is now
available in Stage 7 as **Back to Stage 6**. The clinic route synchronizes
its newly started stage in the mounted shell so the button appears on first
arrival, without reloading.

In the owner-confirmed developer replay transaction:

- The character must be owned, in Stage 7, and have a consistent
  completed fight, clinic snapshot and pre-fight combat start receipt.
- Clinic receipts and clinic record are removed, followed by combat
  receipts and finished fight, under a single character-row lock.
- Original pre-fight Health is restored from the revision-zero start
  receipt. The Stage 5 choice and earlier skill/item rewards remain saved.
- If the fee was paid, exactly 10 coins are refunded. If it was not
  paid, no coins change. Returning twice cannot issue another refund.
- The player returns to a clean Stage 6 that can start a **new** Flint
  encounter, rather than a stale finished encounter. Stage 8 cannot use
  this shortcut; it is reserved for the Stage 7 test sequence.
- Inconsistent Health/clinic state cancels the transaction entirely.
  Production API binds or `NODE_ENV=production` never expose this route.

PostgreSQL integration tests exercise paid/unpaid replay, ownership,
single refund, revived fight readiness and all-or-nothing rejection.
The approved original combat engine remains byte-for-byte unchanged.

## Stage 7 immersive dialogue refinement — 2026-11-04

The owner requested the same **in-scene dialogue frame** used in prior
chapters rather than two dense UI columns below the clinic art.

- The original owner-supplied clinic interior remains the **whole visible
  encounter scene**, with the same parchment/metal nine-slice dialogue
  frame used in Stage 5 placed over the right side of the image.
- The saved **Examine → Speak → Review price → Pay → Leave** sequence and
  exact 10-coin billing logic remain unchanged.
- At each step only the relevant narration or clinician exchange is shown;
  the previous dense "Your condition" panel, six-stat readout, duplicate
  diagnosis and always-open Journal are removed.
- The clinician's observations come strictly from the saved Health,
  fatigue, stamina, bleeding and actual wound types. **No recorded wound
  with reduced Health** is described as being knocked about, not as a
  fictitious cut. Only a genuine recorded cut receives the cleaning/
  dressing dialogue. A genuinely unhurt patient hears the approved
  no-injuries/no-treatment result.
- Players can expand **Review examination record** for the precise
  numerical pre-care Health, wounds, bleeding and key reserves, or
  **Review journal** for the existing first-person account. Neither
  normally crowds the illustrated room.
- Buttons reuse the approved normal/hover/pressed nine-slice artwork.

**Back to Stage 6** remains development/loopback-only. It works both
during Stage 7 and when the clinic has been marked LEFT and Stage 8 has
been **unlocked but not started**. The clinic page continues to display
the Stage VII chapter label while reviewing the completed visit.
A completed-clinic rewind is refused once Stage 8 changes to
IN_PROGRESS, or if the clinic is not actually LEFT and paid. The
existing transactional one-time 10-coin refund, original pre-fight
Health restore, and combat replay safety checks are retained.
