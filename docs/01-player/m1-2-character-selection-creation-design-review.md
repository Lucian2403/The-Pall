# M1.2 — Character Selection & Creation: implementation review

**Date:** 2026-10-26  
**Status:** **INITIAL LOCAL M1.2 POLICY ACCEPTED / IMPLEMENTATION CANDIDATE**, owner-run persistence/security QA pending. The approved character gameplay rules and canon are unchanged.

> **Owner implementation approval (2026-10-26):** The owner approved moving forward with account-owned persistent character creation after the read-only intro and authorization checks passed. For this **local M1.2 development pass**, the previously proposed initial defaults are being used: six character slots, 3–24-character normalized globally unique names, no deletion/rename, duplicate origins permitted. Characters of all six origins may be saved but must show a clear **non-playable/tutorial-not-integrated** warning. Public-release moderation, full item IDs and final portrait/sign-in policy remain open. The executable implementation and QA instructions are in [M1.2 Persistent Characters](../../platform/M1_2_PERSISTENT_CHARACTERS_QA.md); the source candidate has **not yet passed owner PostgreSQL QA**.

## Goal

A signed-in account can inspect its own characters, choose an owned character, and (once name/slot policies are approved) create a durable starting character exactly once. This follows [M1.1 Better Auth local QA](../../platform/M1_1_LOCAL_AUTH_QA.md). The **already-approved universal world introduction** is presented following first authentication and **before the character-selection/creation experience**; character choice is followed by background-specific Stage 1 (the next content-integration milestone). Character identity is **not** the Better Auth account name.

## Already approved — do not reopen

The authoritative design is [Character Creation — Phase One](character-creation.md) and [Shared Onboarding](../05-gameplay/onboarding/shared-structure.md), with [Shared State Contract](../05-gameplay/onboarding/shared-state-implementation-contract.md):

1. Character fields: **character name, Male/Female, one of six origins**. No age, point allocation or modular portrait editor.
2. **Twelve fixed stylized 2D portraits**, selected by origin + sex; modular equip overlays and later barber customization are future features, not creation choices. Portrait assets and equipment overlay definitions are not complete.
3. Each starts **STR 5 / DEX 5 / INT 5 / RES 5**, maximum Health **50**, same starting equipment **Basic Clothes**, **one Crude Small Bag**, and **20 coins**. Item schema identifiers, capacity/weight/condition are still undecided. Do not invent them as permanent records.
4. Exactly **+3 levels** in one origin **Major Skill at creation**, before tutorial. Not XP, a subskill or attribute modifier. Other Major Skills share their common starting baseline.
5. Origin → skill: **Millhand/Craftsmanship**, **Bellrunner/Industry**, **Squatter/Fieldcraft**, **Stitcher/Medicine**, **Scrapper/Mechanics**, **Inkbound/Scholarship**.
6. The chosen origin determines the start job hub and tailored eight-stage onboarding chapter. It does not lock the character into a profession forever. Male/Female choices do not alter gameplay bonuses or quest branches.
7. Stage 3 branch +1 skill, unpaid tutorial jobs/combat, clinic 10 coins and provisional 150-coin rent are **later onboarding mechanics**, not character creation rewards.
8. The [approved universal world introduction](../05-gameplay/onboarding/world-introduction.md) is shown after first authentication, before background choice; this is **approved exact copy**, not a still-open text draft. The [approved background-selection introduction](../05-gameplay/onboarding/background-selection-introduction.md) is presented during origin selection, verbatim. These scenes provide lore to the **player** without pretending the **character** suffers amnesia.

## Canonical content handoff — updated documentation, 2026-10-26

The [documentation home](../README.md) now explicitly designates the following as player-facing **approved** wording and authoritative order:

1. **First authenticated entry:** [THE PALL world introduction](../05-gameplay/onboarding/world-introduction.md), shown before background selection. No extra origins, spoiler exposition, explanation of the Plume's unknown cause, or mechanically binding claims should be invented from this text.
2. **Choosing an origin:** [CHOOSE YOUR BACKGROUND](../05-gameplay/onboarding/background-selection-introduction.md), including **all six exact descriptions and Advantage lines**. The generic `socialRole` strings in the pure game-core catalogue are programming metadata/QA aids **not replacements for approved on-screen copy**.
3. **After character creation/selection:** correct origin-specific [onboarding script](../05-gameplay/onboarding/README.md); the six origin folders have approved [Stage 1 opening dialogue](../05-gameplay/onboarding/millhand/opening-dialogue.md) and their own job hubs. A selected Bellrunner does not begin at Guther's bench.
4. **Millhand Stage 1–8:** use the [active editorial authority map](../05-gameplay/onboarding/millhand/INDEX.md), separating mechanical encounter contracts from the latest approved player-facing stage scripts and Journal wording. Never pull superseded writing from prototype history.
5. **Visual direction:** [current painterly/low-detail art and in-scene CRPG dialogue](../00-vision/art-direction.md), not the archived near-photorealistic doctrine.
6. **World terms:** [The Plume / regions lore foundation](../02-world/the-plume-and-regions.md) distinguishes historical Plume from present-day Pall; the ultimate cause remains unknown. Grey Marches precede the Pall. Older use of “Ashlands” is historical shorthand, **not an extra compulsory region**.

**Presentation/state decisions still open:** whether the universal intro can be replayed or skipped, how its first-login completion is persisted, and how much is displayed at once. These are UI/session decisions; do not silently alter the already approved prose. **No gameplay creation mutation follows from this addendum alone.**

## What M1.2 should look like

