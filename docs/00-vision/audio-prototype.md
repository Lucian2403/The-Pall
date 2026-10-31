# The Pall — first browser audio prototype (2026-10-31)

Status: **experimental, optional, original owner-supplied sounds**.

## Source assets

Supplied by owner in `ThePallBaseSFX.zip`. Do not substitute third-party music or UI sounds. The original WAVs are retained for UI feedback. The 7:26.96 `MusicTheme.wav` is transcoded to `music-theme.mp3` at 128 kbit/s, 48 kHz stereo for the prototype. The current complete eight-file browser set is packaged in `ThePall_Audio_Assets_v2_Full.zip`, with paths relative to `platform/`. The owner changed only four WAVs in `SFXBase02.zip`: `UI_ClickMain`, `UI_Click`, `UI_PaperJournal`, `UI_PaperJournal2`. Their smaller replacement-only archive is `ThePall_SFXBase02_Changed_Files_Patch.zip`. The music MP3, `UI_Click02`, and both Smithing WAVs are unchanged.

The original eight audio assets have already been committed to PR #10, but the four updated `SFXBase02` WAVs still need to replace their old binary versions. This GitHub connector cannot push those binary updates directly. **Do not merge before the replacement assets are committed and verified.** On `feat/audio-ui-soundscape-20261031` extract `ThePall_SFXBase02_Changed_Files_Patch.zip` into `platform/` (overwriting exactly the four existing WAVs), then commit `apps/web/static/audio/the-pall/`. A fresh setup can instead extract the full v2 archive.

## Playback model

- Root SvelteKit layout retains a single audio manager across navigation.
- Only **in-game character routes** activate audio. Marketing, account and character creation stay silent in this first experiment.
- Browser audio is **never started automatically on load**. A direct click activates the session (within browser autoplay restrictions). When muted, the system stays silent. Settings persist locally in the browser under `the-pall-audio-v1`.
- **Music**: 6% linear HTMLAudioElement volume initially (the supplied track itself measures about -19 LUFS integrated). Fade-in about 4 s, fade-out 5 s; play the 7:27 track once, rest for a random 30–75 s, and repeat. Pause when leaving an in-game route or hiding the tab.
- **Clicks**: randomly pick `UI_ClickMain` 75%, `UI_Click` 15%, `UI_Click02` 10%. Variant gain factors compensate for differing peaks. Sound is triggered from accessible button/link/summary clicks (keyboard-generated click events work too), not on hover.
- **Paper**: alternate `UI_PaperJournal` and `UI_PaperJournal2` for notices and inspecting work papers. **Opening/closing individual skill dropdowns uses the normal mechanical click.** Revised paper-clip gains account for the now *louder* second paper sample.
- **Smithing**: alternate both `UI-SmithingAction` samples on **entering the Smithing Workshop from the first Millhand Work Order** and when the server **confirms** the `stamp_number`, `straighten`, or `fix_mark` action. Failed/retried work does not play the hammer sound. Physical inspection only plays normal UI feedback.
- The original HUD has a compact **Sound on/off** settings menu with independent Music and Effects sliders. Sound defaults enabled but nothing plays until user interaction.

## Technical review

- Source `MusicTheme.wav` was 171,674,386 bytes; the playback MP3 is 7,152,527 bytes. The source track's integrated loudness measured about -19 LUFS. The music should remain low-key at the 6% starting gain (the slider remains available).
- `UI_ClickMain` has a lower measured peak (~-16 dBFS) than `UI_Click` and `UI_Click02` (~-10 dBFS). Weighting and revised per-clip gains offset this difference.
- `UI_Click02` has approximately 80 ms of low-level leading material, so if this rare alternative feels delayed in actual play, trim its onset in a future owner-approved revision rather than raising volume.
- This review uses waveform/loudness analysis and does **not** claim subjective listening quality. Evaluate tonality and fatigue using real headphones and speakers.

## Low-latency SFX patch (2026-10-31)

**Observed issue:** `new Audio(base+filename)` was constructed for each UI interaction, so every click could incur independent file load, WAV decode and media-element startup delay (reported as 300–500 ms). Those per-click HTMLAudioElements have been removed for *short sound effects*.

