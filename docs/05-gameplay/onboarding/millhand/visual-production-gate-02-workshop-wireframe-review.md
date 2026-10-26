# The Pall — Visual Production Gate 02: Workshop interaction wireframe v0.1

**Status: V0.5 REFERENCE-MATCHED COMPACT CONVERSATION/WORKBENCH SHELL PROPOSED FOR OWNER REVIEW (2026-10-23).** The prior v0.4 in-scene floating overlay was rejected; no final UX or asset sign-off. Gate 01 was accepted by the owner **as a working scope** (“Agree for now”), not visual sign-off. The next deliverable is a deliberately unpolished Stage 2 workbench wireframe.

## Gate 02 — Owner asset and interaction correction (2026-10-26; latest direction)

**Supersedes the older idle/hover-pair rule below for the current Stage 1–2 implementation.** The owner supplied `smithingAssets.zip` and a workshop composition reference. **Use one static illustrated asset per object**; do not require different-angle hover files or animate/lift cutouts on hover. Four workshop work objects (number stamps, metal plates, council work paper and hammer) are visually identified by **compact icon-and-label controls anchored over/in front of their actual position**, like the latest reference screen. The icon is a neutral affordance, **not a hint about which action is correct**. Clicking/tapping one object opens that object's contextual inspection and available action; do not expose task actions globally before the appropriate object is selected.

**Actual supplied archive contents:** `download.webp` (opaque workshop background), `GutherAnvil_front.png`, `GutherAnvil_back.png`, `numberStamps.png`, `workshop_stock_plates_v01.png`, `councilWork.png`, and `hammer_hover.png`. The last file is **simply the provided static hammer art despite its historical filename**. The ZIP has **no separate hover pairs**. There is no need to request them, regenerate the assets, or depend on obsolete `metalPlate.png`/`hammer.png` naming.

**Layout:** Guther and the four independently positioned props remain in one contained, illustrated workshop scene; keep the CRPG-style compact dialogue and interactions within the game content region below the city header, not in an unrelated full-screen menu. On mobile, stack or reposition the interaction controls without cutting off the work objects; every icon/label is keyboard and touch accessible. No permanently baked labels or action text inside the art.

This updates presentation only. Canonical Stage 1/Stage 2 wording, mechanic branches, server-owned state, wages and XP rules are unchanged. Earlier idle/hover mockup history below is **superseded** wherever it conflicts with this 2026-10-26 correction.

## Gate 02 v0.7 — home-page content boundary and object-gated actions (2026-10-23)

**Owner's correction:** The prior modular prototype stretched the workshop, dialogue and work UI beyond the home-page's red-marked **content region under the city banner**. It also displayed player-action choices without first clicking the matching in-world asset. Both are design failures, not minor polish requests.

**Artifact prepared for review:** `The_Pall_Workshop_Contained_Interactions_v07.html` (self-contained local HTML in the conversation, using supplied modular Guther/workshop/prop assets; game engine not modified). A cropped strip of the user-supplied home-page **concept** illustrates the city banner only; its words are not new lore/game data.

**Layout requirement and measured result:** Desktop at 1440×900: workshop block sits approximately x=353–1323, y=304–877, **970×573px**, following the independent city banner at y=74–297. The entire story scene, interaction card and dialogue panel are within this single under-banner content block. The desktop main shell is constrained to 1232px rather than expanding with the browser. Mobile uses the same ordering and a scrolling compact stack, not a full-screen dialogue takeover.

**Action-discovery contract:** No persistent quick-action list or always-on “Set stamps” button. Default object inspection text is neutral. Hover swaps idle prop to the already supplied lifted-angle image, with **no circles, glows or hints identifying the correct item**. **Only clicking the actual asset** opens its detail and context-appropriate player action(s) (e.g. click number stamps → “Set the number stamps”). Completing a committed work action clears the selected object, so the next step's player-action control remains hidden until the player selects another object. Wrong-object clicks remain harmless and do not unlock a false work action. Narrative work outcomes are shown in the separate story card; the assets do not need one new image for every state. Keyboard focus remains accessible, without calling out the correct object.

**QA run:** Chromium inline-document tests at **1440×900, 390×844, 320×700**: no JS errors, no horizontal overflow. Verified manual Guther progression, no work actions before selecting an object, stamps control truly absent before clicking stamps, three bent-plate options, the faint-stamp/repair branch, and the final work-paper return. All three viewport runs reached the final demo state. These tests validate rendering and the click sequence, **not** uncoached newcomer usability.

