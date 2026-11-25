# Independent Inventory and context windows

Inventory is part of the character HUD at every tutorial stage; the Home Chest
is a separate contextual activity available from the rented-room hotspot.

## UI architecture

- `game-window-state.ts`: in-tab, character-keyed open-window registry,
  window positions, layering and mobile foreground; never part of a save.
- `GameWindow.svelte`: consistent movable desktop shell, keyboard header
  movement, focus and dismiss control; mobile uses switchable full-screen panels.
- `InventoryWorkspace.svelte`: **one** inventory snapshot/transaction controller
  for all open windows. Operations use the existing owner-checked revisioned API.
- `InventoryWindow.svelte` and `StorageWindow.svelte`: separate views using
  `ItemGrid`, `EquipmentSlots`, `EquipmentStats` and `ItemInspection`.
  They never mutate inventory directly.

Only Inventory and Home Chest are implemented. Later contexts (Loot, NPC Trader,
Marketplace, Crafting, Repair, Player Trade, Delivery, Cargo, Organisation
Storage and Mail) must register typed window views and their OWN authoritative
business operations. The window manager must never perform generic item trades.

## Context security

`POST /api/characters/:id/inventory/storage-context` with
`{action:"open"}` issues an opaque ten-minute context after verifying account
ownership, the saved Stage VIII Home and tutorial stage. It returns a token
submitted in `x-pall-storage-context` for chest reads/transfers. Closing a
context explicitly revokes it; server expiry also protects abandoned tabs.
The storage-context table is additive and references the owning character
with `ON DELETE CASCADE`. The ordinary Inventory GET omits chest contents.

Personal equipping and returning worn gear to the pack do **not** require
Stage VIII or a storage context. Chest source/destination transactions do.

**World travel caveat:** The current eight-stage prototype has no authoritative
post-tutorial world-location/movement service. A chest session therefore proves
a verified Home unlock and short-lived room interaction, not geographical
distance to a future travel destination. When movement is introduced, opening
and authorizing contextual windows MUST additionally verify the server-side
current location and revoke contexts on travel. Never rely on browser route
state or a guessed distance for that check.

## Migration and validation

From `platform` run `npm run inventory:migrate` to install
`0023_inventory_storage_context.sql`. Existing inventory instances, equipment,
capacity calculations, currency and receipts remain unchanged.

Tests: `npm run verify:inventory`, `npm run check -w @the-pall/web`,
`npm run check:api` and real PostgreSQL Stage VI–VIII integration. Game-window
movement and cross-window dragging also require real Chromium coverage.
