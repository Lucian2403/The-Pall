<script lang="ts">
  import {dialogueSpeakerLabel} from '$lib/dialogue-speaker';
  import {getContext} from 'svelte';
  import {SCENE_JOURNAL_CONTEXT,type SceneJournalRegistrar} from '$lib/scene-journal';

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

  const sceneState = $derived(snapshot.state);
  // Leave is rendered by the shared location exit, not in the work-action list.
  const workActions = $derived(snapshot.availableActions.filter(action=>action!=='leave_location'));
  const beat = $derived(
    sceneState.phase === "ARCHIVE_DIALOGUE"
      ? STAGE_FOUR_DIALOGUE.records[sceneState.dialogueIndex]
      : null,
  );
  const journal = $derived(secondJobJournal(sceneState));
  const result = $derived(
    sceneState.lastAction ? STAGE_FOUR_OUTCOMES[sceneState.lastAction] : null,
  );

  // The two existing owner books also suit the Scholarship records task.
  // No scraped writing or additional shift-book sprite has been fabricated.
  let inspected = $state<"death" | "wage" | null>(null);
  let inspectionNote = $state<string | null>(null);
  // The persistent corner control is owned by TutorialShell, not this dialogue.
  const registerSceneJournal=getContext<SceneJournalRegistrar|undefined>(SCENE_JOURNAL_CONTEXT);
  $effect(()=>{
    registerSceneJournal?.({title:'Ledger Reconciliation',entries:journal});
    return ()=>registerSceneJournal?.(null);
  });

  const readingPhase = $derived(
    sceneState.phase === "READ_DEATH_REGISTER" ||
      sceneState.phase === "READ_WAGE_RECORD" ||
      sceneState.phase === "EXAMINE_SCRAPED_ENTRY",
  );
  const instruction = $derived(
    sceneState.phase === "READ_DEATH_REGISTER"
      ? "Find the worker number in the Death Register on the counter."
      : sceneState.phase === "READ_WAGE_RECORD"
        ? "Check the later Wage Record against the recorded death."
        : sceneState.phase === "EXAMINE_SCRAPED_ENTRY"
          ? "Examine the damaged line in the Wage Record."
          : STAGE_FOUR_INSTRUCTIONS[sceneState.phase],
  );

  // All three examination steps use the server's already-approved actions.
  // An incorrect selection only changes local explanatory copy.
  function inspect(which: "death" | "wage") {
    if (pending) return;
    inspected = which;
    if (sceneState.phase === "READ_DEATH_REGISTER") {
      if (
        which === "death" &&
        snapshot.availableActions.includes("read_death_register")
      ) {
        inspectionNote = null;
        void perform("read_death_register");
      } else {
        inspectionNote =
          "First find the council’s recorded death in the Death Register.";
      }
      return;
    }
    if (sceneState.phase === "READ_WAGE_RECORD") {
      if (
        which === "wage" &&
        snapshot.availableActions.includes("check_wage_record")
      ) {
        inspectionNote = null;
        void perform("check_wage_record");
      } else {
        inspectionNote =
          "You have checked the death entry. Now compare the later Wage Record.";
      }
      return;
    }
    if (sceneState.phase === "EXAMINE_SCRAPED_ENTRY") {
      if (
        which === "wage" &&
        snapshot.availableActions.includes("examine_scraped_entry")
      ) {
        inspectionNote = null;
        void perform("examine_scraped_entry");
      } else {
        inspectionNote =
          "The damaged handwritten entry is in the later Wage Record.";
      }
      return;
    }
    inspectionNote =
      which === "death"
        ? "The council death register remains on the counter."
        : "The later wage records remain on the counter.";
  }


</script>

<section
  class="second-job records-job"
  aria-label="Ledger Reconciliation, Scholarship and Investigation Stage 4"
