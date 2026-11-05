import type {CombatAction} from '@the-pall/game-core/combat-v0.5.1';
import type {CombatSnapshot} from '$lib/millhand-combat-model';
import {playCombatSfx} from '$lib/pall-audio';

/**
 * Play feedback for a single *saved* server turn, never for an optimistic
 * button press, a failed request, or a previously loaded Chronicle entry.
 * This is a presentation adapter: combat math and event text stay untouched.
 */
export function soundSavedCombatTurn(
  previous: CombatSnapshot,
  next: CombatSnapshot,
  action: CombatAction,
  playerSex: string | undefined
): void {
  if (next.revision <= previous.revision) return;

  // Combat view exposes the original engine's just-resolved events. Chronicle
  // history is capped and must not be compared or replayed for sound.
  const events = next.turnEvents.filter(event => event.round === previous.round);
  if (action.type === 'guard' && events.some(e => e.kind === 'guard' && e.actor === 'player')) {
    playCombatSfx('guard');
  }
  if (action.type === 'move' && events.some(e => e.kind === 'move' && e.actor === 'player')) {
    playCombatSfx('reposition');
  }
  // A successful server-saved action alone produces the corresponding cue.
  // Each actual actor's Focus or Recovery can sound; loading historic events
  // must never replay sound or create fake combat effects.
  for(const event of events.filter(e => e.kind==='focus').slice(0,2))
    if(event.actor==='player'||event.actor==='enemy')playCombatSfx('focus');
  for(const event of events.filter(e => e.kind==='recovery').slice(0,2))
    if(event.actor==='player'||event.actor==='enemy')playCombatSfx('recovery');
  // Miss samples represent attempted blows, not a mere positional movement.
  for(const miss of events.filter(e => e.kind==='miss' &&
    (e.actionType==='attack'||e.actionType==='technique')).slice(0,2))
    if(miss.actor==='player'||miss.actor==='enemy')playCombatSfx('miss');

  for (const hit of events.filter(e => e.kind === 'damage' && (e.damage ?? 0) > 0).slice(0, 2)) {
    playCombatSfx('hit');
    // Flint is male. Only use the supplied male vocalisations for a male
    // player; a female player never receives an incorrect male voice.
    if (hit.target === 'enemy' || (hit.target === 'player' && playerSex === 'Male')) {
      playCombatSfx('maleGrunt');
    }
  }

  const low = (oldValue: number, newValue: number) => oldValue > 20 && newValue <= 20;
  if (low(previous.enemy.stamina, next.enemy.stamina) ||
    (playerSex === 'Male' && low(previous.player.stamina, next.player.stamina))) {
    playCombatSfx('maleLowStamina');
  }

  if (previous.status === 'active' && next.status === 'finished') {
    playCombatSfx('fightFinished');
  }
}
