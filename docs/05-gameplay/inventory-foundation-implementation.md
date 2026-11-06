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
  The inventory now starts with **4 base slots**. A Simple Bag in the
  **Back / Backpack equipment slot** grants **6 more**, totaling **10**.
  Merely carrying the bag in inventory or chest grants nothing. Unequipping
  it removes the bonus and is rejected if the now-four-slot pack would
  overflow. The rented-home chest retains 24 provisional slots.
  Worn clothing/bags count toward carried mass, not pack-square or bag volume.
  The equipped bag grants provisional volume, never lifting strength.
- Authenticated item reads; POST transfers are atomic under the character and
  inventory locks, checked against optimistic revision and request receipts.
  Quantities can be split and compatible stacks merged without duplication.
- Chest transfers require the saved shared Stage 8 home; earlier tutorial stages
  may view possessions but may not teleport items to a locked home.
- The Stage 8 chest hotspot opens a working **two-grid inventory/storage UI**
  in a native, keyboard-accessible modal over the rented-room scene, rather
  than adding a panel beneath the illustration. Escape and Close return to
  the unchanged room. The existing Journal hotspot uses the same overlay
  mechanism, preserving the branch-specific journal content. Small screens
  scroll within the modal instead of extending the home-page document.
- An **Equipment** panel now presents the canonical anatomical sockets
  around a faint human silhouette: Head, Face, Torso, Hands, Pants, Feet,
  Back/Backpack, Primary/Secondary Weapon, Respiratory Filter and accessory
  sockets. The universal starter outfit occupies Torso as one composite item
  and Simple Bag occupies Back. Other slots are unoccupied, not free items.
  The carried-item grid has 4–10 cells; the chest grid has 24 cells.
  Selected details show the approved item text, Common category,
  0 Armour or 8 Slots as applicable, quantity, condition, weight and volume.
- The owner's `ItemEq_SimpleBag.png` and `ItemEq_BasicClothes.png` are the
  source of the two transparent 128×128 WebP integration cutouts at
  `platform/apps/web/static/items/simple-bag.webp` and
  `platform/apps/web/static/items/daily-worker-clothes.webp`. Item grid slots
  and the selected-item inspector display these images; any unillustrated
  future items retain typographic fallback initials. The original full-resolution
  uploads are not overwritten. No item identity, rules or attributes changed.
  These compact images are for small interface slots, not full-screen artwork.

## First-pass numerical fixtures (NOT FINAL)
| Property | Playtest value |
| --- | ---: |
| Daily Worker Clothes weight | 1.2 kg |
| Daily Worker Clothes occupied volume | 2 L |
| Daily Worker Clothes armour | 0 (owner-defined) |
| Simple Bag weight | 0.8 kg |
| Simple Bag occupied volume | 2 L |
| Simple Bag added inventory slots when equipped | 6 (owner-defined) |
| Base inventory slots without equipped bag | 4 (owner-defined) |
| Total inventory slots with equipped bag | 10 |
| Home Chest storage slots | 24 (provisional) |
| Simple Bag added carry volume (when carried) | 12 L (provisional) |
| Base pack carrying weight | 20 kg |
| Base pack volume without bag | 5 L |
| Chest weight limit | 120 kg |
| Chest volume limit | 200 L |
| Starter quality tier | 1, Crude (technical placeholder) |
| Starter durability | 100/100 (technical placeholder) |

The additive `0012_equipment_slots.sql` migration assigns persistent slots
to both starter items and updates the server-side creation trigger. It equips
only starter grants still in the pack, leaving intentionally stored items in
the chest untouched. Existing instance IDs, quantities and ownership remain
unchanged; migrated characters receive one inventory revision increment.
Rerunning the migration never duplicates gear. Item definitions retain the
stable codes `basic_clothes` and `crude_small_bag`.

The current equipment milestone covers **equip, unequip and bag slot capacity**,
not combat protection, visibility, slot layers, weapons, repairs or wear.
The owner-approved zero armour for the outfit remains descriptive/recorded
rather than creating a new combat effect.

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
**Full equipment mechanics** (weapon/armour modifiers, layering, visible
character rendering), durability degradation and repairs, trading, loot,
crafting and final balancing. Only starter wearable slots and bag storage
are implemented in this milestone.

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

## Owner interaction pass: Shift-click, dragging, equipment and bed Rest

