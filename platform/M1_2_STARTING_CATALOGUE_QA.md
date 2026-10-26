# M1.2 — Starting Catalogue QA (read-only design foundation)

**Status:** source and tests committed; **not yet executed against owner Node 24**. This is a safe implementation precursor, NOT an account-owned character creation service.

## What was committed

- `packages/game-core/src/character-creation.ts`: six approved origin labels, social roles and Major Skill mappings.
- `previewCharacterStart(origin, sex)`: immutable **design facts** expressed as a returned preview: four attributes 5, maximum Health 50, +3 one origin Major Skill, 20 coins, and display names Basic Clothes / Crude Small Bag.
- Twelve Male/Female origin fixtures with tests; no character persistence, name policy, item ID, asset file ID or granted inventory is fabricated.
- No change to M0 test counter or M1.1 account/security endpoints.

## Local verification (Windows PowerShell, Git checkout)

From `The-Pall\platform`:

```powershell
git pull --ff-only
node --version
npm ci
npm run test:unit
npm run check:web
npm run build -w @the-pall/web
```

`node --version` must be Node v24.*. `npm ci` confirms that the recently normalized public-registry lockfile can install the exact checked-in dependency tree; do not remove database volumes. Tests should include **12 new origin/sex cases** plus supporting mapping/validation/copy-isolation cases and the existing unit tests. No browser or database server is needed to run these checks, although stopping the dev Node watchers first may avoid file-change restarts.

**Note on lockfile:** package tarball URLs were normalized from a private npm proxy to `https://registry.npmjs.org/` in GitHub commit `656f7ab877e3d64fee15ca33c32a33568087b0cf`; versions and integrity hashes were preserved. `npm ci` from a clean local environment is still the required empirical test. If package retrieval fails, report the exact package/error rather than removing integrity checks or force-resetting the lockfile.

## Approval boundary

Owner review still needed for:
- Character slot count.
- Name rules and uniqueness.
- Deletion/restore policy.
- Whether duplicate origins are permitted per account.
- Staged availability of non-Millhand origins while their playable UI has not been integrated.
- Persistent item definitions before minting normal Basic Clothes / Crude Small Bag inventory rows.

See [M1.2 design review](../docs/01-player/m1-2-character-selection-creation-design-review.md). Until these are accepted, **do not** create `POST /api/characters`, allow a user to generate a player record, or present final character portraits.

## Acceptance summary

- Catalogue tests and former M0/M1.1 tests pass under Node 24.
- No browser UI or database schema change is required for this catalogue.
- Once the user approves proposed policies and outstanding equipment identifier boundary, implement authenticated character CRUD and creation transaction; test Account A/B isolation and concurrent creation.
