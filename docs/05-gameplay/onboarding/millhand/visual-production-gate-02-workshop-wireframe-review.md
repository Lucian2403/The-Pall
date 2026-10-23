# The Pall — Visual Production Gate 02: Workshop interaction wireframe v0.1

**Status: MOBILE INLINE DIRECTION CHOSEN; V0.3 CONVERSATION-OVERLAY VISUAL DIRECTION PROPOSED FOR REVIEW (2026-10-23).** No final UX or art sign-off. Gate 01 was accepted by the owner **as a working scope** (“Agree for now”), not visual sign-off. The next deliverable is a deliberately unpolished Stage 2 workbench wireframe.

## v0.3 — visual-direction revision following owner references (2026-10-23)

**Owner feedback:** The prior neutral HTML wireframe did not make the intended product easy to imagine. The owner supplied two visual references: a **desktop/mobile home-page hierarchy** and a **Guther workshop conversation with a black/brass dialogue box across the lower part of the scene**. They explicitly rejected taking over the entire screen for a dialogue scene.

**New artifact:** `The_Pall_Gate02_Workshop_Visual_Direction_v03.html` (self-contained interactive HTML supplied in the project conversation). It is **a design prototype only**, not the existing server-connected Millhand game, not approved production artwork, and not a replacement for the accepted separate combat UI.

### What changed

1. **Dialogue is now a bounded overlay within the workshop illustration.** A character-facing scene remains visible above it; the name tab identifies Guther. The lower box carries one approved utterance and only available player replies. Choices and Continue advance manually; a Hide control does not advance the exchange. The demo stores the current dialogue step when hidden and reopened.
2. **The shell is now closer to the owner's homepage reference:** left navigation on desktop, limited genuine top stats (50/50 Health, 20 coins, Craftsmanship +3), restrained typography and dark timber/iron framing. The original illustrative “Focus / Ash / Day 12 / Market / Registrar / Hut C-17” from the uploaded concept has **not** been imported into canon. Unbuilt destinations are visibly inactive in this review file.
3. **Inline workbench inspection remains** and the object choices stay directly below the scene; there is no modal page for inspecting a plate. At narrow widths, selecting an object lets the workbench remain in view while the player scrolls down the inspection choices. All objects get the same neutral affordance; none is highlighted as the correct answer.
4. **Visible physical work states** are illustrated with simple plate overlays (bent, faint and clear), using no invented worker number.
5. The owner's Guther illustration was cropped to exclude the unrelated dialogue text and embedded solely as a **temporary background for the dialogue framing study**. The **metalwork environment remains an existing schematic SVG**; the two art styles are **not** a proposed final coherent set. No final Guther likeness or final forge design is approved from these references.

### Mechanical/behavioural verification

Chrome/Playwright rendered v0.3 at **1440, 390 and 320 pixels** from an inline local HTML document, with no JavaScript errors or horizontal overflow. The bent plate fixture exposed all three valid decisions and the conversation fixture exposed the two approved opening responses. The pay branch remained selectable, and the paper-reading action advanced to setting the stamps. The prototype is local client-only and saves nothing. Browser DOM verification does not prove real user comprehension.

### Creative-director findings still blocking Gate 02 sign-off

- **Scene material mismatch (major):** the illustrated Guther reference and grey practical workbench SVG have incompatible fidelity. This is tolerated only for reviewing conversation-box scale and hierarchy. Creating final UI artwork on this basis would repeat the earlier drift.
- **Mobile work scale (major):** even with sticky workshop visibility, props are visually small on a 320–390 px canvas. A neutral object-access strip mitigates tapping but may create redundant menu interactions. Test actual object recognition and successful taps with a human before accepting it.
- **Dialogue length (moderate):** Guther's long wage explanation needs internal scrolling or modest resizing on small handsets. Do not truncate the approved utterance or autoplay; real-device test is required.
- **Art-direction discipline (major):** the user's illustrative Guther image uses a stylized rendering, while the locked global direction is documentary industrial naturalism. Treat this supplied reference as **composition/UI inspiration only** unless the owner explicitly approves changing or broadening the visual doctrine.
- **Unbuilt destinations and game systems:** rail items are disabled because this is a design study. Do not use it as evidence that all navigation destinations are functional.

