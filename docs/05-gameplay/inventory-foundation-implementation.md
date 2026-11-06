# Inventory foundation — implementation checkpoint

**Status:** implemented technical foundation; all numeric weights/capacities and item
durability values below are **provisional playtest values**, not locked game balance.

## Already agreed canon
All six backgrounds receive Basic Clothes, one Crude Small Bag, and **20 coins**.
Coins remain a currency field, never a physical inventory item. The tutorial's
10-coin clinic cost is unchanged; no new item rewards or background advantages
are granted. Item definitions and item *instances* are separate, as required by
the [Item Data Schema](../04-equipment/data/item-data-schema.md).

## Implemented
- Normalized item definitions: stable code, family, description, weight, volume,
  stackability, stack limit, permitted quality range, baseline durability, and
  container volume bonus. These are records, not bespoke item-class branches.
- Runtime owned instances: unique UUID, owning character, pack/home-chest
  location, quantity, quality tier, durability and one-time starter-grant key.
- Idempotent SQL migration/backfill; character-insert trigger ensures every new
  character receives the universal starter kit inside its creation transaction.
  Existing characters are backfilled without affecting saved states.
- Pack weight and volume capacity. The carried bag grants usable **volume**
  rather than secretly increasing lifting strength; putting it in the chest
  removes its allowance. The chest has independent storage limits.
- Authenticated item reads; POST transfers are atomic under the character and
  inventory locks, checked against optimistic revision and request receipts.
  Quantities can be split and compatible stacks merged without duplication.
- Chest transfers require the saved shared Stage 8 home; earlier tutorial stages
  may view possessions but may not teleport items to a locked home.
- The Stage 8 chest hotspot opens a working pack/chest interface. No extra art
  is necessary; the current UI is provisional.

## First-pass numerical fixtures (NOT FINAL)
| Property | Playtest value |
| --- | ---: |
| Basic Clothes weight | 1.2 kg |
| Basic Clothes occupied volume | 2 L |
| Crude Small Bag weight | 0.8 kg |
| Crude Small Bag occupied volume | 2 L |
| Crude Small Bag added carry volume (when carried) | 12 L |
| Base pack carrying weight | 20 kg |
| Base pack volume without bag | 5 L |
| Chest weight limit | 120 kg |
| Chest volume limit | 200 L |
| Starter quality tier | 1, Crude (technical placeholder) |
| Starter durability | 100/100 (technical placeholder) |

No persistent equipment slot is yet assigned to Basic Clothes or Crude Small
Bag. The bag's allowance while carried is explicitly transitional; the next
equipment milestone will determine how equipped bags grant carrying space.

## Security and invariants
- A caller cannot choose an item code, owner, quality tier, durability, money,
  or server-generated instance ID when transferring.
- Cross-account reads/writes return 404; unauthenticated requests return 401.
- Wrong revision, non-owned item, insufficient quantity, over-capacity and
  locked-home transfers fail without mutating the state.
- Identical request-id retries return the stored response once; the same
  request ID with altered parameters is rejected.
- Item quantities and ownership are conserved by all storage operations.
- Deleting a character removes only that character's owned inventory records.
- Nothing in this module heals, changes tutorial stages, grants XP, generates
  coins, applies weapon damage, or opens post-tutorial gameplay.

## Excluded from this checkpoint
**Equipment** (slots, equip/unequip, weapon/armour modifiers, visibility),
durability degradation and repairs, trading, loot, crafting, and a finished
inventory visual design. These remain separate milestones, not implicit features.

## Installation
From \`platform\`, after the existing character migrations:
\`\`\`powershell
npm run inventory:migrate
npm run verify:inventory
\`\`\`

The migration uses \`platform/.env\` and the API's **same DATABASE_URL**. It is
additive and safe to rerun; do not reset Docker volumes.
