# Workshop object inspection — in-scene visual contract

**Owner decision, 2026-10-31.** Applies to object-based workshops and other scenes with a comparable illustrated workbench.

## Visual and interaction rule

- The owner-provided workshop artwork and the large transparent hitboxes remain intact. The player selects the *object artwork*, not a tiny icon.
- Every workbench object's **visible nameplate** uses the existing parchment/metal nine-slice dialogue-frame image. The label remains just the object's name, with readable dark ink. Do not reintroduce miniature decorative object icons.
- Object descriptions appear in a **small contextual parchment popup within the illustrated scene, beside or just above the selected object**. Do not send these descriptions to a separate full-width strip below the image.
- The popup closes when the player clicks outside it, clicks its close control, or presses Escape. Clicking another object switches to that object's details. Guther's NPC conversation hides any active object inspection.
- Popup placements are item-specific on desktop and constrained inside the illustration on narrow/mobile viewports. Long content scrolls within the popup rather than enlarging the background image or moving the workbench.
- The popup uses the approved `/ui-kit/frames/dialogue-frame-trim.png` art and existing New Standard/Bebas typography. The frame is restrained; the illustration remains the dominant surface.

## Stage-specific behavior

- **Stage 1:** Inspection remains entirely read-only. Guther's scripted dialogue, the work-paper handoff and navigation are untouched. The popup still distinguishes looking at an object from actually starting the saved job.
- **Stage 2:** The same popup shows the item's contextual description **and any permitted work actions**. Its actions still derive from the server-provided `availableActions`, stay disabled during pending operations and invoke the existing server-backed `perform` callback. No new progression, costs, XP or items are invented.
- **Stage 3 — The Missing Stamp:** The returned reference plate and cancellation slip use the **same nine-slice framed tabletop nameplates** as Stage 1–2. Their artwork and full object hitboxes remain untouched. Unlike the read-only item inspection popup, selecting evidence initiates a multi-beat, server-backed reading sequence in Guther's dialogue area; keep that authored flow intact rather than replacing it with an unrelated popup.
- **Stage 3 evidence asset scale (2026-11-01):** Keep both owner's cutout files and their existing clickable positions; enlarge their desktop display height to approximately 132–180 px, with a wider centred pair and responsive mobile sizing. Labels remain anchored below each prop.
- **All Stage 4 physical tabletop props:** The two plates/paper on the depot route, Death Register/Wage Record at Contracts, and the two records-room books all use the same shared `.workshop-object-label` class and the original `dialogue-frame-trim.png` art. No separate black rectangular label CSS or unframed branch exceptions. These location-specific interactive images continue to trigger their existing inspection and server-action paths.
- **Guther Anvil across Stages 1–3:** The visible nameplate always reads **Guther Anvil** and uses the same `dialogue-frame-trim.png` treatment as the tabletop names, via the reusable `.workshop-npc-label` class. No independent dark badge variations.
- **Stage 3 journal:** The Review Journal action belongs in the workshop scene but **outside** the dialogue box; the journal entries themselves remain outside the painted scene so opening them never enlarges the CRPG popup. Remove the under-scene disclaimer strip about wages, ordinary XP, or item awards. That statement describes payout constraints, not a player-facing objective or reward.
- Sound markers retain the approved UI/metal/paper distinction. No hover sound or repeated clicks from interacting with a label.

## Reusable implementation

- `WorkshopItemPopover.svelte`: close-on-outside-pointer/Escape, contextual positioning, accessible non-modal region, optional Svelte snippet for work actions.
- `workshop-object-labels.css`: shared nine-slice caption design.
- `WorkshopScene.svelte` and `MillhandWorkScene.svelte`: existing scene-specific art, hitboxes, descriptions and actions; both use the shared components.

The current prototype uses `stamps`, `plates`, `paper`, `hammer`. Future workshop families should extend the same pattern with their own suitable object anchors instead of adding a detached inspection panel. This is a UI convention, not an authorization to add gameplay features.

## Stage 4 transport choice (approved first implementation, 2026-11-01)

The existing persisted `SecondJobState.transport` field already stores `secured` or `smaller_loads`. Do **not** add another flag. During `CHOOSE_TRANSPORT` show each method's handling trade-off, then use the saved value when `COMPARE_DELIVERY` begins to narrate a distinct condition/alignment check for secured plates, or completeness/count check for smaller loads. The Journal records what the worker actually did, in first person. Both paths continue through the same required delivery-list mismatch and approved Depot Clerk sequence.

When the general Hauling duration/damage system is authored, secure-as-one should mean less time with more concentrated handling risk and smaller loads should mean more time with less concentrated risk. **Until numerical mechanics are explicitly approved, no random damage, guaranteed mishap, extra stamina drain, new payment or inventory change is permitted.**