>
  <!-- Shared scene layout: the council records room painting with its two counter books is
       the stage (2:1); the room's dialogue is the content-height reading column. -->
  <ActivityLayout mode="scene" stageAspect={2} class="records-scene pall-story-sections">
  {#snippet stage()}
  <div class="scene-visuals pall-story-visuals">
  <div class="room-stage pall-story-landscape">
    <div
      class="records-art"
      role="img"
      aria-label="Council records room with stone arches, tall bookcases, filing cabinets and a wooden archive counter"
    ></div>

    <!-- Reuse approved book cutouts already installed for the Commerce route.
         Interact with the images themselves; the labels are not shortcuts. -->
    <div
      class="record-props"
      aria-label="Council records on the archive counter"
    >
      <button
        type="button"
        class="record-prop death"
        class:chosen={inspected === "death"}
        aria-pressed={inspected === "death"}
        aria-label="Examine the Death Register"
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
        aria-label="Examine the Wage Record"
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
    <aside class="work-dialogue" aria-label="Ledger Reconciliation interaction">
      <p class="eyebrow">LEDGER RECONCILIATION · STAGE 4</p>
      {#if sceneState.revision === 0}
        <p class="context">{STAGE_FOUR_ROUTES.records.entry}</p>
      {/if}

      {#if (sceneState.phase === "DONE" || sceneState.phase === "EXITED")}
        <p class="outcome">{STAGE_FOUR_FINAL.records}</p>
        <StageFourNextStep {snapshot} {pending} {perform} />
      {:else if sceneState.phase === "ARCHIVE_DIALOGUE" && beat}
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
        {#if sceneState.phase === "SPEAK_ARCHIVE" || sceneState.phase === "CHOOSE_SOURCE"}
          <p class="context">
            You check the newer wage record. Same worker number again. But
            someone's scratched out part of what's written there. Can't make out
            what it said.
          </p>
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

      {#if readingPhase}
        <p class="prop-hint">
          Select the relevant book on the counter to examine it.
        </p>
      {:else if workActions.length > 0}
        <div class="actions" aria-label="Available investigation actions">
          {#each workActions as action (action)}
            <button
              type="button"
              class={workActions.length===1?'primary-choice':'secondary-choice'}
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

  <div class="scene-footer">
    <span
      >Council records stay in the records room. You may note what you find.</span
    >
  </div>


</section>

<style>
  .records-job {
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
    background: #242730;
  }
  .records-art {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: url("/locations/records/records-room.webp") center 49% / cover
      no-repeat;
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
  .record-prop.death,
  .record-prop.wage {
    width: 49%;
  }
  .record-prop img {
    display: block;
    width: 100%;
    height: calc(100% - 45px);
    object-fit: contain;
    pointer-events: none;
    transform-origin: center 76%;
    filter: drop-shadow(0 4px 5px #100c08ae);
    transition: transform 150ms ease-out;
  }
  .record-prop:is(:hover, :focus-visible):not(:disabled) img {
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
  .record-prop:disabled {
    cursor: wait;
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
    letter-spacing: 0.08em;
    color: #503222;
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
  .inspection p {
    margin: 4px 0 0;
  }
  .prop-hint {
    font: 600 13px/1.4 var(--pall-font-reading, Georgia, serif);
    color: #513927;
    margin: 12px 0 0;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin: 13px 0 0;
  }
  .error {
    font: 13px/1.4 sans-serif;
    color: #912d1a;
  }
  .saving {
    font: 12px sans-serif;
    color: #675039;
  }
  .scene-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    padding: 9px 14px;
    background: #201c17;
    color: #c9b393;
    font: 12px/1.4 sans-serif;
  }
  /* Narrow stage: books get their own row overlapping the counter edge so
     both stay tappable (same treatment as before, decided by stage width). */
  @container activity-stage (max-width: 600px) {
    .room-stage {
      aspect-ratio: auto;
      overflow: visible;
    }
    .records-art {
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
      background: linear-gradient(#24201900, #24201958);
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
  @media (max-width: 760px) {
    .scene-footer {
      flex-wrap: wrap;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .record-prop img {
      transition: none;
    }
  }
</style>
