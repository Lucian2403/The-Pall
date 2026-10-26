# M1.2 — Character Selection & Creation: implementation review

**Date:** 2026-10-26  
**Status:** **PROPOSAL FOR OWNER REVIEW** — approved character gameplay rules are preserved, while still-open account policies below are **not yet authorized for implementation**.

## Goal

A signed-in account can inspect its own characters, choose an owned character, and (once name/slot policies are approved) create a durable starting character exactly once. This follows [M1.1 Better Auth local QA](../../platform/M1_1_LOCAL_AUTH_QA.md) and precedes world/background introduction (M1.3) and actual Millhand/Guther workshop integration (M1.4). Character identity is **not** the Better Auth account name.

## Already approved — do not reopen

The authoritative design is [Character Creation — Phase One](character-creation.md) and [Shared Onboarding](../05-gameplay/onboarding/shared-structure.md), with [Shared State Contract](../05-gameplay/onboarding/shared-state-implementation-contract.md):

1. Character fields: **character name, Male/Female, one of six origins**. No age, point allocation or modular portrait editor.
2. **Twelve fixed stylized 2D portraits**, selected by origin + sex; modular equip overlays and later barber customization are future features, not creation choices. Portrait assets and equipment overlay definitions are not complete.
3. Each starts **STR 5 / DEX 5 / INT 5 / RES 5**, maximum Health **50**, same starting equipment **Basic Clothes**, **one Crude Small Bag**, and **20 coins**. Item schema identifiers, capacity/weight/condition are still undecided. Do not invent them as permanent records.
4. Exactly **+3 levels** in one origin **Major Skill at creation**, before tutorial. Not XP, a subskill or attribute modifier. Other Major Skills share their common starting baseline.
5. Origin → skill: **Millhand/Craftsmanship**, **Bellrunner/Industry**, **Squatter/Fieldcraft**, **Stitcher/Medicine**, **Scrapper/Mechanics**, **Inkbound/Scholarship**.
6. The chosen origin determines the start job hub and tailored eight-stage onboarding chapter. It does not lock the character into a profession forever. Male/Female choices do not alter gameplay bonuses or quest branches.
7. Stage 3 branch +1 skill, unpaid tutorial jobs/combat, clinic 10 coins and provisional 150-coin rent are **later onboarding mechanics**, not character creation rewards.
8. No automatic world-lore dump or assumption that the character is an amnesiac. Intro narration is an independent M1.3 review.

## What M1.2 should look like

**Account character list:** display only the signed-in account's own character cards (name, origin, fixed portrait, current state). Offer **Select** and **New character** where policy and capacity permit. No invented power rating, combat statistics or imaginary scene progress.

**Character creation:** choose origin (six short social-role summaries), Male/Female portrait variant, type character name, inspect the **fixed** starter stats/kit and +3 Major Skill, then confirm. No point distribution, rolling or respec buttons. The artist-approved portraits may arrive later; placeholder silhouettes must be visibly tagged *development-only*, not silently accepted final art.

**After creation:** return to selection, then select to enter the **correct** background introduction at M1.3. During staged implementation, a character may be selectable without a playable origin route; never silently redirect Bellrunner to Guther.

## Open product decisions — owner sign-off needed before writing account-owned character mutations

| Decision | Recommended starting policy (PROPOSED) | Reason |
| --- | --- | --- |
| Character slots | **6 per account** for initial release; no paid slots now | Allows trying all six backgrounds, while reducing uncontrolled throwaway characters. Duplicated origins remain allowed unless explicitly banned. |
| Character names | **3–24 visible characters**; letters (including accented letters), internal spaces/apostrophes/hyphens; Unicode normalized, trimmed, case-insensitively unique across the game | Suits period-inspired first/surnames, allows international names and reduces visual impersonation. Reserved NPC/administrator names and confusable characters need separate moderation safeguards. |
| Name changes | **No in-game rename in M1.2**; final rename policy deferred | Creation names should not become freely mutable until moderation and identity-history rules exist. |
| Character deletion | **Do not offer deletion during early testing**; later define protected deletion/recovery/cooldown | Irreversible data loss, economic abuse and restore support are not yet resolved. |
| Multiple origins | **Allow multiple characters of the same origin** within slot cap | Background is an identity choice, not a one-per-account collectible unlock. |
| Staging six origins | **Show all six in preview; label non-playable routes clearly**. Provisional creation gating for unimplemented origin chapters must be approved before UX implementation | Avoid creating characters with no functional way into the game; cannot claim all six stories are integrated when only Millhand is. |
| Character switching | Selection is per user session/request; **never** store a global active character on the account that changes under another device | Avoid accidentally applying commands to a different character across tabs or devices. |

These are not new lore or approved mechanics. They must be explicitly accepted or revised before implementing `POST /characters` and the character creation screens.

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

**Next owner review:** select/revise **slot count, names, deletion, duplicate origins and staged availability**. The existing skill/attribute/starter-kit rules need no new vote.