The seven short WAVs now use a single `AudioContext({latencyHint:'interactive'})`. Upon entering an in-game route, the browser fetches and `decodeAudioData()` decodes all seven recordings **once**, caching the resulting `AudioBuffer` objects. A click creates only a `BufferSource` and a gain node and invokes `start(0)` synchronously. The first user gesture resumes a suspended context to respect browser autoplay restrictions. Music remains on its separate streaming HTMLAudioElement, with the existing fades and pauses.

**Click02** has about 80 ms of leading silence in the owner's unmodified WAV; its sound is scheduled with a 75 ms buffer start offset (without changing the file). Other SFX keep their original timing. Samples that are still loading are skipped on a cold first click rather than played hundreds of milliseconds late; once preloading finishes, all subsequent clicks are scheduled immediately. The short effects are not retriggered during disabled audio, and playing nodes stop on mute or leaving the in-game route.

The owner separately increased the volume slider's maximum to **50%** (`MAX_MUSIC_VOLUME=0.5`) in GitHub; the patch **retains that change** and preserves saved slider values.

**Decoder compatibility check:** All seven owner's PCM32 stereo WAVs successfully decoded in Chromium 144 (Web Audio, 44.1 kHz device output). This confirms browser support for these test recordings, not end-to-end perceived latency on the owner's machine.

## Validation

After replacing the four revised files:
```powershell
git add apps/web/static/audio/the-pall/UI_ClickMain.wav apps/web/static/audio/the-pall/UI_Click.wav apps/web/static/audio/the-pall/UI_PaperJournal.wav apps/web/static/audio/the-pall/UI_PaperJournal2.wav
git commit -m "assets(audio): replace four revised UI sounds"
git push origin feat/audio-ui-soundscape-20261031
```

The original browser default was 3.5%. The new default is 6%; saved values matching the old default automatically upgrade once, while manually selected non-default volume values persist.

Then verify:

```powershell
npm run verify:audio-prototype
npm run check:web
```

Test after a real click, mute/unmute, mobile viewport, tab background/foreground, click weighting, skill dropdown clicks rather than paper, Smithing Workshop entry, paper opening, accepted and failed smithing requests, and navigation between stages. Do not add loudness normalization globally; the supplied clips have different artistic intentions.


## Smithing Workshop ambience — owner update, 2026-10-31

The owner supplied **`SmithingWorkshopAmbience.wav`** as an additional, dedicated **environmental layer**, not an ordinary UI cue or the general background-music theme.

- Original: stereo 48 kHz PCM32 WAV, **115.00 seconds**, approximately 44.2 MB. The beginning and ending decay toward silence, allowing an unobtrusive repeat.
- Browser version: **`smithing-workshop-ambience.mp3`**, MP3 112 kbit/s, stereo 48 kHz, **1,610,828 bytes**, generated from that exact owner recording. The source WAV remains untouched. `sha256: aa769bc0aa3a480bdaa56153be231bb735fa949b055c24aa7e25330a55dc38e4`.
- Loop is **continuous** (`audio.loop=true`) without the 30–75-second rests used by the separate MusicTheme. No artificial smithing sounds are generated. Player-controlled default **Ambience** is 30%, with a dedicated **0–100%** slider; Music remains separately controlled (maximum 50%, as modified by the owner in GitHub), and Effects has its own slider.
- The sound plays only when `TutorialShell.svelte` receives an explicit `smithingBackdrop=true` from a page actually rendering Smithing Workshop artwork: Millhand character illustration, Stage 1 Guther opening, Stage 2 platework, Stage 3 Missing Stamp and **only** the early workshop-preparation phases of Stage 4 restamp delivery. Depot, council office, records room, other origins and other pages are non-forge backgrounds. Hidden tabs and master mute silence the loop. Consecutive workshop-stage transitions preserve the track's position.
- **Asset status**: the browser MP3 is already committed at `platform/apps/web/static/audio/the-pall/smithing-workshop-ambience.mp3`; no ZIP or binary replacement is necessary. The verifier checks its SHA-256 and byte count.
- The original eight SFX files, weighted click playback, short-effect Web Audio buffer cache and music fades are preserved.

The new HUD displays **Stamina 100/100** as an explicit provisional starting value. A live/saved Stamina measurement from future combat integration—including Flint—takes precedence; this change does not invent a combat state, persist stamina, or subtract it from actions.


## Audio slider and workshop playback repair — 2026-10-31

