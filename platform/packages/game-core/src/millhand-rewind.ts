/**
 * Development-only Millhand tutorial replay planning.
 * The API is solely responsible for authentication, access controls and SQL.
 * These helpers do NOT reset a character or grant/remove awards on their own.
 */
import {APPROVED_STARTING_FACTS} from './character-creation.js';
import {MISSING_STAMP_ROUTE_SKILL} from './millhand-missing-stamp.js';
import type {MissingStampBranch} from './millhand-missing-stamp.js';

export type MillhandRewindStage = 2 | 3 | 4;
export type MillhandRewindTarget = 1 | 2 | 3;
export type MillhandRewindPlan = Readonly<{
  fromStage:MillhandRewindStage;
  toStage:MillhandRewindTarget;
  nextBonuses:Readonly<Record<string,number>>;
  resetPlatework:boolean;
  removePlatework:boolean;
  removeMissingStamp:boolean;
}>;

export class MillhandRewindInvalid extends Error {
  constructor(message = 'rewind_not_available') {super(message);}
}

/**
 * Starting Millhand skill is Craftsmanship +3. During stages 1-4 the only
 * other recognised skill mutation is the selected Stage 3 route's +1.
 * Fail closed on any unknown skill/award structure rather than destroying
 * bonuses that may belong to future features or edited characters.
 */
export function planMillhandRewind(
  stage:number,
  bonuses:Readonly<Record<string,number>>,
  branch:MissingStampBranch|null,
  plateworkPhase:string|null,
  missingStampPhase:string|null
): MillhandRewindPlan {
  if(stage!==2 && stage!==3 && stage!==4)throw new MillhandRewindInvalid();
  if(!bonuses || typeof bonuses!=='object' || Array.isArray(bonuses))throw new MillhandRewindInvalid('unsafe_skill_state');
  if((bonuses.Craftsmanship??null)!==APPROVED_STARTING_FACTS.originMajorSkillBonusLevels)
    throw new MillhandRewindInvalid('unsafe_skill_state');
  if(stage>=3 && plateworkPhase!=='COMPLETE')
    throw new MillhandRewindInvalid('unsafe_work_state');
  if(stage===2 && (plateworkPhase===null || plateworkPhase==='COMPLETE'))
    throw new MillhandRewindInvalid('unsafe_work_state');
  if(stage===4 && (!branch || missingStampPhase!=='SELECTED'))
    throw new MillhandRewindInvalid('unsafe_stage_three_state');
  if(stage===3 && branch && missingStampPhase!=='RESTAMP')
    throw new MillhandRewindInvalid('unsafe_stage_three_state');
  if(stage===2 && (branch!==null || missingStampPhase!==null))
    throw new MillhandRewindInvalid('unsafe_stage_three_state');

  const expected:Record<string,number> = {Craftsmanship:APPROVED_STARTING_FACTS.originMajorSkillBonusLevels};
  if(branch){
    if(!Object.hasOwn(MISSING_STAMP_ROUTE_SKILL,branch))throw new MillhandRewindInvalid('unsafe_stage_three_state');
    expected[MISSING_STAMP_ROUTE_SKILL[branch]] = 1;
  }
  const sorted=(object:Record<string,number>)=>Object.keys(object).sort()
    .map(key=>key+':'+object[key]).join('|');
  if(sorted({...bonuses})!==sorted(expected))throw new MillhandRewindInvalid('unsafe_skill_state');

  return {
    fromStage:stage,
    toStage:(stage-1) as MillhandRewindTarget,
    nextBonuses:{Craftsmanship:APPROVED_STARTING_FACTS.originMajorSkillBonusLevels},
    resetPlatework:stage===3,
    removePlatework:stage===2,
    removeMissingStamp:stage>=3
  };
}