**No canon change:** Worker number/date unknown, no invented payment, XP or combat rules. The sample city banner is visual reference reuse, not proof that unrelated sample text or statistics are canonical. Current layout and visual scale remain **pending owner approval**. No game backend, saved state, combat log or other stage changed.

## Gate 02 v0.6 — Modular illustrative assets, owner design correction (2026-10-23)

**Status: owner-defined interaction rules; assembled HTML remains a candidate requiring owner review.** The user explicitly corrected earlier requirements for literal scene simulation:

> The Pall is a text-based browser MMO. Workshop visuals should inspire and immerse, **not** reproduce every character action or player viewpoint literally. Guther can be cropped to fit; the workbench props need only **inactive/default and active/hover** artwork, with a different lifted angle on mouse hover, **no circling or correct-answer outline**.

**Already supplied complete scene kit:** `download.png` as empty bench/workshop background; `GutherAnvil_front.png` and `GutherAnvil_back.png` as portrait/cutout options; four idle/hover prop pairs: `councilWork(.png/_hover.png)`, `numberStamps(.png/_hover.png)`, `metalPlate(.png/_hover.png)`, `hammer(.png/_hover.png)`. Guther front can be cropped or masked behind the painted bench. The background and props share the painterly industrial identity sufficiently for a first UI composition; the artwork is **illustrative**, not an action-by-action simulation.

**New prototype attached to conversation:** `The_Pall_Workshop_Modular_Assets_v06.html` (one self-contained interactive HTML, compressed copies of real supplied assets embedded; original uploads untouched). The default work object is its supplied PNG, while pointer hover displays the supplied `_hover` alternate-angle image with a restrained vertical lift. Clicking/touching selects the object for the inline text-based interaction; keyboard accessible alternatives are available. No halo, ring, correct-answer pulse or fake item cards over the artwork. Stage 1 approved Guther words and the principal Stage 2 choices are included as a demo; not a server state machine or final visual sign-off.

**Art/UX boundary:** Do **not** insist that Guther lean, that hammer contact align to a plate, that bent/faint/repaired plates each have a separate commissioned illustration, or that the rendered scene track each small narrative gesture. Use the supplied ambient props and text for changing quest state. New asset variants may be requested only for a demonstrated usability/appearance need after playtesting. Preserve the compact CRPG dialogue card and readable work actions in the same shell.

**Browser verification:** Headless Chromium rendered v0.6 at 1440px and 390px with no horizontal overflow or JavaScript exceptions. It completed the demo choice path from Guther's opening through council paper, number stamps, stamping a bent plate, faint inspection, fixing the mark, final review and returning the paper. Clicking props before Guther finishes speaking does not skip his conversation. The illustrated prop alternate angles swap on hover and selection. An additional 320px smoke check is planned separately. **This is local prototype verification, not owner approval or first-time-user evidence.**

**Remaining material issues:** The supplied stamp kit includes **alphabet letters as well as numbers**; acceptable as a general workshop rack illustration, but do not describe every individual visible stamp as purely numerical. The paper's forms are decorative; any actual required worker number must be displayed dynamically in readable UI text, not invented from art. Props must remain recognizable when shrunk on mobile. The final scene composition must still be reviewed before applying it to other origins.

## Gate 02 v0.5 — owner reference matched, replacing rejected v0.4 (2026-10-23)

**Owner feedback:** “Damn it. You did nothing what I asked. Look again at the reference and do it again.” The v0.4 bottom-left popup **over the scenic artwork is rejected**. The user's latest supplied side-by-side desktop/mobile image is the target for this revision. Do not treat the earlier “floating over the scene” interpretation as more authoritative than the latest concrete screenshot.

**v0.5 review file:** `The_Pall_Gate02_Reference_Matched_v05.html` — an interactive **self-contained HTML** downloadable in this conversation. For this layout examination it uses **crops of the user's provided concept screenshot**, not a newly invented workshop illustration or production-ready game assets. Original example worker digits in the concept artwork remain **reference-only**, not game canon.

