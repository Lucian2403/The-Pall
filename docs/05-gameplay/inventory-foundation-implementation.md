# Inventory foundation — implementation checkpoint

**Status:** implemented technical foundation; all numeric weights/capacities and item
durability values below are **provisional playtest values**, not locked game balance.

## Already agreed canon
All six backgrounds receive Daily Worker Clothes, one Simple Bag, and **20 coins**.
Coins remain a currency field, never a physical inventory item. The tutorial's
10-coin clinic cost is unchanged; no new item rewards or background advantages
are granted. Item definitions and item *instances* are separate, as required by
the [Item Data Schema](../04-equipment/data/item-data-schema.md).

## Implemented
- Normalized item definitions: stable code, family, description, weight, volume,
  stackability, stack limit, permitted quality range, baseline durability,
  common-item subtitle, armour rating, and the bag's eight-slot bonus. These are records, not bespoke item-class branches.
- Runtime owned instances: unique UUID, owning character, pack/home-chest
  location, quantity, quality tier, durability and one-time starter-grant key.
- Idempotent SQL migration/backfill; character-insert trigger ensures every new
  character receives the universal starter kit inside its creation transaction.
  Existing characters are backfilled without affecting saved states.
- Pack and chest **grid-slot capacity** in addition to weight and volume.
  The inventory starts with **16 base slots** and the carried Simple Bag
  grants **8 more** (24 total). Putting it in the chest removes those eight.
  The starter rented-home chest has 24 provisional slots.
  The carried bag also grants provisional volume, never lifting strength.
- Authenticated item reads; POST transfers are atomic under the character and
  inventory locks, checked against optimistic revision and request receipts.
  Quantities can be split and compatible stacks merged without duplication.
- Chest transfers require the saved shared Stage 8 home; earlier tutorial stages
  may view possessions but may not teleport items to a locked home.
- The Stage 8 chest hotspot opens a working **two-grid inventory/storage UI**,
  each with up to 24 visible slots and a separate selected-item description
  panel. Selected details show the approved item text, Common category,
  0 Armour or 8 Slots as applicable, quantity, condition, weight and volume.
  Placeholder typographic initials stand in for future inventory item icons.

## First-pass numerical fixtures (NOT FINAL)
| Property | Playtest value |
| --- | ---: |
| Daily Worker Clothes weight | 1.2 kg |
| Daily Worker Clothes occupied volume | 2 L |
| Daily Worker Clothes armour | 0 (owner-defined) |
| Simple Bag weight | 0.8 kg |
| Simple Bag occupied volume | 2 L |
| Simple Bag added inventory slots | 8 (owner-defined) |
| Base inventory slots without the bag | 16 (provisional) |
| Total inventory slots with the bag | 24 |
| Home Chest storage slots | 24 (provisional) |
| Simple Bag added carry volume (when carried) | 12 L (provisional) |
| Base pack carrying weight | 20 kg |
| Base pack volume without bag | 5 L |
| Chest weight limit | 120 kg |
| Chest volume limit | 200 L |
| Starter quality tier | 1, Crude (technical placeholder) |
| Starter durability | 100/100 (technical placeholder) |

No persistent equipment slot is yet assigned to Daily Worker Clothes or
Simple Bag. The catalogue preserves the old stable item codes
`basic_clothes` and `crude_small_bag` so existing owned instances survive
the name change. The additive migration also updates old starter-kit display
names without changing quantities. The bag's slot allowance while carried
is explicitly transitional; the equipment milestone will determine how
equipped bags grant carrying space.

## Security and invariants
- A caller cannot choose an item code, owner, quality tier, durability, money,
  or server-generated instance ID when transferring.
- Cross-account reads/writes return 404; unauthenticated requests return 401.
- Wrong revision, non-owned item, insufficient quantity, full pack/chest
  grids, overweight/overvolume and locked-home transfers fail without mutation.
- Identical request-id retries return the stored response once; the same
  request ID with altered parameters is rejected.
- Item quantities and ownership are conserved by all storage operations.
- Deleting a character removes only that character's owned inventory records.
- Nothing in this module heals, changes tutorial stages, grants XP, generates
  coins, applies weapon damage, or opens post-tutorial gameplay.

## Excluded from this checkpoint
**Equipment** (slots, equip/unequip, weapon/armour modifiers, visibility),
durability degradation and repairs, trading, loot, crafting, and final
inventory visual styling and art assets. These remain separate milestones, not implicit features.

## Installation
From \`platform\`, after the existing character migrations:
\`\`\`powershell
npm run inventory:migrate
npm run verify:inventory
\`\`\`

The migration uses \`platform/.env\` and the API's **same DATABASE_URL**. It is
additive and safe to rerun; do not reset Docker volumes.


## Local Stage 8 troubleshooting

The Inventory panel calls `GET /api/characters/:id/inventory` on the same
local API as the Stage 8 home scene. If it fails, the panel now displays the
HTTP status rather than the unhelpful generic "Inventory is unavailable."

- **HTTP 404 — Inventory endpoint missing:** the web bundle has the new panel
  but the API process may still be running older code. Check out this PR branch
  and restart the existing API terminal from `platform` using `npm run dev:api`.
  Do not create a second API process on port 8788.
- **HTTP 503 — Inventory schema missing or uninitialized:** from `platform`,
  run `npm run inventory:migrate` with the same `.env` / `DATABASE_URL` as the
  running API. The migration is additive and backfills existing characters.
  Refresh the inventory after a successful migration.
- **HTTP 500 — Inventory server error:** inspect the output of the API terminal
  for the actual PostgreSQL or route error. Do not reset the database or delete
  Docker volumes; a 500 does not, by itself, identify a migration problem.
- **HTTP 502/503/504 — API unreachable:** verify the API server is running at
  `127.0.0.1:8788`; the Vite dev server proxies `/api` there.

The existing Stage 8 home being visible verifies the page loaded, not that
the newly added inventory endpoint and tables are available. Successful GitHub
CI runs do not migrate or restart the owner's local PostgreSQL/API processes.
