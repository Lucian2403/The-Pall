# Universal activity engine — first increment

## Rules
The existing jobs-and-time design remains authoritative. No universal AP/Energy pool. Real elapsed time is independent of the browser; required interactions will block completion, not pause elapsed time. This increment implements the timed lifecycle, not the future interaction-module or job reward systems.

## Separation
- `packages/game-core/src/activity.ts`: shared read model and pure timing helpers.
- `apps/api/src/activity-definitions.ts`: activity catalogue. A definition supplies the server-owned duration, preparation and completion. It does not handle HTTP, clocks or persistence.
- `apps/api/src/activity-engine.ts`: starts and reconciles one running activity per character. The owning route must hold the character row lock, validate authorization and use its revision/idempotency receipts. Completion effects and the completion timestamp commit in the same transaction.
- `0027_activity_engine.sql`: latest activity, timestamps and unique character slot. This is not a full activity history.
- Existing Home API is the first adapter. Its completed-stage rest command starts `home.rest`; its GET settles due work. City requests also reconcile elapsed activity and refuse new travel during a running activity.

## First activity
Free Play bed rest: provisional 30 seconds. No costs. Restores Stamina and Composure to 100 and clears Fatigue and Stress using the existing Home transition only at completion. No Health healing, injury treatment, money, XP, equipment or journal mutation. Tutorial bed rest remains instant, as before. Repeated starts and rent payment are refused during an active rest. Reading the journal and ordinary inventory rules remain unchanged. Developer Stage VIII rewind discards that character's activity, not rent or other progression.

The countdown is a presentation of server timestamps. Closing the browser does not pause the activity. The next authorized Home or city read reconciles it exactly once; there is no background scheduler. A timer reaching zero is not an authoritative completion.

## Installation and extension
Run `npm run home:migrate` from platform. Existing characters need no reset. Future activities should register a new definition and an authorized adapter rather than duplicate the engine. Add persisted interaction state and its explicit resolution contract when the first interactive job is designed. No jobs, recipe rules, cancellation policy, universal resource economy, or generic public start-anything API are introduced here. Existing travel stays on its own established engine, mutually exclusive with running activities.

## Deadline synchronization and confirmation
The browser displays local countdowns inside ActivityProgress without making network requests. Home and city use one reusable deadline scheduler: initial load, confirmed start, one reconciliation near the end, and refresh on focus/visibility. Failed completion requests retry at five-second intervals while an activity remains active. There is no idle polling; a separate tab's changes are reconciled on focus or the next authoritative action. Identical Home snapshots do not replace reactive scene data. Journal and rewind queries are keyed to their actual character/stage dependencies. The first adapter uses a shared confirmation policy of 15 seconds or longer; future adapters must reuse it; the displayed duration comes from the server's activity definition. Cancelling before confirmation makes no start request. This is not cancellation of an already-running activity.
 The browser fixture exercises cancel, confirm, no intermediate requests, journal/room identity, one deadline GET and no idle polling.
