# The Pall — Rules and Architecture Decision Boundaries

**Status:** engineering policy for M0, 2026-10-24. Not an approval of new gameplay rules.

The Pall is a text-led, minimally illustrated, low-animation MMORPG. The owner selected a web-native stack, not Godot. **Infrastructure can be built before all game systems are designed.** Architecture must not silently turn a proposed formula or experimental value into game canon.

## Three classes of decisions

| Class | Examples | Allowed in M0? |
| --- | --- | --- |
| **Approved mechanic** | The existing Millhand Stage 1–2 text and choices, their no-pay introductory status, one-time command semantics, approved combat log | May be carried later into M1, after explicit parity tests; **do not implement it in M0** |
| **Provisional game design** | Balance values, detailed crafting formula variants, unapproved healing effects, rent enforcement, workforce economy | **No** implementation or database columns that assume the answer |
| **Infrastructure decision** | Typed commands, request validation, persistent revisions, transaction boundaries, migrations, UI components, idempotency receipts | **Yes**, subject to engineering tests |

## Change control

1. Store each game rules decision in its own authoritative design document, with **Approved / Provisional / Open / Rejected / Superseded** status and references to its effects and original owner decision.
2. Make decisions inspectable as data or a pure domain module; never hide them in CSS, UI code, SQL triggers or ad hoc route branches.
3. Build **technical fixtures** while interfaces mature. A fixture is never a legitimate player reward, injury, weapon property, crafting recipe or character identity.
4. Require tests proving an approved mechanic before porting to a new runtime. Legacy prototype behaviour is not automatically canon merely because a test passed.
5. Migrations should introduce *durable, necessary* gameplay structures once that domain is defined; do not build the complete inventory/economy schema in M0.
6. A final gameplay decision does not require replacing the entire client/server stack. It should normally update domain rules, validated content and tests.
7. Every UI change must preserve owner-approved presentation: the Gate 02 modular workshop, click-to-reveal actions, Guther artwork and personal Journal vs unchanged combat log.

## Current technical scope

- Technical fixture: one server-owned development actor, one numeric value and revision, no player accounts.
- The browser sends action intent with **unique request ID and expected revision**; the server validates and stores results.
- A PostgreSQL transaction is necessary before moving past M0, with tests for duplicate requests, concurrency and restart persistence.
- Real accounts, marketplace, anti-cheat, world simulation, crafting, rent penalties, PvP and background-specific content remain outside the fixture.

## Explicit M0 prohibitions

Do not award coins, grant XP, create items, rebalance existing fights, implement undocumented healing, display made-up player numbers, or introduce real-money systems to test persistence. Build infrastructure first, then test Millhand Stage 1–2 as M1.
