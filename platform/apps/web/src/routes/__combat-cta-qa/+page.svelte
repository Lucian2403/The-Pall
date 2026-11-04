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
    id:characterId,name:'QA fighter',origin:'Millhand',sex:'Male',coins:20,
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
      recoverComposure:12,techniqueMomentum:20,
      repeatedStrikeSurcharge:3,
      accuracy:{head:40,torso:70,limbs:58},
      guardMitigationPercent:50,prototype:true
    }
  });
  async function perform(_action:CombatAction):Promise<void>{}
</script>

<TutorialShell {character} sceneLocation="Industrial service passage" alleyBackdrop={true}>
  <MillhandCombatScene {snapshot} {characterId} feedback={[]}
    pending={false} errorMessage="" {perform}/>
</TutorialShell>
