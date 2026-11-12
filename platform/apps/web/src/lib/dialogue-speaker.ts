/** Canonical, origin-independent speaker label for the player's spoken lines.
 *
 * Authored dialogue and game state may continue to use 'Player', 'PLAYER',
 * 'You' or 'YOU' as internal speaker identifiers. Only the UI label is
 * normalised. Never replace character names inside spoken text, HUD, journal,
 * inventory, or NPC dialogue.
 *
 * All future narrative scene renderers must call dialogueSpeakerLabel() when
 * displaying a speaker heading rather than rendering the raw speaker ID.
 */
export const PLAYER_SPEAKER_LABEL = 'YOU' as const;

export function dialogueSpeakerLabel(speaker: string | null | undefined): string {
  if (speaker == null) return '';
  const value = speaker.trim();
  return value.toLowerCase() === 'player' || value.toLowerCase() === 'you'
    ? PLAYER_SPEAKER_LABEL
    : speaker;
}
