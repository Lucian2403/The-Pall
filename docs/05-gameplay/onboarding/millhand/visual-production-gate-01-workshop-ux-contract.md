# The Pall — Visual Production Gate 01: Millhand Workshop UX Contract

**Status: OWNER ACCEPTED AS WORKING SCOPE ('agree for now'), 2026-10-23 — NOT AN ART/UX SIGN-OFF.** This is one deliberately narrow decision gate, not authorization to regenerate all assets, restyle combat or implement a new version. The owner asked for strict, candid, step-by-step design review and to preserve previous approvals. This document records evaluation criteria and the next action. Acceptance of this brief must be explicit before proceeding to Stage 2 interaction wireframes.

## What we already know — do not reopen without cause

1. Project-wide aesthetic is the [approved Documentary Industrial Art Direction](../../../00-vision/art-direction.md): industrial naturalism, legible practical workspaces, believable manufacture, ordinary lighting, slight archival/engraved influence for records; no steampunk ornament, cinematic smoke, bloom or grunge obstructing information.
2. The tutorial has eight approved story stages. Millhand's current executable local builds are **functional experimental tools, not final UI**. Source ZIPs are not established as GitHub's canonical executable source.
3. The user rejects floating paper cards instead of actual physical objects, invisible required next actions, stylistically inconsistent job/combat layouts, pseudo-NPC agency and automatic dialogue advancement. These are substantive design defects, not taste-only objections.
4. Interaction navigation should be physical and spatial **where that helps**, with equivalent plain-text/keyboard access. The user explicitly rejected visually highlighting the correct object or an omnipresent “right answer” cue.
5. Dedicated Journal, Character and Inventory destinations are required; story dialogue and workshop work need distinct layouts inside a consistent shell. Approximately 1.2s reveal delay applies to meaningful committed actions, **not** read-only inspection, browsing or navigation.
6. The already approved combat presentation principles include **Action → subtype → Commit**, conspicuous resource cost, visible enemy intent, real actor resources and a compact collapsible Chronicle. The entire separate combat log and engine remain unchanged; the v0.6.1 integrated combat UI is **not visually signed off**, despite superficially restoring the pattern.
7. Stage 8 has a revised written FINAL NOTICE; the law/eviction enforcement system is **not defined**. Clinic exit resets to full baseline after the 10-coin examination (recent owner direction); this is separate from the art/UI gate.

## Critical design diagnosis

**D1 — Affordance failure:** Cards called ISSUED DOCKET / TWO ENTRIES / INTAKE COUNTER do not look like workplace items that can be used. They are menu surrogates over decorative art. The user's reason for asking for a world-facing work interface is defeated.

**D2 — Action hierarchy failure:** The player may see multiple illustrated objects, a scene title, dialogue and a separate action row without knowing which represents a command, which merely reveals information and which advances the game. A task text saying “Submit” is not enough if the submission control is hidden or requires guessing which illustrated prop is correct.

**D3 — Disjointed screen identity:** Workshop, Contracts and combat show different visual priorities. The current screen does not present the same location/status/navigation rules across modes. The world and its mechanics feel disconnected.

**D4 — Misleading polish:** A passing test or attractive rendered scene is insufficient evidence of playability. We repeatedly proceeded before human confirmation of action clarity and consistent UI behavior.

**D5 — Uncontrolled substitution:** The integrated v0.6 combat pane replaced an agreed combat UI pattern with a row of instant actions. Approval must attach to explicit requirements and be verified before another executable artifact is called a success.

## Narrow benchmark: Stage 2 — Marking the worker plates

**Why Stage 2 first:** It tests the hardest shared UX problem without needing new NPC portraits, city geography, a complete map, combat, monetization, art production or all eight scenes. The workshop already exists canonically: Guther's place of work with an actual work paper, metal plates, number stamps, hammer and bench. The player must read the paper, arrange stamps, decide what to do with a bent plate, strike, inspect and finish.

**Design question:** Can a person who has never played The Pall inspect the scene, understand the work and successfully choose the next action without hints that reveal the correct object, and without confusing decoration with controls?

### Information hierarchy — proposal, not locked geometry

1. **Where am I?** Persistent location and safe navigation always identifiable; no invented status displays.
2. **What is happening now?** One legible active instruction near the workspace, using approved plain language. It must not prematurely reveal the correct object through color, glow, arrows, animated pulsation or a forced sequence of obvious highlighted targets.
3. **What can I inspect or use?** A coherent workshop scene where bench, plates, stamps, hammer and work paper appear as physically plausible objects in sensible positions. Each genuine affordance must have a pointer/touch equivalent, visible focus state, and accessible text label/list alternative. Focus states communicate “interactable”, not “correct answer”.
4. **What did my decision do?** A concise outcome adjacent to its physical cause, reflecting true state (bent/straightened/changed/weak stamp/clear mark), then the interface returns to a stable new state. No fabricated mechanical consequence.
5. **Where is my longer record?** Journal, Inventory, Character and Conversation History remain reliable dedicated destinations. The combat Chronicle is **not** the Journal.

