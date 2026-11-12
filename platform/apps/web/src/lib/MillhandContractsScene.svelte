<script lang="ts">
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {getContext} from 'svelte';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';
  import { tick } from "svelte";
  import type { SecondJobAction, SecondJobState } from "@the-pall/game-core";
  import {
    STAGE_FOUR_ROUTES,
    STAGE_FOUR_DIALOGUE,
    STAGE_FOUR_INSTRUCTIONS,
    STAGE_FOUR_ACTION_LABELS,
    STAGE_FOUR_OUTCOMES,
    STAGE_FOUR_FINAL,
    secondJobJournal,
  } from "$lib/approved-stage-four";
  import "$lib/workshop-object-labels.css";
  import "$lib/pall-story-landscape.css";
  import ActivityLayout from "$lib/ActivityLayout.svelte";
  import StageFourNextStep from "$lib/StageFourNextStep.svelte";

  type Snapshot = {
    stage: number;
    tutorialStatus: string;
    state: SecondJobState;
    availableActions: SecondJobAction[];
    tutorialPayout: { coins: number; ordinaryXp: number; items: number };
  };
  let {
    snapshot,
    pending,
    errorMessage,
    perform,
  }: {
    snapshot: Snapshot;
    pending: boolean;
    errorMessage: string;
    perform: (action: SecondJobAction) => Promise<void>;
  } = $props();

  const state = $derived(snapshot.state);
  // Leave is rendered by the shared location exit, not in the work-action list.
  const workActions = $derived(snapshot.availableActions.filter(action=>action!=='leave_location'));
  const speaking = $derived(state.phase === "CONTRACTS_DIALOGUE");
  const beat = $derived(
    speaking ? STAGE_FOUR_DIALOGUE.contracts[state.dialogueIndex] : null,
  );
  const result = $derived(
    state.lastAction ? STAGE_FOUR_OUTCOMES[state.lastAction] : null,
  );
  const instruction = $derived(
    state.phase === "EXAMINE_PAPER"
      ? "You have the disputed work paper. Check the register on the counter."
      : state.phase === "COMPARE_RECORDS"
        ? "Compare the second book with what you have just examined."
        : STAGE_FOUR_INSTRUCTIONS[state.phase],
  );
  const journal = $derived(secondJobJournal(state));

  // Only two owner-supplied physical props. The approved compensation/charge
  // comparison remains in the dialogue, not painted onto these book images.
  let inspected = $state<"death" | "wage" | null>(null);
  let inspectionNote = $state<string | null>(null);
  let journalOpen = $state(false);
  // The persistent corner control is owned by TutorialShell, not this dialogue.
  const registerSceneJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  $effect(()=>{
    registerSceneJournal?.({id:'contracts-job-journal',open:journalOpen,toggle:()=>{void toggleJournal();}});
    return ()=>registerSceneJournal?.(null);
  });
  let journalElement: HTMLElement | undefined;

  // Each record must be physically selected. The existing server-owned actions
  // remain authoritative; clicking the wrong book never performs one.
  function inspect(which: "death" | "wage") {
    if (pending) return;
    inspected = which;
    if (state.phase === "EXAMINE_PAPER") {
      if (
        which === "death" &&
        snapshot.availableActions.includes("examine_work_paper")
      ) {
        inspectionNote = null;
        void perform("examine_work_paper");
      } else {
        inspectionNote =
          "This is the later record. First check the worker’s earlier entry.";
      }
      return;
    }
    if (state.phase === "COMPARE_RECORDS") {
      if (
        which === "wage" &&
        snapshot.availableActions.includes("compare_official_records")
      ) {
        inspectionNote = null;
        void perform("compare_official_records");
      } else {
        inspectionNote =
          "You have already examined this book. Compare its entry with the other record.";
      }
      return;
    }
    inspectionNote =
      which === "death"
        ? "An open council register with ruled pages worn by use."
        : "An open council wage book with rows prepared for written entries.";
  }
  async function toggleJournal() {
    journalOpen = !journalOpen;
    await tick();
    if (journalOpen)
      journalElement?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
</script>

<section
  class="second-job contracts-job"
  aria-label="Disputed Docket, Commerce and Contracts Stage 4"
>
  <!-- Shared scene layout: the Council Contracts office painting with its two counter books is
       the stage (2:1); the room's dialogue is the content-height reading column. -->
  <ActivityLayout mode="scene" stageAspect={2} class="contracts-scene pall-story-sections">
  {#snippet stage()}
  <div class="scene-visuals pall-story-visuals">
  <div class="room-stage pall-story-landscape">
    <div
      class="office-art"
      role="img"
      aria-label="Council Contracts office with bookshelves, a record desk, filing cabinets and a tall arched window"
    ></div>

    <div
      class="record-props"
      aria-label="Books on the Contracts office counter"
    >
      <button
        type="button"
        class="record-prop death"
        class:chosen={inspected === "death"}
        aria-pressed={inspected === "death"}
        aria-label="Inspect the Death Register"
        disabled={pending}
        onclick={() => inspect("death")}
      >
        <img
          src="/locations/contracts/death-register.webp"
          alt=""
          aria-hidden="true"
        />
        <span class="workshop-object-label">Death register</span>
      </button>
      <button
        type="button"
        class="record-prop wage"
        class:chosen={inspected === "wage"}
        aria-pressed={inspected === "wage"}
        aria-label="Inspect the Wage Record"
        disabled={pending}
        onclick={() => inspect("wage")}
      >
        <img
          src="/locations/contracts/wage-record.webp"
          alt=""
          aria-hidden="true"
        />
        <span class="workshop-object-label">Wage record</span>
      </button>
    </div>
  </div>
  </div>
  {/snippet}
  {#snippet panel()}
  <div class="reading-column pall-story-dialogue-section">
    <aside class="work-dialogue" aria-label="Contracts office interaction">
      <p class="eyebrow">DISPUTED DOCKET · STAGE 4</p>
      {#if state.revision === 0}
        <p class="context">{STAGE_FOUR_ROUTES.contracts.entry}</p>
      {/if}
      {#if (state.phase === "DONE" || state.phase === "EXITED")}
        <p class="outcome">{STAGE_FOUR_FINAL.contracts}</p>
        <StageFourNextStep {snapshot} {pending} {perform} />
      {:else if speaking && beat}
        <p class="speaker">
          {dialogueSpeakerLabel(beat.speaker)}
        </p>
        <p class="speech">“{beat.text}”</p>
      {:else}
        {#if result}
          <p class="result">{result}</p>
        {/if}
        {#if result !== instruction}
          <p class="instruction">{instruction}</p>
        {/if}
        {#if state.phase === "SPEAK_CONTRACTS" || state.phase === "CHOOSE_CHALLENGE"}
          <p class="context">Dead in one record, working in the other.</p>
        {/if}
      {/if}

      {#if inspectionNote && inspected}
        <div class="inspection" aria-live="polite">
          <strong
            >{inspected === "death" ? "Death register" : "Wage record"}</strong
          >
          <p>{inspectionNote}</p>
        </div>
      {/if}

      {#if state.phase === "EXAMINE_PAPER" || state.phase === "COMPARE_RECORDS"}
        <p class="prop-hint">Select a book on the counter to examine it.</p>
      {:else if workActions.length > 0}
        <div class="actions" aria-label="Available Contracts actions">
          {#each workActions as action (action)}
            <button
              type="button"
              disabled={pending}
              onclick={() => {
                inspected = null;
                inspectionNote = null;
                void perform(action);
              }}
            >
              {STAGE_FOUR_ACTION_LABELS[action]}
            </button>
          {/each}
        </div>
      {/if}
      {#if errorMessage}<p role="alert" class="error">{errorMessage}</p>{/if}
      {#if pending}<p role="status" class="saving">Saving the work…</p>{/if}
    </aside>
  </div>
  {/snippet}
  </ActivityLayout>

  {#if journalOpen}
    <section
      id="contracts-job-journal"
      class="journal"
      bind:this={journalElement}
      aria-label="Disputed Docket personal journal"
    >
      <header class="journal-head">
        <div>
          <small>PERSONAL JOURNAL</small>
          <h2>Disputed Docket</h2>
        </div>
        <button
          type="button"
          class="journal-button"
          onclick={() => {
            void toggleJournal();
          }}>Close journal</button
        >
      </header>
      {#if journal.length}
        {#each journal as entry, i (i)}<p>{entry}</p>{/each}
      {:else}
        <p>You have not recorded any findings from this job yet.</p>
      {/if}
    </section>
  {/if}
</section>

<style>
  .contracts-job {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-family: var(--pall-font-reading, Georgia, serif);
  }
  .room-stage {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    aspect-ratio: 2 / 1;
    min-width: 0;
    background: #322720;
  }
  /* Shared 2:1 stage. The office painting (2039x771) covers it centred,
     close to the previous crop, so the books stay on the painted counter. */
  .office-art {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: url("/locations/contracts/contracts-office.webp") no-repeat
      center 50% / cover;
  }
  .record-props {
    position: absolute;
    z-index: 2;
    left: 2.5%;
    bottom: 8%;
    width: 54%;
    height: 36%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2%;
  }
  .record-prop {
    appearance: none;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: #f3e3ca;
    cursor: pointer;
    font: 14px/1.25 var(--pall-font-reading, Georgia, serif);
  }
  .record-prop.death {
    width: 49%;
  }
  .record-prop.wage {
    width: 49%;
  }
  .record-prop img {
    display: block;
    width: 100%;
    height: calc(100% - 45px);
    object-fit: contain;
    pointer-events: none;
    transform-origin: center 77%;
    filter: drop-shadow(0 4px 5px #100c08ae);
    transition: transform 150ms ease-out;
  }
  .record-prop:is(:hover, :focus-visible) img {
    transform: scale(1.018);
  }
  .record-prop .workshop-object-label {
    width: 100%;
    max-width: 240px;
  }
  .record-prop:focus-visible {
    outline: 2px solid #e6bb83;
    outline-offset: 2px;
  }
  /* Reading column: content-height, never an internal scrollbar. */
  .reading-column {
    flex-direction: column;
    align-items: stretch;
  }
  .work-dialogue {
    position: relative;
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
    max-height: none;
    overflow: visible;
    margin: 0;
    padding: 15px 18px;
    background: #ead9b9;
    color: #25180f;
    border: 2px solid #795637;
    box-shadow: 0 7px 18px #0008;
  }
  .eyebrow,
  .speaker {
    font: normal 15px/1.2 var(--pall-font-label, "Arial Narrow", sans-serif);
    color: #503222;
    letter-spacing: 0.08em;
    margin: 0 0 11px;
  }
  .speech {
    font: var(--dialogue-text, 17px)/1.55 var(--pall-font-reading, Georgia, serif);
    margin: 0 0 14px;
  }
  .result,
  .instruction,
  .context,
  .outcome {
    font: var(--dialogue-text, 17px)/1.55 var(--pall-font-reading, Georgia, serif);
    color: #25180f;
    margin: 0 0 12px;
  }
  .instruction,
  .outcome {
    font-weight: 600;
  }
  .context {
    color: #493021;
  }
  .inspection {
    border-top: 1px solid #b69b74;
    margin: 9px 0;
    padding-top: 9px;
    font: 15px/1.45 var(--pall-font-reading, Georgia, serif);
    color: #493021;
  }
  .inspection strong {
    color: #2b1c12;
  }
  .prop-hint {
    font: 600 13px/1.4 var(--pall-font-reading, Georgia, serif);
    color: #513927;
    margin: 12px 0 0;
  }
  .record-prop:disabled {
    cursor: wait;
  }
  .inspection p {
    margin: 4px 0 0;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin: 13px 0 0;
  }
  .actions button {
    width: 100%;
    min-height: 44px;
    box-sizing: border-box;
    padding: 8px 12px;
    background: #30251d;
    color: #f2dfc7;
    border: 1px solid #927048;
    cursor: pointer;
    font: var(--dialogue-text, 17px)/1.4 var(--pall-font-reading, Georgia, serif);
    text-align: left;
  }
  .actions button:disabled {
    opacity: 0.55;
    cursor: default;
  }
  .error {
    font: 13px/1.4 sans-serif;
    color: #912d1a;
  }
  .saving {
    font: 12px sans-serif;
    color: #675039;
  }
  .journal-button {
    border: 1px solid #987652;
    background: #d7c5a5;
    color: #332214;
    padding: 7px 11px;
    white-space: nowrap;
    cursor: pointer;
    font: 600 15px/1.3 var(--pall-font-reading, Georgia, serif);
  }
  .journal-button:is(:hover, :focus-visible) {
    background: #efddbd;
  }
  .journal {
    background: #e6d5b5;
    color: #24160e;
    padding: 22px clamp(14px, 3vw, 46px);
    border-top: 2px solid #917048;
    scroll-margin-top: 12px;
  }
  .journal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    max-width: 950px;
    margin: 0 auto 17px;
  }
  .journal-head small {
    font: 700 14px/1.25 var(--pall-font-label, "Arial Narrow", sans-serif);
    letter-spacing: 0.09em;
    color: #47301d;
  }
  .journal-head h2 {
    margin: 5px 0;
    font: 600 24px/1.25 var(--pall-font-reading, Georgia, serif);
    color: #25170f;
  }
  .journal > p {
    max-width: 950px;
    margin: 0 auto 10px;
    font: 600 16px/1.55 var(--pall-font-reading, Georgia, serif);
    color: #24160e;
  }
  /* Narrow stage: books get their own row overlapping the counter edge so
     both stay tappable (same treatment as before, decided by stage width). */
  @container activity-stage (max-width: 600px) {
    .room-stage {
      aspect-ratio: auto;
      overflow: visible;
    }
    .office-art {
      position: relative;
      inset: auto;
      aspect-ratio: 16/10;
      width: 100%;
      background-position: center 50%;
    }
    .record-props {
      position: relative;
      left: auto;
      bottom: auto;
      z-index: 2;
      margin: -38px 0 0;
      width: 100%;
      height: 145px;
      box-sizing: border-box;
      padding: 0 6px;
      gap: 2%;
      background: linear-gradient(#33241900, #33241958);
    }
    .record-prop {
      font-size: 12px;
    }
  }
  @container activity-panel (max-width: 480px) {
    .work-dialogue {
      padding: 14px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .record-prop img {
      transition: none;
    }
  }
</style>
