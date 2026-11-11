<script lang="ts">
  import {getContext} from 'svelte';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import { tick } from "svelte";
  import type {
    MissingStampAction,
    MissingStampState,
  } from "@the-pall/game-core";
  import type { ReadableMissingStampEvidence } from "$lib/approved-stage-three";
  import {
    MISSING_STAMP_CONFRONTATION,
    MISSING_STAMP_HANDOFF,
    MISSING_STAMP_OPENING,
    CANCELLATION_NARRATION,
    PLATE_NARRATION,
    stageThreeFinding,
    MISSING_STAMP_ROUTES,
    missingStampJournal,
  } from "$lib/approved-stage-three";
  import NpcConversation from "$lib/NpcConversation.svelte";
  import ActivityLayout from "$lib/ActivityLayout.svelte";
  import "$lib/workshop-object-labels.css";
  import "$lib/pall-story-landscape.css";
  import { GUTHER_WORK_SKIP_LINE } from "$lib/approved-guther-optional";

  type Snapshot = {
    stage: number;
    tutorialStatus: string;
    state: MissingStampState;
    availableActions: MissingStampAction[];
    contentReady: boolean;
    detailsAuthored: boolean;
    slip: {
      workerNumber: string | null;
      recordedDeathDate: string | null;
    } | null;
    plate: {
      workerNumber: string | null;
      inspectionDate: string | null;
      inspectionMarkPresent: boolean;
    } | null;
    finding: ReadableMissingStampEvidence | null;
    majorSkillBonuses: Record<string, number>;
    tutorialPayout: { coins: number; ordinaryXp: number; items: number };
  };
  let {
    snapshot,
    pending,
    errorMessage,
    perform,
    continueToJob,
  }: {
    snapshot: Snapshot;
    pending: boolean;
    errorMessage: string;
    perform: (action: MissingStampAction) => Promise<void>;
    continueToJob: () => void;
  } = $props();

  let talkingOptional = $state(false);
  let inspectedView = $state<"slip" | "plate" | null>(null);
  // Local reading pages only. Inspect actions, dialogue and route saves remain
  // server-owned; navigating between these pages changes no saved progress.
  let evidencePage = $state(0);
  // Present the route briefing and route choices as separate local beats.
  // This never rewrites the saved Missing Stamp phase or automatically selects a route.
  let decisionStep = $state<0 | 1>(0);
  let journalOpen = $state(false);
  // The persistent corner control is owned by TutorialShell, not this dialogue.
  const registerSceneJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  $effect(()=>{
    registerSceneJournal?.({id:'stage-three-journal',open:journalOpen,toggle:()=>{void toggleJournal();}});
    return ()=>registerSceneJournal?.(null);
  });
  let sceneElement: HTMLDivElement | undefined;
  let journalElement: HTMLElement | undefined;

  // The journal lives outside the workshop scene. Expanding it must never
  // enlarge the NPC's small dialogue popup or push objects beneath it.
  async function toggleJournal() {
    journalOpen = !journalOpen;
    await tick();
    if (journalOpen)
      journalElement?.scrollIntoView({ block: "start", behavior: "smooth" });
    else sceneElement?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  const state = $derived(snapshot.state);
  $effect(() => {
    if (state.phase !== "DECISION") decisionStep = 0;
  });
  const beat = $derived(
    MISSING_STAMP_CONFRONTATION[state.dialogueIndex] ?? null,
  );
  const journal = $derived(
    missingStampJournal(state, snapshot.finding, snapshot.slip, snapshot.plate),
  );
  const branchCopy = $derived(
    state.branch ? MISSING_STAMP_ROUTES[state.branch] : null,
  );
  const canAct = (a: MissingStampAction) =>
    snapshot.availableActions.includes(a) && !pending;
  async function inspect(which: "slip" | "plate") {
    if (
      state.phase === "CONFRONT" ||
      state.phase === "DECISION" ||
      state.phase === "RESTAMP"
    )
      return;
    talkingOptional = false;
    inspectedView = which;
    evidencePage = 0;
    const act =
      which === "slip" ? "read_cancellation_slip" : "turn_returned_plate";
    if (canAct(act)) await perform(act);
  }
</script>

<section class="workshop" aria-label="Millhand Stage 3 The Missing Stamp">
  <div class="scene" bind:this={sceneElement}>
  <!-- Same scene layout as Stages 1-2: the workbench (with the evidence on
       its tabletop) is the stage; the dialogue is the adjacent reading column. -->
  <ActivityLayout mode="scene" stageAspect={2} class="pall-story-sections">
  {#snippet stage()}
  <div class="scene-visuals pall-story-visuals">
    <div class="illustration pall-story-landscape">
      <img
        class="environment"
        src="/workshop/environment.webp"
        alt="Guther's smithing workshop"
      />
      <img
        class="guther"
        src="/workshop/guther-front.webp"
        alt="Guther Anvil"
      />
      <!-- Reuse the same background pixels as an occluding foreground table. -->
      <img
        class="environment bench-foreground"
        src="/workshop/environment.webp"
        alt=""
        aria-hidden="true"
      />
      <button
        type="button"
        class="npc-hotspot"
        disabled={state.phase === "CONFRONT" || state.phase === "DECISION"}
        onclick={() => {
          talkingOptional = true;
          inspectedView = null;
        }}
        aria-label="Speak to Guther Anvil"
      >
        <span class="workshop-npc-label">Guther Anvil</span>
      </button>
        <div class="evidence" aria-label="Council evidence on the bench">
          <button
            type="button"
            class:seen={state.plateRead}
            data-workshop-object data-pall-sfx="click"
            aria-pressed={inspectedView === "plate"}
            disabled={state.phase === "CONFRONT" ||
              state.phase === "DECISION" ||
              state.phase === "RESTAMP"}
            onclick={() => {
              void inspect("plate");
            }}
          >
            <img
              class="evidence-art"
              src="/workshop/returned-reference-plate.webp"
              alt=""
              aria-hidden="true"
            /><span class="workshop-object-label evidence-label"
              >Returned plate</span
            >
          </button>
          <button
            type="button"
            class:seen={state.slipRead}
            data-workshop-object data-pall-sfx="paper"
            aria-pressed={inspectedView === "slip"}
            disabled={state.phase === "CONFRONT" ||
              state.phase === "DECISION" ||
              state.phase === "RESTAMP"}
            onclick={() => {
              void inspect("slip");
            }}
          >
            <img
              class="evidence-art"
              src="/workshop/cancellation-slip.webp"
              alt=""
              aria-hidden="true"
            /><span class="workshop-object-label evidence-label"
              >Cancellation slip</span
            >
          </button>
        </div>
    </div>
  </div>
  {/snippet}
  {#snippet panel()}
  <div class="reading-column pall-story-dialogue-section">
    <aside
      class="dialogue"
      class:record-view={(state.phase === "INSPECT" ||
        state.phase === "READY_TO_SPEAK") &&
        inspectedView !== null &&
        evidencePage === 1 &&
        !talkingOptional}
      class:route-choice={state.phase === "DECISION" &&
        decisionStep === 1 &&
        !talkingOptional}
      aria-label="The Missing Stamp dialogue"
    >
      {#if talkingOptional}
        <NpcConversation
          origin="Millhand"
          close={() => {
            talkingOptional = false;
          }}
        />
      {:else}
        <p class="eyebrow">THE MISSING STAMP · STAGE 3</p>
        {#if state.phase === "INSPECT" || state.phase === "READY_TO_SPEAK"}
          {#if !state.slipRead && !state.plateRead && !inspectedView}
            <p class="speaker">Guther</p>
            <p class="speech">“{MISSING_STAMP_HANDOFF}”</p>
            <p class="story">{MISSING_STAMP_OPENING}</p>
            <p class="hint">
              Select the returned plate or folded slip on the workbench.
            </p>
          {:else if inspectedView && evidencePage === 0}
            <!-- Part 1: the object is read. Do not stack its record and finding here. -->
            <p class="story">
              {inspectedView === "slip"
                ? CANCELLATION_NARRATION
                : PLATE_NARRATION}
            </p>
            {#if (inspectedView === "slip" && state.slipRead) || (inspectedView === "plate" && state.plateRead)}
              <div class="choices">
                <button
                  type="button"
                  onclick={() => {
                    evidencePage = 1;
                  }}>Continue</button
                >
              </div>
            {:else}
              <p class="hint">Examining the council paper…</p>
            {/if}
          {:else if inspectedView && evidencePage === 1}
            <!-- Part 2: the record itself. Identifiers stay in UI, not painted on art. -->
            {#if inspectedView === "slip" && snapshot.slip}
              {#if snapshot.slip.workerNumber || snapshot.slip.recordedDeathDate}
                <!-- Actual authored values must remain live text, never conflict
                     with the generic wording painted on the owner's artwork. -->
                <div class="record" aria-label="Cancellation slip">
                  <strong>CANCELLATION SLIP</strong>
                  <p>
                    Recorded as: Dead after a workshop fire with locked doors.
                  </p>
                  <p>
                    Worker number: {snapshot.slip.workerNumber ??
                      "Present on the original record"}
                  </p>
                  <p>
                    Recorded death date: {snapshot.slip.recordedDeathDate ??
                      "Dated in the council record"}
                  </p>
                </div>
              {:else}
                <figure class="record-illustration">
                  <img
                    src="/workshop/cancellation-slip-record.webp"
                    alt="Cancellation slip. Recorded as dead after a workshop fire with locked doors. Worker number present on the original record. Death date recorded in the council record."
                  />
                </figure>
              {/if}
            {:else if inspectedView === "plate" && snapshot.plate}
              {#if snapshot.plate.workerNumber || snapshot.plate.inspectionDate}
                <div class="record" aria-label="Returned reference plate">
                  <strong>RETURNED REFERENCE PLATE</strong>
                  <p>
                    Worker number: {snapshot.plate.workerNumber ??
                      "Stamped into the plate"}
                  </p>
                  <p>
                    Council inspector's mark: Present, separate from your
                    stamping.
                  </p>
                  <p>
                    Inspection date: {snapshot.plate.inspectionDate ??
                      "Dated beside the mark"}
                  </p>
                </div>
              {:else}
                <figure class="record-illustration">
                  <img
                    src="/workshop/returned-reference-plate-record.webp"
                    alt="Returned reference plate. Worker number stamped into the metal. Council inspector's mark present. Inspection date stamped beside the mark."
                  />
                </figure>
              {/if}
            {/if}
            {#if snapshot.finding}
              <div class="choices">
                <button
                  type="button"
                  onclick={() => {
                    evidencePage = 2;
                  }}>Continue</button
                >
              </div>
            {:else}
              <p class="hint">
                Inspect the other evidence object on the workbench.
              </p>
            {/if}
          {:else if snapshot.finding}
            <!-- Part 3: one concise finding with the real server-owned action. -->
            <p class="instruction">Both records have been examined.</p>
            <p class="finding">{stageThreeFinding(snapshot.finding)}</p>
            <p class="finding">
              Dead before the inspection? Then what the hell's his number doing
              here?
            </p>
            <div class="choices">
              <button
                type="button"
                disabled={!canAct("show_guther")}
                onclick={() => {
                  void perform("show_guther");
                }}
              >
                Show Guther the papers
              </button>
            </div>
          {:else}
            <p class="story">{MISSING_STAMP_OPENING}</p>
            <p class="hint">
              Inspect the other evidence object on the workbench.
            </p>
          {/if}
        {:else if state.phase === "CONFRONT" && beat}
          <p class="speaker">
            {beat.speaker === "Player" ? "You" : beat.speaker}
          </p>
          <p
            class:stage-narration={"kind" in beat && beat.kind === "narration"}
            class="speech"
          >
            {"kind" in beat && beat.kind === "narration"
              ? beat.text
              : "“" + beat.text + "”"}
          </p>
          <div class="choices">
            <button
              type="button"
              disabled={!canAct("continue_dialogue")}
              onclick={() => {
                void perform("continue_dialogue");
              }}>Continue</button
            >
            <button
              type="button"
              class="leave"
              disabled={!canAct("skip_confrontation")}
              onclick={() => {
                void perform("skip_confrontation");
              }}>{GUTHER_WORK_SKIP_LINE}</button
            >
          </div>
        {:else if state.phase === "DECISION"}
          {#if decisionStep === 0}
            <p class="story">
              You put the returned plate and the cancellation slip before
              Guther. He cannot approve the lot. Decide what you will do next.
            </p>
            <div class="choices">
              <button
                type="button"
                onclick={() => {
                  decisionStep = 1;
                }}>Continue</button
              >
            </div>
          {:else}
            <p class="instruction">Choose what you will do next.</p>
            <div class="choices">
              {#each ["restamp", "contracts", "records"] as route (route)}
                {@const copy =
                  MISSING_STAMP_ROUTES[
                    route as keyof typeof MISSING_STAMP_ROUTES
                  ]}
                {@const action = ("choose_" + route) as MissingStampAction}
                <button
                  type="button"
                  disabled={!canAct(action)}
                  onclick={() => {
                    void perform(action);
                  }}
                >
                  “{copy.choice}” <span class="route">{copy.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        {:else if branchCopy}
          <p class="speaker">Guther</p>
          <p class="speech">“{branchCopy.response}”</p>
          <p class="story">{branchCopy.consequence}</p>
          {#if state.phase === "RESTAMP"}
            <p class="instruction">
              Make one more worker-number mark. Do not touch the council
              inspector's mark.
            </p>
            <div class="choices">
              <button
                type="button"
                disabled={!canAct("restamp_worker_number")}
                onclick={() => {
                  void perform("restamp_worker_number");
                }}>Stamp the worker number again</button
              >
            </div>
          {:else if state.phase === "SELECTED"}
            <div class="choices">
              <button type="button" onclick={continueToJob}>
                {state.branch === "restamp"
                  ? "Take the plates to the depot"
                  : state.branch === "contracts"
                    ? "Go to the Contracts office"
                    : "Go to the records room"}
              </button>
            </div>
          {/if}
          <p class="skill">
            Route: {branchCopy.label}. The associated Major Skill received +1 on
            the saved route choice.
          </p>
        {/if}
        {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
        {#if pending}<p role="status" class="hint">Saving…</p>{/if}
      {/if}
    </aside>
  </div>
  {/snippet}
  </ActivityLayout>
  </div>
  {#if journalOpen}
    <section
      id="stage-three-journal"
      class="journal-panel"
      bind:this={journalElement}
      aria-label="The Missing Stamp journal"
    >
      <div class="journal-heading">
        <div>
          <span class="journal-kicker">WORKER'S JOURNAL</span>
          <h2>The Missing Stamp</h2>
        </div>
        <button
          type="button"
          class="journal-toggle"
          onclick={() => {
            void toggleJournal();
          }}>Close journal</button
        >
      </div>
      <div class="journal-entries">
        {#each journal as entry, i (i)}
          <p>{entry}</p>
        {/each}
      </div>
    </section>
  {/if}
</section>

<style>
  .workshop {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    width: 100%;
    color: #efdecb;
    font-family: var(--pall-font-reading, Georgia, serif);
  }
  /* Same native 2:1 workbench stage as Stages 1-2: Guther, the bench
     occluder and the evidence anchors stay on the painted tabletop at any
     size. The dialogue is the adjacent, content-height reading column. */
  .illustration {
    position: relative;
    width: 100%;
    aspect-ratio: 2 / 1;
    overflow: hidden;
    background: #291d15;
  }
  .environment {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  /* The lower figure is clipped at the painted workbench line, revealing the
     actual background tabletop in front of him. No fake opaque table overlay. */
  .guther {
    position: absolute;
    top: 6%;
    left: 11%;
    height: 112%;
    width: auto;
    max-width: none;
    object-fit: contain;
    pointer-events: none;
    z-index: 1;
  }
  .bench-foreground {
    z-index: 2;
    clip-path: inset(70% 0 0 0);
  }
  .npc-hotspot {
    position: absolute;
    z-index: 4;
    top: 12%;
    left: 12%;
    width: 25%;
    height: 50%;
    display: flex;
    align-items: end;
    justify-content: center;
    background: none;
    border: 0;
    padding: 0 0 10px;
    color: #f7dfb6;
    cursor: pointer;
  }
  .npc-hotspot:disabled {
    cursor: default;
    opacity: 0.7;
  }
  /* The image itself is the prop and hit target. Only the small nameplate is framed. */
  /* Anchor the full clickable cutouts to the actual foreground wood instead
     of a row margin that shifts when the scene becomes shorter. */
  /* Larger cutouts, same centred pair and tabletop anchor as before. */
  .evidence {
    position: absolute;
    z-index: 4;
    left: 24%;
    bottom: 3%;
    width: 52%;
    display: flex;
    align-items: end;
    justify-content: center;
    gap: clamp(12px, 2.2vw, 26px);
    margin: 0;
  }
  .evidence button {
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: center;
    gap: 3px;
    flex: 1;
    min-width: 0;
    margin: 0;
    padding: 0;
    background: transparent;
    border: 0;
    color: #f3dfc1;
    cursor: pointer;
    font: 13px/1.3 var(--pall-font-reading, Georgia, serif);
  }
  .evidence-art {
    display: block;
    object-fit: contain;
    width: 100%;
    height: clamp(64px, 13cqi, 180px);
    pointer-events: none;
    filter: drop-shadow(0 5px 6px #0009);
    transform-origin: center 70%;
    transition: transform 160ms ease-out;
  }
  .evidence button:is(:hover, :focus-visible):not(:disabled) .evidence-art {
    transform: scale(1.018);
  }
  .evidence button .evidence-label {
    width: 100%;
    max-width: 240px;
  }
  .evidence button:focus-visible {
    outline: 2px solid #f2d28f;
    outline-offset: 3px;
  }
  .evidence button:disabled {
    opacity: 1;
    cursor: default;
  }
  .evidence button:disabled .evidence-label {
    opacity: 0.7;
  }
  .reading-column {
    flex-direction: column;
    align-items: stretch;
  }
  .dialogue {
    position: relative;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    max-height: none;
    overflow: visible;
    color: #251910;
  }
  .eyebrow {
    font: 600 11px sans-serif;
    letter-spacing: 0.12em;
    color: #614029;
    margin: 0 0 12px;
  }
  .story,
  .speech,
  .finding {
    font-size: var(--dialogue-text, 17px);
    line-height: 1.55;
    margin: 0 0 13px;
  }
  .speaker {
    font: 600 12px sans-serif;
    letter-spacing: 0.08em;
    color: #6b462a;
    margin-bottom: 8px;
  }
  .stage-narration {
    font-style: italic;
  }
  .instruction {
    font-weight: bold;
    font-size: var(--dialogue-text, 17px);
    line-height: 1.4;
    margin: 14px 0;
  }
  .choices {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-top: 13px;
  }
  .choices button {
    width: 100%;
    padding: 10px 12px;
    min-height: 40px;
    text-align: left;
    font: var(--dialogue-text, 17px)/1.4 var(--pall-font-reading, Georgia, serif);
    border: 1px solid #6d5235;
    background: #241d16;
    color: #f7e6c9;
    cursor: pointer;
  }
  .choices button:hover:not(:disabled),
  .choices button:focus-visible {
    background: #423022;
    outline: 2px solid #c49d65;
    outline-offset: 1px;
  }
  .choices button:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .choices .leave {
    background: #503c29;
  }
  .route {
    display: block;
    width: fit-content;
    max-width: 100%;
    box-sizing: border-box;
    margin-top: 5px;
    padding: 2px 8px;
    background: #49301d;
    border: 1px solid #63472a;
    color: #fff1d7;
    font: 600 12px/1.45 sans-serif;
    opacity: 1;
    text-shadow: none;
  }
  /* Owner's printed evidence art replaces the beige information cards.
     Preserve aspect ratio and keep the existing three-page dialogue height. */
  /* The printed plate and slip are their own short reading beat. Keep the
     document legible, centred and entirely above the physical tabletop props. */
  .dialogue.record-view {
    max-height: none;
    overflow: visible;
  }
  /* Three equally available route choices fit without nesting a scrollbar or
     enlarging the workshop. The preceding narration is its own Continue beat. */
  .dialogue.route-choice .instruction {
    margin: 0 0 8px;
  }
  .dialogue.route-choice .choices {
    margin-top: 4px;
    gap: 5px;
  }
  .dialogue.route-choice .route {
    margin-top: 3px;
  }
  .record-illustration {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 5px;
    width: 100%;
    max-width: 100%;
  }
  .record-illustration img {
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 240px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px #291b1533);
  }
  .record {
    margin: 12px 0;
    padding: 12px;
    border: 1px solid #a88f6d;
    background: #e5d1a9;
    font: 13px/1.4 sans-serif;
  }
  .record strong {
    font-size: 12px;
    letter-spacing: 0.04em;
  }
  .record p {
    margin: 6px 0;
  }
  .hint,
  .skill {
    font: 12px/1.45 sans-serif;
    color: #614e39;
  }
  .journal-outside {
    position:absolute;z-index:7;top:10px;right:clamp(8px,1vw,18px);
    max-width:10.5%;min-width:100px;min-height:40px;white-space:normal;
  }
  .journal-toggle {
    box-sizing:border-box;min-height:40px;padding:3px 8px;
    border:solid transparent;border-width:10px 17px 9px;
    border-image-source:url('/ui-kit/buttons/button-normal-trim.png');
    border-image-slice:50 180 45 180 fill;border-image-width:10px 17px 9px;
    border-image-repeat:stretch;border-radius:0;background:transparent;
    color:#2e1d11;cursor:pointer;
    font:600 15px/1.3 var(--pall-font-reading,Georgia,serif);
  }
  .journal-toggle:hover,.journal-toggle:focus-visible {
    border-image-source:url('/ui-kit/buttons/button-hover-trim.png');color:#24170d;
  }
  .journal-toggle:active{border-image-source:url('/ui-kit/buttons/button-pressed-trim.png')}
  .journal-toggle:focus-visible{outline:2px solid #efd092;outline-offset:2px}
  /* A separate page-flow journal: it cannot stretch the floating dialogue
     or move the tabletop props. The page scrolls; neither panel has a scrollbar. */
  .journal-panel {
    width: 100%;
    box-sizing: border-box;
    padding: 19px clamp(16px, 4vw, 46px) 25px;
    background: #e8d6b6;
    color: #24160e;
    border-top: 2px solid #9a7147;
    font-synthesis: weight;
  }
  .journal-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    max-width: 930px;
    margin: 0 auto 15px;
  }
  .journal-kicker {
    font: 700 14px/1.25 var(--pall-font-label, "Arial Narrow", sans-serif);
    letter-spacing: 0.09em;
    color: #47301d;
  }
  .journal-heading h2 {
    font: 600 24px/1.25 var(--pall-font-reading, Georgia, serif);
    color: #25170f;
    margin: 6px 0 0;
  }
  .journal-entries {
    max-width: 930px;
    margin: 0 auto;
    font: 600 16px/1.55 var(--pall-font-reading, Georgia, serif);
    color: #24160e;
  }
  .journal-entries p {
    margin: 9px 0;
  }
  .error {
    font: 13px/1.4 sans-serif;
    color: #873523;
  }
  /* Narrow stage (phones, or a narrow column): the original 4:3 close crop
     keeps Guther and both evidence props large enough to tap. */
  @container activity-stage (max-width: 600px) {
    .illustration {
      aspect-ratio: 4/3;
    }
    .environment {
      object-position: 39% center;
    }
    .guther {
      height: 86%;
      left: -5%;
      top: 2%;
    }
    .bench-foreground {
      object-position: 39% center;
    }
    .npc-hotspot {
      left: 0;
      top: 7%;
      width: 41%;
      height: 49%;
    }
    .evidence {
      left: 12%;
      bottom: 4%;
      width: 76%;
      gap: 7px;
    }
    .evidence-art {
      height: clamp(56px, 24cqi, 142px);
    }
  }
  @container activity-panel (max-width: 480px) {
    .record-illustration img {
      max-height: 300px;
    }
  }
  @media (max-width: 700px) {
    .journal-heading h2 {
      font-size: 20px;
    }
    .journal-entries {
      font-size: 14px;
    }
  }
  @media (max-width: 375px) {
    .journal-heading {
      align-items: start;
    }
    .journal-heading h2 {
      font-size: 18px;
    }
  }
</style>
