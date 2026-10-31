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
- Sound markers retain the approved UI/metal/paper distinction. No hover sound or repeated clicks from interacting with a label.

## Reusable implementation

- `WorkshopItemPopover.svelte`: close-on-outside-pointer/Escape, contextual positioning, accessible non-modal region, optional Svelte snippet for work actions.
- `workshop-object-labels.css`: shared nine-slice caption design.
- `WorkshopScene.svelte` and `MillhandWorkScene.svelte`: existing scene-specific art, hitboxes, descriptions and actions; both use the shared components.

The current prototype uses `stamps`, `plates`, `paper`, `hammer`. Future workshop families should extend the same pattern with their own suitable object anchors instead of adding a detached inspection panel. This is a UI convention, not an authorization to add gameplay features.