### Recommended next review gate (not automatically approved)

**Confirm Gate 02's conversation overlay and shared shell geometry** (including portrait framing and mobile legibility), then conduct **one representative workshop art-composition proof** where the work paper, plates, stamps, hammer and Guther are credible objects in the **same visual style**. Test object-scale interaction with the approved inline mobile UX. Only then prepare finalized assets; combat layout remains a separate already-approved interaction pattern to integrate later, not to redesign here.

This v0.3 revision is **proposed**, pending owner feedback. No narrative, combat log, story outcomes, clinic rules, rent logic or executable Millhand source was modified.

## Owner decision and v0.2 correction — 2026-10-23

**Owner instruction:** “For Gate 02, I prefer keeping the workshop visible with inline object inspection. Revise the mobile wireframe.”

**Decision accepted for this review iteration.** The **focused mobile inspection mode from v0.1 is REJECTED / SUPERSEDED**; do not refer to it as the current recommendation. This is an approval of the **inline direction**, **not** final Gate 02 layout/asset approval.

**New artifact:** `The_Pall_Gate02_Workshop_Wireframe_v02_Inline_Mobile.html` (conversation download, self-contained, no backend or asset dependencies). The workbench **never disappears** when an object is selected. Instead, the workshop compresses vertically on a narrow screen, remains visible directly above a contiguous read-only inspection and action panel, and sticks to the top of the visible area while scrolling a lengthy inspection. The selected object's outline simply denotes selection; no correct-object highlight is shown. A small Close control clears the selection. Desktop continues to show the original side-by-side inspection/action panels.

**Verified in headless Chromium:** at 390×844, 375×667 and 320×650, with Bent Plate selected, the physical workbench and all three legal bent-plate decision buttons remained visible and selectable; no horizontal overflow or browser JavaScript exceptions occurred. At 1440×900 the original desktop composition remained intact. A full mobile test path `paper → stamps → bent plate as-is → hammer → poor mark → fix mark` passed, including staged result transitions. This is test evidence for rendering and click mechanics, not evidence that a new player finds it intuitive.

**Critical next review:** the compressed mobile silhouettes are still small and crude. The workbench is visible, but it may be difficult to recognise the real difference between an object, its label and a hotspot in final art. Test at real device dimensions with a fresh reader; if the compact bench creates mis-taps, revise geometry rather than abandon the chosen inline model without owner consultation. Do not authorize final assets or a new integrated gameplay build based solely on this correction.

## Historical v0.1 deliverables and rationale

A **self-contained interactive HTML review file** was authored and provided as a conversation attachment: `The_Pall_Gate02_Workshop_Wireframe_v01.html`. It is **not** a server, runnable Millhand game, production UI or final artistic reference. Source and render proof currently exist in the conversation downloads **rather than individual GitHub source files**. Desktop/mobile screenshots were rendered for Start work, Bent-plate decision, Poor mark and Dialogue states; explanatory notes were also supplied in `Gate02_Workshop_Review_Notes.md`.

Open the HTML in a local browser. The top black **reviewer-only** row offers state jumps (Start work / Bent-plate decision / Poor mark / Dialogue). These reviewer controls are not game controls. Click an illustrated physical object to examine it; legal actions appear in the corresponding interaction panel. The review data is local, ephemeral and illustrative. No economy, persistence, gameplay save, combat or real server action is changed by this clickthrough.

## Proposed spatial hierarchy — review rather than lock