- Click an item or occupied equipment socket to inspect it; nothing moves.
- Shift-click a pack item to place it in the home chest; Shift-click a chest
  item to retrieve it; Shift-click equipped gear to unequip to the pack.
- Drag a pack/chest item onto an empty compatible equipment socket to equip it.
  Drag a equipped item into inventory or chest to unequip/store it. Drag between
  the two storage grids to transfer. The selected inspector retains native
  buttons for the same operations (also usable with keyboard), including
  quantity input for partial stacks.
- All actions use authenticated, receipt-idempotent, revision-locked server
  transactions. No drag payload can change an item definition, its owner or
  bypass capacity constraints. Equipment slots are checked by item definition
  rather than by client labels.
- The bed uses a one-second visual black fade restricted to the room illustration,
  not the whole UI, and presents server-confirmed Rest effects in the **same
  approved framed dialogue** used elsewhere in Stage 8. A failed server request
  never displays false healing; reduced-motion users see no flashing fade.

**Migration needed for existing local databases:**
`cd platform; npm run inventory:migrate` (runs both 0011 and 0012).
Keep Docker volumes intact; restart the API afterward.

## Owner visual and derived-stat revision — Stage 8

- The home scene now uses the **entire source painting edge to edge**, with
  its display height bounded between 515 and 620 px. No side gutters, blurred
  duplicate wallpaper, or cropped objects; the image is fitted to the scene's
  responsive width and height, which may slightly change its displayed aspect
  ratio. Bed, windows, kitchen, table, and chest remain visible with their
  original image-relative interactive targets.
- Torso and Pants are **one Body socket**. The persisted
  database key remains `torso` to preserve the equipped universal outfit
  and its instance UUID. The separate `pants` slot is retired from the
  available socket list and constrained out by the additive
  `0013_equipment_stats_and_clothing.sql` migration. If historical custom
  Pants equipment exists, the migration stops explicitly rather than silently
  replacing or discarding it.
- The lower part of the Equipment card now has a server-derived summary:
  **Armor**, **equipped weapon Damage**, **Pall Protection**,
  **Ash Protection**, **Max Weight**, **Inventory Slots** and
  **Bag Volume**. Only `location='equipped'` instances contribute.
  Without an equipped weapon, Damage is displayed as an em dash rather
  than presenting fictitious unarmed damage.
- The stat columns on item definitions are `damage_rating`,
  `pall_protection`, `ash_protection` and `carry_weight_bonus_kg`.
  They default to zero and do not grant starter equipment fabricated benefits.
  Existing `armour_rating` and equipped bag storage bonuses are reused.
  `maxWeightKg` and capacities are calculated by the server; no client-side
  trust in drag/drop events or item text.
- This is an **equipment readout**, not a new combat balance pass:
  Pall/Ash mitigation, weapon combat damage, and armour calculations
  have not been connected to combat resolution by this display.
  Equipment provides its recorded values only. Future supported properties
  in the item schema include physical/ballistic/chemical/heat protection,
  toxins and infection resistance, weapon accuracy, movement penalties,
  noise, seal/filtration ratings, and condition-dependent effects. These
  are not silently treated as implemented gameplay.

Existing local databases need `npm run inventory:migrate` to apply 0013,
followed by an API restart. Character progress and possessions remain intact.

## Owner polish pass — clean equipment screen

- The equipped composite outfit socket's **visible name is Body**, a single
  word; the stable DB key is still `torso`. No separate Pants socket.
- Removed all provisional/debug commentary from the visible storage page:
  equipment carrying explanation, stat caveat, global provisional footer,
  and the text-only interaction legend. Shift-click help remains available
  as item hover titles and accessibility descriptions.
- Seven server-derived values use individual bronze-rimmed, inset dark tiles
  within a matching framed **Equipment Stats** card; no fake equipment bonus
  was added. These are display totals, not new combat rules.
- The desktop modal is wider and the character silhouette/stat card more
  compact to fit typical viewports. No visible inner scrollbar; shorter and
  narrow screens still support mouse-wheel, keyboard or touch scrolling to
  reach every action instead of clipping controls. The Journal retains its
  existing modal and content.
- The Stage 8 scene now displays the whole painting at a short height with
  no blurred gutter extensions. This favors visibility and accurate hotspots;
  aspect ratio can vary slightly with viewport dimensions.
