# The Pall — Visual Production Gate 02: Workshop interaction wireframe v0.1

**Status: MOBILE INLINE INTERACTION DIRECTION CHOSEN BY OWNER (2026-10-23); V0.2 REVISION FOR REVIEW.** The detailed wireframe is not yet approved. Gate 01 was accepted by the owner **as a working scope** (“Agree for now”), not visual sign-off. The next deliverable is a deliberately unpolished Stage 2 workbench wireframe.

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