1. Persistent shell: confirmed location, limited approved character facts (Health 50/50, 20 coins, Craftsmanship +3), and destination names illustrating shell placement. Non-workshop destination links are **deliberately non-functional** and labelled as out-of-scope so they do not masquerade as implemented systems.
2. Current work: one plain-English step close to the bench, but no animated arrow, glow or highlighting of the correct next object.
3. Plausible physical bench objects (illustrative CSS/SVG silhouettes rather than floating cards): the work paper, number-stamp rack, metal plate, hammer and Guther in the workshop background. Decorative workshop details have no interaction target.
4. **Desktop:** inspection information and available actions in two adjacent panels below the still-visible workbench. Read-only inspection does not advance work. Clicking a *legal* action advances the local demonstration state and reveals its result after about 1.2 seconds.
5. **Mobile:** after selecting an object, the interface temporarily switches to a **focused inspection state** with a *Back to workbench* control; this avoids an earlier mobile wireframe problem where action choices fell below the first screen. This is the principal design choice for owner review, not a decision silently fixed in canon.
6. **Conversation:** one Guther utterance and deliberate response/Continue control in a focused layout inside the same game shell, using exact approved Stage 1 lines. No automatic dialogue.
7. Neutral labels always visible in this test. They identify actual objects, **not** the next correct choice. Whether labels remain persistent or only appear on neutral hover/focus is still open; the design recommendation is persistent labels for first-use comprehension.

## States demonstrated

- Work paper read → number stamps set → inspect bent plate.
- Three approved bent-plate choices: straighten, take another or stamp as is.
- Hammer strike and check: the as-is path produces a poor mark, allowing fix or replacement. Clear outcomes finish the plate lot and return the paper to Guther.
- The physical plate thumbnail adjusts from bent to marked/faint/clear based on review state; the worker number is purposely not invented.
- Separate Guther conversation with optional wage question and manual continuation, not mixed with work controls.

## Internal checks

Chromium was used with inline `set_content` rendering because ordinary `file://` navigation was blocked in the execution environment. Both **1440px desktop** and **390px mobile** checked states rendered with **no JavaScript errors and no horizontal page overflow**. All three bent options and both poor-mark repairs are exposed in both responsive presentations. A tested desktop as-is → poor → rework → finish path works; mobile object inspection and action selection also work, but **human first-use comprehension and complete browser play remain untested**. Automated rendering is not user approval.

## Critical limitations / rejection criteria

**Do not call this finished UI**. The room and tools are schematic gray shapes, not documentary production art; Guther's appearance and full workshop geometry are unknown. This review cannot validate actual image-scale hotspots, icon contrast in finished assets, natural perspective or audio feedback. The paper's actual worker number is still unspecified. On mobile, focused object mode could reduce spatial continuity; **this is a risk**, and users might prefer an inline detail panel instead. The two versions are not automatically approved as one responsive system.

Reject or revise Gate 02 if:
- The player cannot tell what is inspectable or how to return from object inspection;
- The mobile focus transition feels disconnected from the workbench;
- The selected object's action choices are mistaken for automatic game suggestions;
- The player cannot distinguish checking an object from doing an irreversible work action;
- The object sizes, labels or panel hierarchy obstruct reading or tapping;
- A new non-native English player gets stuck in the simple platework sequence without coaching.

No further asset generation, polishing, general world UI implementation, combat UI changes or new Millhand ZIP should happen until the owner has critically reviewed this first workshop screen.

## Explicit decision requested at this gate

**Is an object-focused detail view on mobile (with Back to workbench) the right starting approach, or should the workbench remain visible above an inline inspection panel?** The director recommends trying the focused state first for clarity and tap targets, but its loss of spatial context is a genuine trade-off.

## Next gated work

After owner feedback: correct the wireframe before developing any final workshop art; then test the same design with at least two first-time readers, including a less genre-experienced or non-native English user if available. Only on a pass move to a matching asset composition and production visual treatment, preserving approved mechanics and prose.