Reported during PR #12 review: Music, Ambience and Effects sliders did not audibly respond, and Smithing ambience appeared absent, while source/asset verification passed. **An asset hash check does not prove browser playback**.

Corrections on the same branch:

- The global player now activates on genuine **pointer-down and keyboard** events, not only on a later `click`. Dragging a volume slider or changing it with arrow keys therefore qualifies as the player's activation and can start the browser sound engines.
- The ambience player is **created/preloaded once** for its lifetime, avoiding repeated `load()` calls when workshop components mount or remount, which could otherwise reset playback. The loop is still claimed only by a visible Smithing Workshop and stops on leaving the scene, on master mute and on hidden tabs.
- All three sliders continue to update saved settings, but also affect the **active playback channel**: Music changes `HTMLAudioElement.volume`, Ambience changes its own `HTMLAudioElement.volume`, and Effects affects the gain of the next cached Web Audio clip.
- The Sound menu displays a playback state beneath each slider: `Playing`, `Resting`, `Workshop only`, `Click to start`, `Loading`, `File unavailable`, or `Playback blocked — click to retry`. An unrecognized ambience URL or browser autoplay failure no longer fails invisibly.
- **Play theme** overrides a waiting music rest only when explicitly pressed. **Test click** plays the main weighted click using the current Effects gain. Those are testing conveniences, not new gameplay audio.
- All owner volume choices, the user-edited **50%** Music maximum, the 75/15/10 click weights, 30–75-second music pauses, source file paths and the 115-second workshop loop remain unchanged.
- A new **executable** `verify:audio-runtime` script runs the actual audio manager code in a deterministic mock browser using the existing TypeScript toolchain. Unlike source grep checks, it asserts that sliders modify playback volumes, pointer gestures unlock sound, ambience only plays in workshops, muting works, and the Effects preview uses the new gain.

Validation from a locally updated `platform` checkout:

```powershell
npm run verify:character-home
npm run verify:audio-runtime
npm run verify:workshop-hud-ambience
npm run verify:audio-prototype
npm run check:web
```

Then open an actual Smithing Workshop and open **Sound**. The Ambience status should become `Playing` after a pointer/keyboard activation. If it instead reports `File unavailable` or `Playback blocked — click to retry`, that distinguishes a missing URL/codec problem from the browser's activation policy. Confirm the playing state and audible balance on the owner's own browser before merging.


## Backdrop-scoped forge ambience and seamless stages — 2026-11-01

**Owner correction:** Workshop ambience must never become generic game music and must not restart at the beginning after the brief Stage 1→2→3 transitions.

**Implementation:** The route that actually displays each scene declares `smithingBackdrop` to the mounted `TutorialShell`. Only that shell can claim ambient ownership. Old independent `onMount(claimSmithingWorkshopAmbience)` hooks in all five workshop-related content components have been removed; otherwise component residue and partial Stage 4 branches could incorrectly leave the forge playing.

- Millhand character home: `true`, because the actual origin image is `/workshop/environment.webp`; all other origin homes: `false`.
- Stage 1 Guther, Stage 2 platework, Stage 3 Missing Stamp: `true` only for their actual workshop scenes.
- Stage 4: `true` **only** on the `restamp` branch while phase is `CHECK_LOAD` or `CHOOSE_TRANSPORT`; depot/records/contracts art is `false` and immediately silences and resets forge ambience.
- Account, roster, marketing and other routes: no workshop background. Navigation away from character scenes explicitly stops the forge via `beforeNavigate`.

A single `HTMLAudioElement` owns the **same playing position** across scene remounts. When the old stage releases its forge claim, the manager allows a short **2.4-second route-transition grace**. If another stage mounts with the same forge artwork in that interval, it cancels the pending stop; the audio keeps playing uninterrupted. If the next stage takes longer to load, playback may pause at the end of the grace period, but its position is preserved rather than rewound. A confirmed non-forge backdrop stops and resets immediately.

This does **not** change MusicTheme's spaced looping, any Effects Web Audio buffers, or the owner's Music/Ambience/Effects sliders and saved volumes.

**Verified in GitHub Actions** using both the executable runtime mock and a real Chromium page with the production Sound UI: the Svelte shell is deliberately unmounted and remounted using a keyed new stage; the recording's `currentTime` does not regress. Switching that same page's visible backdrop to the depot must pause the recorded ambience and reset only at that confirmed departure.
