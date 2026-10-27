# Recurring NPC conversations — interaction contract

**Status: INTERACTION RULES APPROVED IN PRINCIPLE; DIALOGUE AUTHORED PER CHARACTER. Updated 2026-10-27.**

The previous version of this document contained unapproved candidate biographies and lines for all six recurring job-givers. **Those draft texts are superseded as proposals, not canonical history.** They remain in Git history but are not to be promoted into gameplay as owner-approved dialogue.

## First character completed: Guther Anvil

The owner has now supplied and approved four new Guther exchanges. The authoritative copy is [Guther Anvil — optional conversations](../onboarding/millhand/guther-optional-conversation.md). It supersedes the earlier Guther draft here, in particular the unapproved story that Guther had worked his way up to *running* the workshop. Guther explicitly says he **does not own or run it**, only supervises, and refuses to disclose who ultimately decides matters.

The exact user-supplied wording is installed as a Millhand-only multi-turn conversation in `platform/apps/web/src/lib/approved-guther-optional.ts`.

## Interaction rules for current Millhand Stage 1–2

1. Clicking Guther opens the existing compact in-scene CRPG dialogue popup. The workshop illustration and interactable items remain present.
2. The spoken choice is performed when selected. Immediately show Guther's answer; don't show the selected player line again as a standalone dialogue beat.
3. A player-controlled follow-up progresses one exchange at a time. No timed speech advancement.
4. Each topic may be left via **Ask something else** or **Return to work**. These are UI commands, not spoken dialogue.
5. Optional conversation is read-only and preserves the work step, selected object, active pending choice and saved server state. No changes to money, XP, inventory or quest flags.
6. During Stage 1, the approved introductory conversation resumes unchanged after closing optional dialogue. During Stage 2, all pending actions remain available on returning.
7. Stage 3 Missing Stamp facts must not surface in routine Stage 1–2 talk.

## Other origins

**Defer writing.** When Bellrunner, Squatter, Stitcher, Scrapper or Inkbound reaches its own integration/review milestone, its recurring NPC's dialogue will be written and reviewed from scratch. Existing entries in `platform/apps/web/src/lib/proposed-npc-dialogue.ts` remain explicitly **unapproved technical drafts**. The owner has not accepted them; no biographical information should be inferred from those drafts.

This document is an interaction specification, not a source of new lore for the other five backgrounds.