**Account character list:** display only the signed-in account's own character cards (name, origin, fixed portrait, current state). Offer **Select** and **New character** where policy and capacity permit. No invented power rating, combat statistics or imaginary scene progress.

**Character creation:** choose origin using the [approved background-selection copy](../05-gameplay/onboarding/background-selection-introduction.md) **verbatim**, Male/Female portrait variant, type character name, inspect the **fixed** starter stats/kit and +3 Major Skill, then confirm. No point distribution, rolling or respec buttons. The artist-approved portraits may arrive later; placeholder silhouettes must be visibly tagged *development-only*, not silently accepted final art.

**After creation:** return to selection, then select to enter the **correct** origin-specific Stage 1 introductory scene when that route is implemented. During staged implementation, a character may be selectable without a playable origin route; never silently redirect Bellrunner to Guther.

## Initial M1.2 account policies — local development defaults accepted; public-release policy remains open

| Decision | Recommended starting policy (PROPOSED) | Reason |
| --- | --- | --- |
| Character slots | **6 per account** for initial release; no paid slots now | Allows trying all six backgrounds, while reducing uncontrolled throwaway characters. Duplicated origins remain allowed unless explicitly banned. |
| Character names | **3–24 visible characters**; letters (including accented letters), internal spaces/apostrophes/hyphens; Unicode normalized, trimmed, case-insensitively unique across the game | Suits period-inspired first/surnames, allows international names and reduces visual impersonation. Reserved NPC/administrator names and confusable characters need separate moderation safeguards. |
| Name changes | **No in-game rename in M1.2**; final rename policy deferred | Creation names should not become freely mutable until moderation and identity-history rules exist. |
| Character deletion | **Do not offer deletion during early testing**; later define protected deletion/recovery/cooldown | Irreversible data loss, economic abuse and restore support are not yet resolved. |
| Multiple origins | **Allow multiple characters of the same origin** within slot cap | Background is an identity choice, not a one-per-account collectible unlock. |
| Staging six origins | **Show all six in preview; label non-playable routes clearly**. Provisional creation gating for unimplemented origin chapters must be approved before UX implementation | Avoid creating characters with no functional way into the game; cannot claim all six stories are integrated when only Millhand is. |
| Character switching | Selection is per user session/request; **never** store a global active character on the account that changes under another device | Avoid accidentally applying commands to a different character across tabs or devices. |

These are account/product policies for the initial local development pass, **not new lore or gameplay skill mechanics**. Live M1.2 account-owned character creation is now being implemented; final public-release policy and moderation remain subject to review.

## Proposed backend boundaries

- `account_id` comes **only** from validated Better Auth session, not request JSON. Character ID is an immutable server-generated UUID, not its display name.
- `GET /api/characters` returns **only owned records**; `GET /api/characters/:id` and later `select`/gameplay calls enforce account ownership using `WHERE account_id = <authenticated user>`. Guessed UUIDs must not leak other players' names, presence or inventory.
- `POST /api/characters` accepts **only** an approved name, sex, origin, `requestId`, and expected account character revision if defined. **No client-supplied coins, skills, equipment, experience or progress.**
- Creation is a **single PostgreSQL transaction**: lock capacity, check normalized-name uniqueness, persist character, initial stats, approved +3 skill, starter equipment/currency, stage-1 state, and receipt. Repeated request ID returns original response; duplicate concurrent creations cannot exceed slot limit or grant extra kit.
- Global player economy, future item storage and special job interactions must not use the M0 dev fixture. Auth routes remain separate; `/api/fixture` is for regression only.
- **Pending game item IDs and inventory model:** until the common Basic Clothes and Crude Small Bag have authoritative item definitions/IDs, represent their intended grants as reviewed creation requirements, **not silently invented tradable item records**. Propose the smallest data-schema gate before persistent creation.
- If an origin's tutorial has not been integrated, its selection must not manufacture gameplay state/content; use explicit disabled/preview treatment until staged rollout rules are approved.
- Reserve unique index for normalized name and account-scoped idempotency receipt with request hash. Duplicate or stale commands should have clear errors.

## Acceptance and QA matrix

- **Six origins × Male/Female = 12** character-creation fixtures: correct portrait selection, one +3 Major Skill, all four attributes 5, Health max 50, 20 coins and identical Basic Clothes/bag grants.
- Origin +3 awarded **exactly once**. Repeat HTTP submits, API restart and two-tab race cannot create duplicates or extra coins/items.
- Account A cannot enumerate, inspect, select, rename or modify Account B's characters even knowing their UUID.
- Slot limit enforced server-side and under concurrent requests, not only button hiding. Global name uniqueness/normalization and rejected names verified after approval.
- No client-side mutation of starting money, XP, equip or skill. Account name and character name remain separate.
- Confirm all six origins route toward correct introduction when that intro is implemented; never route an unimplemented origin to Millhand.
- Preserve all M0 and M1.1 unit/auth/account regressions; test Node 24/real PostgreSQL, refresh, browser tabs and restart.
- No visual sign-off until the actual portrait assets, compact layout and text are user-reviewed.

## Immediate executable work safe before approval

- Build a **read-only, pure TypeScript catalogue** of the six canonical origins, associated Major Skill and approved base starting facts; unit-test all origin/sex combinations.
- Draft (but do not apply) character schema/API contracts and reusable UI structure. **Do not expose live character creation, placeholder final names, or persist starter item records** until outstanding policies are approved.

**Next owner QA:** run the additive migration, API + browser creation tests, idempotency/concurrency and Account A/B isolation using the linked persistent character checklist. The existing skill/attribute/starter-kit rules need no new vote.
