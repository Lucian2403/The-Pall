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
