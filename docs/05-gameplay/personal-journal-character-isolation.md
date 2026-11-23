# Character-owned Personal Journal — persistence and isolation contract

## Ownership boundary

A Personal Journal belongs to one character. The account is an authentication principal only; it is never an archive or cache namespace. Every archive row has a non-null `character_id` referencing `player_characters(id)`. Two characters can have the same `task_id` and `task_instance_id`; the storage primary key is `(character_id, task_instance_id)`.

The read API `GET /api/characters/:id/journal` requires a verified authenticated session, verifies `player_characters.id = :id AND player_characters.account_id = session.user.id`, and then reads **only** journal rows with that `character_id`. An unowned character returns 404. There is no client-submitted completion endpoint. Reads never advance a quest.

Page requests use `limit` (1–100, default 20) and an opaque-for-UI ascending sequence cursor `after`; the returned `nextCursor` is null at the end. Responses disable HTTP caching. This prevents the full lifetime history being fetched on every combat turn.

## Snapshot and atomicity

`0022_personal_journal.sql` adds a shared table with task/instance identity, title, stage, ordered first-person paragraphs, committed choice metadata, outcome, content version, completion timestamp, and insertion sequence. `archiveJournalTask(client, task)` requires meaningful paragraphs and inserts a snapshot only inside an already authenticated, character-locked task transaction. `ON CONFLICT (character_id,task_instance_id) DO NOTHING` prevents retries from rewriting earlier entries or duplicating completion. Editorial changes in later releases cannot replace old snapshots.

The authoritative completion hooks are common across backgrounds. The creator of a task supplies its recorded state, not claimed client text. Stitcher transitions archive Morning Dressings, Teaching Bed, and the selected Stage IV work; the witnessed Night Door is archived when the authentic encounter starts. Millhand's completed platework, Missing Stamp choice, selected second job, and saved Flint outcome archive their existing diary writing. Bellrunner's completed round, Wrong Bell decision, second job, and Dogman outcome use committed branch state. The shared paid clinic departure and finished rented home are archived for both implemented backgrounds. No unused task choice, future event, currency, inventory or skill adjustment is manufactured by archival.

## Reader and character switching

`PersonalJournal.svelte` is the single shared reader invoked by the permanent shell Review/Close control, unlocked Journal navigation, and the existing Home book hotspot. It renders **Current** from the active scene's first-person entries and **Completed Tasks** from the authenticated archive. A task is selected by its instance ID; saved paragraphs are read-only. Desktop and mobile use the same parchment and keyboard-accessible controls.

Each reader is keyed by `character.id`. A character switch clears its old selection, paragraphs, cursor, request sequence and loading state, aborts any outstanding request, and checks both the request's character ID and the response's `characterId` before rendering. No archive is cached under an account ID, in localStorage, or across characters. Closing and reopening fetches the character's current persisted archive.

## Migration, backfill and rewind

From `platform` with the **correct** `DATABASE_URL`:

```bash
npm run journal:migrate
npm run journal:backfill
```

The migration is additive and does not erase old progress. The optional, repeat-safe backfill inspects only the character's saved work, inspection, branch, battle, clinic and home state. Missing or incomplete evidence is **not** invented; only verifiable milestones are archived. Previous snapshots are left untouched. Future backgrounds can use the same `archiveJournalTask` contract without new per-origin schemas.

Existing developer rewind transactions that decrease `tutorial_stage` trigger deletion of journal snapshots for the **rewound character only** at the reopened stage and later. It runs within the same PostgreSQL transaction as the character rewind; all other characters' archives are unaffected. Normal browsing and revisits do not lower `tutorial_stage` and never delete completed entries.

## Isolation and Stage VIII demonstration

The integration test in `scripts/verify-stage6-postgres.integration.test.ts` creates a **single account** with two owned characters:

- **Stitcher** records Morning Dressings and Teaching Bed and selects Notes for the Living.
- **Millhand** completes Marking the Plates and chooses Contracts after Missing Stamp evidence. Authentic reducers and the backfill helper construct its saved history.

The test reads each character's separate API history, switches back and forth, verifies the repeated task instance `tutorial:stage:2` and an identical generic test `task_id`, rejects a different authenticated account (404) and an unauthenticated read (401), tests pagination and idempotency, and rewinds Stitcher without modifying Millhand's archive.

To demonstrate archived reading after completing the eight-stage introduction: open the Millhand character's shared rented home, select **Review journal** (or the room's Journal book), select **Completed Tasks**, then **Marking the Plates**. The exact saved Stage II first-person paragraphs appear even while the character is on Stage VIII. The test also reads the Stage II archive after moving the Millhand fixture to Stage VIII and checks it is unchanged. This does not require going back to the workshop.

## Limits

No new Stitcher Stage VII or Stage VIII gameplay is synthesized. The table and UI support future tasks through stable identities, not a fixed eight-task schema. The backfill records only what existing saved states can substantiate; there is no fabricated substitute text for lost or unavailable history.
