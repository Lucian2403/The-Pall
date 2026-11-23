# The Pall — Permanent Personal Journal (character isolation)

## Ownership contract

The Journal belongs to a **character**, never to an account. All archived task rows have a composite primary key `(character_id, task_instance_id)`. The task ID and task-instance ID are not unique across characters. Two characters, including two on the same account, can record the identical task identity without collision or shared state.

`GET /api/characters/:id/journal?limit=20&cursor=...` authenticates and verifies `player_characters.id=$1 AND account_id=$2` before querying. Its paginated SQL independently filters `journal.character_id=$1` and joined character ownership. Unauthorized requests return 401; other accounts’ characters return 404. Reads never start tasks, write a Journal row, or backfill state. Cursors embed the requested character ID and full PostgreSQL microsecond timestamp precision; a cursor belonging to another character is rejected. Responses are `private, no-store`.

The web reader keys state, loading requests, and rendered instances to the selected character ID. Switching characters aborts pending reads and clears the previous task list, current selection, errors, pagination and any in-flight result. No localStorage, account-wide cache, or shared task list is used. The same reusable component is accessible via the existing Journal control and from the completed Home scene.

## Persisted content and completion boundaries

`platform/db/migrations/0022_personal_journal.sql` adds the generic archive table and chronological lookup index. Its columns include stable task ID and task-instance ID, stage/title, ordered JSONB diary paragraphs, committed choices/outcome, completion timestamp, and content version. Content is frozen on first confirmed completion with `ON CONFLICT(character_id,task_instance_id) DO NOTHING`.

`personal-journal-completions.ts` builds snapshots from the authoritative reducers. The same original first-person copy functions are imported by the Svelte scene and the server from `@the-pall/game-core/journal-copy` (re-exported by game-core). There is no duplicate prose implementation. The existing transaction that saves a task also archives it, before COMMIT. A failed or stale task command cannot create a Journal completion. Reload and repeated request IDs cannot create duplicates or rewrite existing diary paragraphs.

Implemented milestones include Stitcher opening, Morning Dressings, Teaching Bed, chosen second work and Night Door; Millhand Stage II–V; Bellrunner authored Stage IV and V; saved Flint, Dogman and Owler Stage VI outcomes; the shared paid Stage VII clinic exit; and the completed Stage VIII rented home. Only confirmed phases and recorded choices produce snapshots. Unauthored previous Bellrunner prose is not fabricated to fill missing tasks.

While a scene is active, existing progressive first-person entries remain its **Current** record. **Completed Tasks** displays immutable saved tasks in chronological order, with a simple list and one selected reading area, loading at most 20 at a time (50 maximum per request). Home uses the same archive reader. The global Journal navigation item unlocks without exposing unfinished markets or other systems.

## Migration and historical safety

From `platform/`, run:

```sh
npm run journal:migrate
npm run journal:backfill
```

Both require the project's configured `DATABASE_URL`. The migration is additive: it does not replace characters or copy account-wide entries. The optional idempotent backfill processes each character separately, locks the character's row inside a transaction, reads only that character's verified saved task states, and inserts only completed authored diary snapshots. It does not guess unknown decisions, create missing completion flags or rewrite immutable entries. It can be re-run safely after an interrupted connection.

Developer-only rewinds invalidate superseded task snapshots for **that exact character** in the same transaction as the original state/Health/receipt rewind. Normal location revisits never remove completed Journal history. Authenticated character deletion cleans only the selected character's child Journal rows before deleting the character.

## Acceptance and replay

The PostgreSQL integration suite uses one account with Stitcher and Millhand characters. The Stitcher completes Morning Dressings, investigates the Teaching Bed and chooses Notes for the Living. The Millhand completes Marking the Plates, investigates the Missing Stamp and chooses Contracts. The tests verify independent titles, route-specific text, no cross-character entries, ownership rejection, pagination, repeated completion, distinct and identical task instance IDs, and rewinding the Stitcher without modifying the Millhand. They also verify the archival API can retrieve a genuine Stage II `Marking the Plates` snapshot for a character whose tutorial stage is VIII; the same content survives a fresh request.

To demonstrate in the UI: use a Millhand character who completed Stage II, advance to the rented home (Stage VIII), open **Journal**, choose **Completed Tasks**, then select **Marking the Plates**. The saved Stage II diary paragraphs are shown without returning to Guther’s workshop. Choose another character from character selection: the Journal starts from that character's independent archive. A new character sees no completed tasks.

Use the following checks in CI:

- `npm run check:api`, `npm run build -w @the-pall/web`, and game-core checks.
- The PostgreSQL integration suite in `scripts/verify-stage6-postgres.integration.test.ts` with an isolated disposable `pall_stage6_test` database.
- Browser smoke tests for existing scenes and Journal's responsive layout.

No account-level archive joins, production rewinds, fabricated rewards, or client-authored task completion have been introduced.