**Correct placement:**
- **Desktop:** persistent rail/top status, city banner, narrow stage header, large workshop artwork, then **two adjacent small lower panels:** left = compact Guther portrait, single current speech and selected responses; right = four work-object actions. The workshop artwork is never covered by an arbitrary 455px speech overlay. Conversation and object selection live in the same game screen, not a separate full-screen route.
- **Mobile:** header/status, stage summary, centered Guther/workbench scene, four-object strip **immediately below**, compact dialogue card **below the object strip**, bottom navigation. No floating speech card covers Guther's face.
- Work phase replaces the dialogue card with factual inspection/actions: desktop left inspection area next to object strip; mobile all three bent-plate options directly below object strip, with no dead portrait panel consuming phone height.
- **Actual approved** Stage 1 opening/pay/trust words, player-name placeholder substituted as “Player” only in this preview, Stage 2 physical interaction sequence, no invented currency. The 1.2-second real gameplay cadence is **not** simulated by this visual-layout prototype.
- Reviewer-state controls are outside the game frame instead of overlapping the work objects.

**Verification:** Chromium rendered at **1440×900, 390×844, and 320×680**. No JavaScript exceptions or horizontal overflow; completed a preview interaction from opening → wage exchange → reading work paper → setting stamps → stamping bent plate → inspecting poor mark → fixing → returning work paper at all three viewport widths. This is **functional preview verification, not a first-time-user test**.

**Creative director caveat:** The copied image contains sample number **1047** printed on the illustrated paper and stamps, which was in the owner's reference. This **cannot be made canonical** without an explicit game-data decision. Do not use it as an actual worker ID in game logic; request a source art revision or replace the prop art before final production. Another caveat is that a user-supplied concept screenshot is not an independent proof of accessible touch targets and detailed responsive production assets. Gate 02 v0.5 is **pending owner visual review**.

## Gate 02 v0.4 — Small CRPG dialogue popup, owner-requested correction (2026-10-23)

**Status: NEW PROTOTYPE FOR OWNER REVIEW, NOT SIGNED OFF.** Owner explicitly rejected v0.3's overly large conversation panel and reiterated that the Guther reference establishes a stylized painterly art direction, closer to Albion Online / WoW readable proportions. The [art-direction record](../../../00-vision/art-direction.md) now states that later rendering-style decision without changing the game's industrial setting.

**Attached artifact:** `The_Pall_Gate02_Workshop_Compact_Dialogue_v04.html` — a self-contained **local interactive HTML**, not game code or an executable server state migration. Desktop and phone PNG review captures were made from this exact HTML. The Guther illustration is the provided reference embed, while the Stage 2 workbench remains a schematic. Neither image is certified final production art.

**Specific corrections:**
- Contained dialogue box at the **bottom-left of the scene**, maximum **455 px desktop** width (36% of the scene at 1440 px) and compact mobile card. It is not a full-width dialogue section or a separate page.
- Retain the scene and Guther's face above the panel; full Stage 1 approved lines and choices in a small internally scrollable box when necessary. On 390-px phone a normal two-choice panel occupied about **32%** of the scene height; at 320 px, about **47%**. Long lines stay readable without truncation or automatic advance.
- Hide temporarily closes **only** the dialogue popup, preserving the same Guther camera. **Resume conversation** reopens the same line and responses; it does not advance the game. There is no replacement by workbench art while the dialogue is hidden.
- The workshop stage title and surrounding navigation persist in conversation mode. The other scenes stay outside this gate.
- On narrow screens, demo/reviewer-only controls collapse into a single disclosure by default, so they do not push the game interface below the viewport. Mobile bottom navigation stays visible.
- Stage 2 object inspection stays below the workshop, with the actual three bent-plate choices. No new correct-object highlight, bogus worker number or gameplay rule.
- Visual outline palette is a temporary interface proposal; full final workshop objects and other scene art must be painted in the locked Guther-compatible style **after** overlay geometry is accepted.

**Checks:** The embedded HTML was rendered by headless Chromium at **1440×900, 390×844 and 320×650** with no browser JS errors or horizontal overflow. Verified opening wage branch, longer Guther speech, its two choices, Hide/Resume without advancing, and the three Stage 2 bent-plate options. Mobile screenshot checks show the active popup within the same scene and the illustration visible above. Automated checks are **not a user playtest**. The v0.4 source is not yet in GitHub (the Markdown review record is).

**Creative-director assessment:** This corrects the concrete popup scale and interaction regression, but the **workbench itself still looks like a schematic** and is not representative stylized production art. Do not infer that overall workshop layout or finished Guther portrait is approved. The next gate after owner review is one coherent painterly workshop composition using the exact actual object list, with no invented IDs/dates.

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
