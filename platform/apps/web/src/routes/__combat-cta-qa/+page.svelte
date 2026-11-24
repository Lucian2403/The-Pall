<script lang="ts">
  import {page} from '$app/state';
  import TutorialShell from '$lib/TutorialShell.svelte';
  import MillhandCombatScene from '$lib/MillhandCombatScene.svelte';
  import type {CombatSnapshot,CombatActorView} from '$lib/millhand-combat-model';
  import type {CombatAction} from '@the-pall/game-core/combat-v0.5.1';

  // A development-only, saved-fight-shaped snapshot for testing the ACTUAL
  // combat outcome component and its link using a real Chromium pointer.
  // No fake login, API call, progression write or in-game test character.
  const characterId='11111111-1111-4111-8111-111111111111';
  const character={
    id:characterId,name:'QA fighter',origin:'Millhand' as const,sex:'Male',coins:20,
    health:{current:0,maximum:50},startingLocation:'Smithing Workshop',
    tutorial:{stage:6,status:'COMPLETED'}
  };
  const actor=(name:string,hp:number):CombatActorView=>({
    name,hp,hpMax:50,ceiling:50,stamina:28,composure:80,
    fatigue:0,stress:0,momentum:0,bleed:0,wounds:[]
  });
  const won=$derived(page.url.searchParams.get('outcome')==='victory');
  const snapshot=$derived<CombatSnapshot>({
    status:'finished',
    outcome:won?'player_victory':'player_defeat',
    stance:'brace',
    round:6,
    revision:5,
    distance:'contact',
    enemyIntent:null,intentType:null,
    player:actor('Player',won?27:0),
    enemy:actor('Flint',won?0:21),
    legalActions:[],events:[],turnEvents:[],
    rules:{
      strikeCost:11,guardCost:5,moveCost:6,recoverStamina:16,
      recoverStaminaBelow50:16,recoverStaminaFrom50:12,
      recoverComposure:12,techniqueMomentum:20,repeatedStrikeSurcharge:3,
      fatigue:{cap:100,lowStaminaThreshold:30,lowStaminaGain:4,
        exhaustedAttackGain:6,exhaustedDefenseGain:3,
        recovery:8,recoveryBelow50:8,recoveryFrom50:6,
        recoveryThreshold:50,limitedAt:70,recoverOnlyAt:100,
        accuracyLossPerTen:2,currentAccuracyLoss:0},
      accuracy:{head:40,torso:70,limbs:58},
      guardMitigationPercent:'50%',guardReductionMinPercent:25,
      guardReductionMaxPercent:50,prototype:true,
      unarmed:true,weaponLabel:'Fists',
      strikeDamage:{min:4,max:7},techniqueDamage:{min:5,max:9},
      strikeByZone:{head:{min:4,max:7},torso:{min:4,max:7},limbs:{min:4,max:7}},
      techniqueByZone:{head:{min:5,max:9},torso:{min:5,max:9},limbs:{min:5,max:9}},
      dodgeChance:{side:10,cover:20,back:15,close:15},
      openingDamageBonus:0,openingReason:null,
      enemyStrikeDamage:{min:4,max:8},guardedEnemyStrikeDamage:{min:2,max:5},
      repositionUsesDistance:true
    }
  });
  async function perform(_action:CombatAction):Promise<void>{}
</script>

<TutorialShell {character} sceneLocation="Industrial service passage" alleyBackdrop={true}>
  <MillhandCombatScene {snapshot} {characterId} feedback={[]}
    pending={false} errorMessage="" {perform} origin={character.origin}/>
</TutorialShell>