### Required interaction behavior — pass/fail

- At the beginning of Stage 2, a newcomer can identify a workbench and inspect a readable order without needing code words such as “die alignment” or numbered-button guesses.
- Bent plate choices—**straighten, replace, stamp as is**—are all reachable and visually distinct **after** the player examines the relevant plate. No free result, softlock or fake choice.
- A poorly stamped mark visibly differs from a readable one and offers the approved correction/replacement action, not a hidden menu or a punish-without-explanation dead end.
- Object illustrations and labels are true: only represented actual in-world items count as selectable work objects; the fake-paper-card menu pattern is prohibited.
- The interface never overlays active work targets with speech panels or overlapping action controls.
- It can be completed using mouse/touch and also keyboard with equivalent semantics, on desktop and a narrow mobile viewport.
- No decorative halos marking the next correct choice, but every valid interactive object can still be found through general affordance feedback, neutral inspection, pointer/focus and accessible names.
- Story dialogue from Stage 1 must use the same shell but a separate focused conversation state. The user advances speech deliberately; no auto-play or replacement of history with only the latest line.
- Meaningful committed action shows feedback immediately, then staged result at approximately 1.2s. Browsing is instant; duplicate requests cannot award, advance or charge twice.
- Source-of-truth mechanics remain untouched: no work pay/ordinary XP, no invented physical serial numbers, no new items.

### Objective usability evaluation

**Internal review:** annotated desktop and mobile **low-fidelity wireframes first**, not artwork. Show a normal stage, inspected object, bent plate choices, error/faint stamp, and one conversation transition. Every actionable element has a described state, purpose and click result.

**First-play without coaching:** after a one-sentence scenario premise, at least two readers who have not been involved with the design—ideally one familiar with CRPGs and one not, including a non-native English speaker where feasible—attempt to follow the job. Observe the first wrong assumption or stuck point. This is a proposed test protocol, **not a claim that such players were tested** and not a fabricated percentage target.

**Rejection conditions:** any tester repeatedly clicks decoration expecting progress, cannot locate a legal next action, misses important NPC speech, cannot distinguish inspect from commit, or finds the presented plate state inconsistent with the actual chosen action. Such problems block progressing to finished artwork. Any screen that only looks good but fails the sequence is rejected.

### Explicitly out of scope for this gate

- Final Guther portrait, commissioned asset set, colour/font selection, city world map, scenes for the three Stage 4 routes, exact final combat layout, live multiplayer infrastructure, payments/economy redesign, property mechanics or a game-wide redesign.
- New gameplay mechanics, novel tutorial rewards or new action types.
- Unasked image generation or silently changing the playable ZIP again.

## Approval discipline to prevent another drift

**Single source of truth:** keep a matrix of Requirement → source approval → design frame → implementation element → test evidence. Every visual design gets a version, owner response and a status of Proposed / Approved / Rejected / Superseded. A local screenshot or passed Node test is never treated as visual approval.

**One review at a time:** Gate 01 is approval of screen PURPOSE, required information and acceptance criteria. Gate 02 is annotated low-fidelity UX wireframe of the single workshop interaction, in desktop and mobile, incorporating the approved contract. Gate 03 is one documentary workshop asset/concept with real object-scale visibility, tested against the wireframe. Gate 04 is implementation and hands-on evaluation. Combat and other locations follow once the shared shell survives these tests.

**Design director veto:** do not proceed when interaction relies on guesswork, correct-target glow, decoration masquerading as buttons, inconsistent screen patterns, irrelevant novelty, or invented lore/mechanics. Explain precisely what failed, propose a correction and obtain explicit approval before new art and code.

**Open questions that are not to be silently invented:** exact desktop/mobile shell dimensions; whether close-up object inspection is inline or a focused detail state; portrait placement; whether object names are visible by default or on neutral hover/focus; asset orientation/crop and access to the owner's final visual references. Resolve during wireframing, not by random art generation.

## Proposed next step if Gate 01 is accepted

Design **one** annotated, low-fidelity Stage 2 workbench wireframe (desktop first, then mobile variant) featuring Guther's workshop, real props and one clearly understandable action at each state. No colour/material polish and no new executable ZIP until the interface survives critical review.
