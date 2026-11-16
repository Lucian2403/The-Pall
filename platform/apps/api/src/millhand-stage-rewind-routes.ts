/**
 * Local developer tool for replaying Millhand and Bellrunner introduction stages with one
 * existing character. Registered only when the API binds to loopback AND
 * NODE_ENV is not production. This is not a normal gameplay capability.
 */
import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import type {IncomingHttpHeaders} from 'node:http';
import pg from 'pg';
import type {CombatState} from '@the-pall/game-core/combat-v0.5.1';
import type {ClinicState} from './millhand-clinic-state.js';
import {auth} from './auth.js';
import {INITIAL_PLATEWORK,planMillhandRewind,MillhandRewindInvalid,previousWageClaim,WageClaimInvalidAction} from '@the-pall/game-core';
import type {MissingStampBranch,WageClaimState} from '@the-pall/game-core';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params={id:string};
type CharacterState={origin:string;tutorial_stage:number;tutorial_status:string;major_skill_bonuses:Record<string,number>;current_health:number;max_health:number};

type SessionAccount={user:{id:string;emailVerified:boolean}}|null;
type SessionResolver=(headers:IncomingHttpHeaders)=>Promise<SessionAccount>;
/** Development/loopback-only handler; identity substitution is exclusively
 * for in-process PostgreSQL integration tests. No HTTP bypass exists. */
export function registerMillhandStageRewindRoutes(app:FastifyInstance,options:{
  pool?:pg.Pool;resolveSession?:SessionResolver;
}={}){
  const db=options.pool??new pg.Pool({connectionString:process.env.DATABASE_URL});
  const resolveSession=options.resolveSession??(async(headers:IncomingHttpHeaders)=>
    auth.api.getSession({headers:fromNodeHeaders(headers)}));
  app.addHook('onClose',async()=>{if(!options.pool)await db.end();});
  const host=process.env.API_HOST??'127.0.0.1';
  const loopback=host==='127.0.0.1'||host==='::1'||host==='localhost';
  if(process.env.NODE_ENV==='production'||!loopback)return;

  app.get<{Params:Params}>('/api/characters/:id/dev/rewind-stage',async(req,reply)=>{
    const session=await resolveSession(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const result=await db.query<CharacterState>(
      'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses,current_health,max_health FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]
    );
    if(!result.rowCount)return reply.code(404).send({error:'not_found'});
    const stage=result.rows[0].tutorial_stage;
    if(result.rows[0].origin==='Bellrunner'){
      const active=await db.query<{work_state:{phase:string}}>(
        'SELECT work_state FROM player_character_bellrunner_dispatch WHERE character_id=$1',
        [req.params.id]);
      const dispatchReady=active.rows[0]?.work_state?.phase==='final_notice_taken';
      if(stage===2){
        const canRewind=result.rows[0].tutorial_status==='IN_PROGRESS'&&!!active.rowCount;
        return {enabled:true,canRewind,stage,targetStage:canRewind?1:null};
      }
      if(stage===5){
        // Stage 5 is replayable throughout the unfinished confrontation.
        const job=await db.query<{state:{phase:string;branch:string}}>(
          'SELECT state FROM player_character_bellrunner_second_job WHERE character_id=$1',
          [req.params.id]);
        const dogman=await db.query<{revision:string|number;state:{
          revision:number;phase:string;branch:string
        }}>(
          'SELECT revision,state FROM player_character_bellrunner_dogman WHERE character_id=$1',
          [req.params.id]);
        const saved=dogman.rows[0];
        const valid=!saved?result.rows[0].tutorial_status==='NOT_STARTED'
          :saved.state.phase!=='done'&&
            saved.state.branch===job.rows[0]?.state?.branch&&
            Number(saved.revision)===saved.state.revision;
        const canRewind=job.rows[0]?.state?.phase==='exited'&&valid;
        return {enabled:true,canRewind,stage,targetStage:canRewind?4:null};
      }
      if(stage===6){
        // Same local replay policy as Flint: restore the true pre-fight HP
        // from the immutable revision-zero receipt, never from maximum HP.
        const dogman=await db.query<{revision:string|number;state:{
          revision:number;phase:string;stance:string|null
        }}>(
          'SELECT revision,state FROM player_character_bellrunner_dogman WHERE character_id=$1',
          [req.params.id]);
        const saved=dogman.rows[0];
        let valid=saved?.state.phase==='done'&&
          ['street','cart','defend'].includes(saved.state.stance??'')&&
          Number(saved.revision)===saved.state.revision;
        if(valid){
          const combat=await db.query<{state:{player:{hp:number}};stance:string}>(
            'SELECT state,stance FROM player_character_dogman_combat WHERE character_id=$1',
            [req.params.id]);
          if(combat.rowCount){
            const encounter=combat.rows[0];
            const start=await db.query<{response:{
              revision:number;stance:string;player:{hp:number}
            }}>(
              "SELECT response FROM player_character_dogman_combat_receipts WHERE character_id=$1 AND response->>'revision'='0' ORDER BY created_at ASC,request_id ASC LIMIT 1",
              [req.params.id]);
            const first=start.rows[0]?.response;
            const viewStance=saved.state.stance==='street'?'moving'
              :saved.state.stance==='defend'?'brace':'cart';
            valid=encounter.stance===saved.state.stance&&
              encounter.state.player.hp===result.rows[0].current_health&&
              first?.revision===0&&first.stance===viewStance&&
              Number.isSafeInteger(first.player?.hp)&&
              first.player.hp>0&&first.player.hp<=result.rows[0].max_health;
          }
        }
        return {enabled:true,canRewind:!!valid,stage,targetStage:valid?5:null};
      }
      if(stage===3||stage===4){
        const investigation=await db.query<{state:{phase:string;branch:string|null}}>(
          'SELECT state FROM player_character_bellrunner_wrong_bell WHERE character_id=$1',
          [req.params.id]);
        const saved=investigation.rows[0]?.state;
        if(stage===3){
          const canRewind=dispatchReady&&
            (!saved||saved.branch===null)&&saved?.phase!=='committed';
          return {enabled:true,canRewind,stage,targetStage:canRewind?2:null};
        }
        // Every Bellrunner Stage 4 work phase is replayable in local testing,
        // not just the first page before the initial Continue. Stage 4 awards
        // nothing new, so its receipts/state can be cleared atomically.
        const job=await db.query<{revision:string|number;state:{
          revision:number;phase:string;branch:string
        }}>(
          'SELECT revision,state FROM player_character_bellrunner_second_job WHERE character_id=$1',
          [req.params.id]);
        const current=job.rows[0];
        const validJob=!current
          ?result.rows[0].tutorial_status==='NOT_STARTED'
          :current.state.branch===saved?.branch&&
            current.state.phase!=='exited'&&
            Number(current.revision)===current.state.revision;
        const canRewind=dispatchReady&&saved?.phase==='committed'&&
          ['contracts','trauma','machinery'].includes(saved.branch??'')&&
          ['NOT_STARTED','IN_PROGRESS'].includes(result.rows[0].tutorial_status)&&
          validJob;
        return {enabled:true,canRewind,stage,targetStage:canRewind?3:null};
      }
      return {enabled:true,canRewind:false,stage,targetStage:null};
    }
    if(result.rows[0].origin!=='Millhand')
      return reply.code(404).send({error:'not_found'});
    let canReturnToClinic=false;
    if(stage===8){
      const visit=await db.query<{state:ClinicState}>(
        'SELECT state FROM player_character_clinic WHERE character_id=$1',
        [req.params.id]
      );
      canReturnToClinic=visit.rows[0]?.state.phase==='LEFT' &&
        visit.rows[0].state.paid===true;
    }
    const canRewind=stage>=2&&stage<=7||canReturnToClinic;
    return {
      enabled:true,canRewind,stage,
      // Stage 8 now rewinds to the paid Stage 7 clinic. It never discards
      // the fight or silently charges/refunds the clinic fee again.
      targetStage:canReturnToClinic?7:stage>1&&stage<=7?stage-1:null
    };
  });

  app.post<{Params:Params}>('/api/characters/:id/dev/rewind-stage',async(req,reply)=>{
    const session=await resolveSession(req.headers);
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const origin=req.headers.origin;
    if(origin&&origin!==(process.env.AUTH_BASE_URL??'http://127.0.0.1:5173'))
      return reply.code(403).send({error:'invalid_origin'});
    if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
      return reply.code(415).send({error:'json_required'});
    const body=req.body;
    if(!body||typeof body!=='object'||Array.isArray(body)||
        Object.keys(body).sort().join(',')!=='expectedStage')
      return reply.code(400).send({error:'invalid_body'});
    const expectedStage=(body as {expectedStage:unknown}).expectedStage;
    if(!Number.isSafeInteger(expectedStage)||(expectedStage as number)<2||(expectedStage as number)>8)
      return reply.code(400).send({error:'invalid_stage'});

    const client=await db.connect();
    let transaction=false;
    let bellrunner=false;
    try {
      await client.query('BEGIN');transaction=true;
      // Serialise against BOTH Stage 2 and Stage 3 gameplay commands by
      // locking the same owner-scoped character row first.
      const c=await client.query<CharacterState>(
        'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses,current_health,max_health FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]
      );
      if(!c.rowCount||!['Millhand','Bellrunner'].includes(c.rows[0].origin)){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      bellrunner=c.rows[0].origin==='Bellrunner';
      if(c.rows[0].tutorial_stage!==expectedStage){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stale_stage',stage:c.rows[0].tutorial_stage});
      }

      if(bellrunner&&expectedStage===3){
        // Development-only Stage 3 -> 2. Never erase completed courier routes.
        // Reopen only the final notice, resetting Stage 3 investigation receipts.
        const saved=await client.query<{state:{phase:string;branch:string|null}}>(
          'SELECT state FROM player_character_bellrunner_wrong_bell WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        if(saved.rows[0]&&(saved.rows[0].state.branch!==null||
          saved.rows[0].state.phase==='committed')){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_wrong_bell_state'});
        }
        const dispatch=await client.query<{revision:string|number;work_state:{phase:string}}>(
          'SELECT revision,work_state FROM player_character_bellrunner_dispatch WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        if(dispatch.rows[0]?.work_state?.phase!=='final_notice_taken'){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_dispatch_state'});
        }
        await client.query(
          'DELETE FROM player_character_bellrunner_wrong_bell_receipts WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          'DELETE FROM player_character_bellrunner_wrong_bell WHERE character_id=$1',
          [req.params.id]);
        // Old final-handoff receipts must not return a stale Stage 3 result.
        await client.query(
          "DELETE FROM player_character_bellrunner_dispatch_work_receipts WHERE character_id=$1 AND result->'workState'->>'phase'='final_notice_taken'",
          [req.params.id]);
        await client.query(
          'UPDATE player_character_bellrunner_dispatch SET revision=$2,work_state=$3::jsonb WHERE character_id=$1',
          [req.params.id,Number(dispatch.rows[0].revision)+1,
            JSON.stringify({...dispatch.rows[0].work_state,phase:'final_notice'})]);
        await client.query(
          "UPDATE player_characters SET tutorial_stage=2,tutorial_status='IN_PROGRESS' WHERE id=$1",
          [req.params.id]);
        await client.query('COMMIT');transaction=false;
        return {stage:2,tutorialStatus:'IN_PROGRESS',
          route:'/characters/'+req.params.id+'/bellrunner/dispatch',coinDelta:0};
      }

      if(bellrunner&&expectedStage===4){
        // Local QA may rewind from EVERY Stage 4 phase: first view,
        // mid-dialogue, evidence inspection, branch method and completed
        // handoff. Stage 4 itself awards no coins, XP, items or skills.
        // Undo the Stage 3 route's one-time skill and reset Stage 4 atomically.
        if(!['NOT_STARTED','IN_PROGRESS'].includes(c.rows[0].tutorial_status)){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_wrong_bell_state'});
        }
        const saved=await client.query<{revision:string|number;state:{
          revision:number;phase:string;branch:string|null
        }}>(
          'SELECT revision,state FROM player_character_bellrunner_wrong_bell WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        const value=saved.rows[0]?.state;
        const skill=value?.branch==='contracts'?'Commerce':
          value?.branch==='trauma'?'Medicine':
          value?.branch==='machinery'?'Mechanics':null;
        if(!skill||value?.phase!=='committed'||
          Number(saved.rows[0].revision)!==value.revision||
          !Number.isSafeInteger(c.rows[0].major_skill_bonuses[skill])||
          c.rows[0].major_skill_bonuses[skill]<1){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_wrong_bell_state'});
        }
        // Lock job state before clearing it; repeated or concurrent rewind
        // cannot award a second skill or resurrect an old work receipt.
        const started=await client.query<{revision:string|number;state:{
          revision:number;phase:string;branch:string
        }}>(
          'SELECT revision,state FROM player_character_bellrunner_second_job WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        const job=started.rows[0];
        const validJob=job
          ?job.state.branch===value.branch&&job.state.phase!=='exited'&&
            Number(job.revision)===job.state.revision
          :c.rows[0].tutorial_status==='NOT_STARTED';
        if(!validJob){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_second_job_state'});
        }
        await client.query(
          'DELETE FROM player_character_bellrunner_second_job_receipts WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          'DELETE FROM player_character_bellrunner_second_job WHERE character_id=$1',
          [req.params.id]);
        const bonuses={...c.rows[0].major_skill_bonuses,
          [skill]:c.rows[0].major_skill_bonuses[skill]-1};
        const next={...value,phase:'choice',branch:null,revision:value.revision+1};
        await client.query(
          'DELETE FROM player_character_bellrunner_wrong_bell_receipts WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          'UPDATE player_character_bellrunner_wrong_bell SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
          [req.params.id,next.revision,JSON.stringify(next)]);
        await client.query(
          "UPDATE player_characters SET tutorial_stage=3,tutorial_status='IN_PROGRESS',major_skill_bonuses=$2::jsonb WHERE id=$1",
          [req.params.id,JSON.stringify(bonuses)]);
        await client.query('COMMIT');transaction=false;
        return {stage:3,tutorialStatus:'IN_PROGRESS',
          route:'/characters/'+req.params.id+'/bellrunner/wrong-bell',coinDelta:0};
      }

      if(bellrunner&&expectedStage===5){
        // Discard only unfinished Stage V dialogue and receipts. Preserve the
        // completed Stage IV result and its one-time Major Skill.
        const saved=await client.query<{revision:string|number;state:{
          revision:number;phase:string;branch:string
        }}>(
          'SELECT revision,state FROM player_character_bellrunner_second_job WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        const state=saved.rows[0]?.state;
        if(!state||state.phase!=='exited'||Number(saved.rows[0].revision)!==state.revision){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_second_job_state'});
        }
        const confrontation=await client.query<{revision:string|number;state:{
          revision:number;phase:string;branch:string
        }}>(
          'SELECT revision,state FROM player_character_bellrunner_dogman WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        const active=confrontation.rows[0];
        if(active&&(active.state.phase==='done'||active.state.branch!==state.branch||
          Number(active.revision)!==active.state.revision)){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_dogman_state'});
        }
        await client.query(
          'DELETE FROM player_character_bellrunner_dogman_receipts WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          'DELETE FROM player_character_bellrunner_dogman WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          "DELETE FROM player_character_bellrunner_second_job_receipts WHERE character_id=$1 AND result->'state'->>'phase'='exited'",
          [req.params.id]);
        const next={...state,phase:state.branch==='machinery'?'finish':'done',
          revision:state.revision+1};
        await client.query(
          'UPDATE player_character_bellrunner_second_job SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
          [req.params.id,next.revision,JSON.stringify(next)]);
        await client.query(
          "UPDATE player_characters SET tutorial_stage=4,tutorial_status='IN_PROGRESS' WHERE id=$1",
          [req.params.id]);
        await client.query('COMMIT');transaction=false;
        return {stage:4,tutorialStatus:'IN_PROGRESS',
          route:'/characters/'+req.params.id+'/bellrunner/second-job',coinDelta:0};
      }
      if(bellrunner&&expectedStage===6){
        // Local testing only: a full Dogman replay follows Flint's policy.
        // Lock the owned character first (above), then these two state rows.
        // The combat adapter uses that same lock before committing any turn.
        const saved=await client.query<{revision:string|number;state:{
          revision:number;phase:string;line:number;stance:string|null
        }}>(
          'SELECT revision,state FROM player_character_bellrunner_dogman WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        const state=saved.rows[0]?.state;
        if(!state||state.phase!=='done'||
          !['street','cart','defend'].includes(state.stance??'')||
          Number(saved.rows[0].revision)!==state.revision){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_dogman_state'});
        }
        const combat=await client.query<{state:{player:{hp:number}};stance:string}>(
          'SELECT state,stance FROM player_character_dogman_combat WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        let restoredHealth=c.rows[0].current_health;
        if(combat.rowCount){
          const encounter=combat.rows[0];
          if(encounter.stance!==state.stance||
             encounter.state.player.hp!==c.rows[0].current_health){
            await client.query('ROLLBACK');transaction=false;
            return reply.code(409).send({error:'unsafe_combat_health_state'});
          }
          const start=await client.query<{response:{
            revision:number;stance:string;player:{hp:number}
          }}>(
            "SELECT response FROM player_character_dogman_combat_receipts WHERE character_id=$1 AND response->>'revision'='0' ORDER BY created_at ASC,request_id ASC LIMIT 1",
            [req.params.id]);
          const first=start.rows[0]?.response;
          const viewStance=state.stance==='street'?'moving'
            :state.stance==='defend'?'brace':'cart';
          if(first?.revision!==0||first.stance!==viewStance||
             !Number.isSafeInteger(first.player?.hp)||
             first.player.hp<=0||first.player.hp>c.rows[0].max_health){
            await client.query('ROLLBACK');transaction=false;
            return reply.code(409).send({error:'unsafe_combat_initial_health'});
          }
          restoredHealth=first.player.hp;
        }
        // Replaying requires clearing both sets of receipts, so an old action
        // ID cannot revive a prior fight or reapply its Health loss.
        await client.query(
          'DELETE FROM player_character_dogman_combat_receipts WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          'DELETE FROM player_character_dogman_combat WHERE character_id=$1',
          [req.params.id]);
        const next={...state,phase:'gate',line:7,stance:null,
          revision:state.revision+1};
        await client.query(
          "DELETE FROM player_character_bellrunner_dogman_receipts WHERE character_id=$1 AND result->'state'->>'phase'='done'",
          [req.params.id]);
        await client.query(
          'UPDATE player_character_bellrunner_dogman SET revision=$2,state=$3::jsonb,updated_at=NOW() WHERE character_id=$1',
          [req.params.id,next.revision,JSON.stringify(next)]);
        await client.query(
          "UPDATE player_characters SET tutorial_stage=5,tutorial_status='IN_PROGRESS',current_health=$2 WHERE id=$1",
          [req.params.id,restoredHealth]);
        await client.query('COMMIT');transaction=false;
        return {stage:5,tutorialStatus:'IN_PROGRESS',
          route:'/characters/'+req.params.id+'/bellrunner/dogman',coinDelta:0};
      }
      if(bellrunner){
        // Developer-only Stage 2 -> 1 rewind, preserving all currencies.
        if(expectedStage!==2||c.rows[0].tutorial_status!=='IN_PROGRESS'){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'wrong_work_phase'});
        }
        const accepted=await client.query(
          'SELECT revision FROM player_character_bellrunner_dispatch WHERE character_id=$1 FOR UPDATE',
          [req.params.id]);
        if(!accepted.rowCount){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_dispatch_state'});
        }
        await client.query(
          'DELETE FROM player_character_bellrunner_dispatch_work_receipts WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          'DELETE FROM player_character_bellrunner_dispatch_receipts WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          'DELETE FROM player_character_bellrunner_dispatch WHERE character_id=$1',
          [req.params.id]);
        await client.query(
          "UPDATE player_characters SET tutorial_stage=1,tutorial_status='NOT_STARTED' WHERE id=$1",
          [req.params.id]);
        await client.query('COMMIT');transaction=false;
        return {stage:1,tutorialStatus:'NOT_STARTED',
          route:'/characters/'+req.params.id+'/opening',coinDelta:0};
      }

      if(expectedStage===8){
        // Developer-only replay of the final home scene. Restore the already
        // PAID clinic interaction without refunding its fee or touching combat.
        // The character lock serializes this with the Stage 8 action API.
        const clinic=await client.query<{revision:number;state:ClinicState}>(
          'SELECT revision,state FROM player_character_clinic WHERE character_id=$1 FOR UPDATE',
          [req.params.id]
        );
        const visit=clinic.rows[0]?.state;
        const currentStatus=c.rows[0].tutorial_status;
        if(!visit||visit.phase!=='LEFT'||visit.paid!==true||
           !visit.after||visit.after.hp!==c.rows[0].current_health||
           visit.after.hp!==c.rows[0].max_health){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_clinic_state'});
        }
        const saved=await client.query<{state:{phase:string;outcome:string;origin:string}}>(
          'SELECT state FROM player_character_tutorial_home WHERE character_id=$1 FOR UPDATE',
          [req.params.id]
        );
        const prior=saved.rows[0]?.state;
        const validProgress=prior
          ?prior.origin==='Millhand'&&prior.outcome===visit.outcome&&
             ((prior.phase==='COMPLETE'&&currentStatus==='COMPLETED')||
               (prior.phase!=='COMPLETE'&&currentStatus==='IN_PROGRESS'))
          :currentStatus==='NOT_STARTED';
        if(!validProgress){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_home_state'});
        }
        // Delete receipts before their FK parent. Revision changes prevent
        // stale in-flight clinic/home commands from replaying old transitions.
        await client.query(
          'DELETE FROM player_character_tutorial_home_receipts WHERE character_id=$1',
          [req.params.id]
        );
        await client.query(
          'DELETE FROM player_character_tutorial_home WHERE character_id=$1',
          [req.params.id]
        );
        // Invalidate only the previously saved departure receipt: replaying
        // it after rewind must not yield an obsolete LEFT success response.
        // Keep paid examination receipts and the single fee intact.
        await client.query(
          "DELETE FROM player_character_clinic_receipts WHERE character_id=$1 AND response->>'phase'='LEFT'",
          [req.params.id]
        );
        const reopened={...visit,phase:'PAID',revision:visit.revision+1};
        await client.query(
          'UPDATE player_character_clinic SET state=$2::jsonb,revision=$3,updated_at=NOW() WHERE character_id=$1',
          [req.params.id,JSON.stringify(reopened),reopened.revision]
        );
        await client.query(
          "UPDATE player_characters SET tutorial_stage=7,tutorial_status='IN_PROGRESS' WHERE id=$1",
          [req.params.id]
        );
        await client.query('COMMIT');transaction=false;
        return {
          stage:7,tutorialStatus:'IN_PROGRESS',
          route:'/characters/'+req.params.id+'/millhand/clinic',
          coinDelta:0
        };
      }

      if(expectedStage===7){
        // Developer replay from the paid or unpaid clinic must start a fresh
        // Stage 6 encounter, not reopen an already-finished Flint fight.
        // The character row lock serializes this with clinic payment/turns.
        const clinic=await client.query<{state:ClinicState}>(
          'SELECT state FROM player_character_clinic WHERE character_id=$1 FOR UPDATE',
          [req.params.id]
        );
        const combat=await client.query<{state:CombatState;stance:string}>(
          'SELECT state,stance FROM player_character_flint_combat WHERE character_id=$1 FOR UPDATE',
          [req.params.id]
        );
        const saved=clinic.rows[0]?.state;
        const fight=combat.rows[0];
        if(!saved||!fight||fight.state.status!=='finished'||
          (fight.state.outcome!=='player_victory'&&fight.state.outcome!=='player_defeat')||
          saved.outcome!==fight.state.outcome||
          saved.before.hp!==fight.state.player.hp||
          saved.before.hpMax!==fight.state.player.hpMax||
          (saved.phase==='LEFT'||c.rows[0].tutorial_status!=='IN_PROGRESS')){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_clinic_state'});
        }
        const wasPaid=saved.paid===true;
        if(wasPaid !== (saved.phase==='PAID')||
          (wasPaid?(!saved.after||
            saved.after.hp!==c.rows[0].current_health||
            saved.after.hp!==c.rows[0].max_health)
            :saved.after!==null||
              c.rows[0].current_health!==fight.state.player.hp)){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_clinic_health_state'});
        }
        // Replay always restores the exact pre-fight Health captured by
        // the initial saved revision-zero combat receipt.
        const start=await client.query<{response:{
          revision:number;stance:string;player:{hp:number}
        }}>(
          "SELECT response FROM player_character_flint_combat_receipts WHERE character_id=$1 AND response->>'revision'='0' ORDER BY created_at ASC,request_id ASC LIMIT 1",
          [req.params.id]
        );
        const first=start.rows[0]?.response;
        const wage=await client.query<{state:WageClaimState}>(
          'SELECT state FROM player_character_wage_claim WHERE character_id=$1 FOR UPDATE',
          [req.params.id]
        );
        if(!first||first.revision!==0||
          !Number.isSafeInteger(first.player?.hp)||first.player.hp<=0||
          first.player.hp>c.rows[0].max_health||
          first.stance!==fight.stance||
          wage.rows[0]?.state.phase!=='DONE'||
          wage.rows[0].state.stance!==fight.stance){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_combat_initial_health'});
        }
        // The refund and both stage resets form one transaction. In-flight
        // pay attempts either finish before this lock or see stale_stage.
        await client.query(
          'DELETE FROM player_character_clinic_receipts WHERE character_id=$1',
          [req.params.id]
        );
        await client.query(
          'DELETE FROM player_character_clinic WHERE character_id=$1',
          [req.params.id]
        );
        await client.query(
          'DELETE FROM player_character_flint_combat_receipts WHERE character_id=$1',
          [req.params.id]
        );
        await client.query(
          'DELETE FROM player_character_flint_combat WHERE character_id=$1',
          [req.params.id]
        );
        await client.query(
          "UPDATE player_characters SET tutorial_stage=6,tutorial_status='NOT_STARTED',current_health=$2,coins=coins+$3 WHERE id=$1",
          [req.params.id,first.player.hp,wasPaid?10:0]
        );
        await client.query('COMMIT');transaction=false;
        return {
          stage:6,tutorialStatus:'NOT_STARTED',
          route:'/characters/'+req.params.id+'/millhand/combat',
          // Presentation-only fact from the committed transaction; no new mutation.
          coinDelta:wasPaid?10:0
        };
      }

      if(expectedStage===6){
        // Local testing only: restore the exact Health recorded when this
        // fight began. Never infer it from max Health or manufacture healing.
        // The same owned character-row lock serializes this with combat turns.
        const claim=await client.query<{state:WageClaimState}>(
          'SELECT state FROM player_character_wage_claim WHERE character_id=$1 FOR UPDATE',
          [req.params.id]
        );
        if(claim.rows[0]?.state.phase!=='DONE'||!claim.rows[0].state.stance){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_wage_claim_state'});
        }
        const combat=await client.query<{
          state:{player:{hp:number}};stance:string
        }>(
          'SELECT state,stance FROM player_character_flint_combat WHERE character_id=$1 FOR UPDATE',
          [req.params.id]
        );
        let restoredHealth=c.rows[0].current_health;
        if(combat.rowCount){
          const saved=combat.rows[0];
          if(saved.stance!==claim.rows[0].state.stance||
              saved.state.player.hp!==c.rows[0].current_health){
            await client.query('ROLLBACK');transaction=false;
            return reply.code(409).send({error:'unsafe_combat_health_state'});
          }
          // Original start receipt: response revision 0. A final-round
          // snapshot would be an unsafe surrogate for pre-fight Health.
          const start=await client.query<{response:{
            revision:number;stance:string;player:{hp:number}
          }}>(
            "SELECT response FROM player_character_flint_combat_receipts WHERE character_id=$1 AND response->>'revision'='0' ORDER BY created_at ASC,request_id ASC LIMIT 1",
            [req.params.id]
          );
          const first=start.rows[0]?.response;
          if(first?.revision!==0||first.stance!==saved.stance||
             !Number.isSafeInteger(first.player?.hp)||
             first.player.hp<=0||first.player.hp>c.rows[0].max_health){
            await client.query('ROLLBACK');transaction=false;
            return reply.code(409).send({error:'unsafe_combat_initial_health'});
          }
          restoredHealth=first.player.hp;
        }
        let prior:WageClaimState;
        try{
          prior=previousWageClaim(claim.rows[0].state);
        }catch(error){
          if(!(error instanceof WageClaimInvalidAction))throw error;
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_wage_claim_state'});
        }
        if(prior.phase!=='CHOOSE_STANCE'||prior.stance!==null){
          await client.query('ROLLBACK');transaction=false;
          return reply.code(409).send({error:'unsafe_wage_claim_state'});
        }
        // Receipts must be cleared BEFORE their saved encounters. Replaying
        // a previous request may never reapply old damage after a rewind.
        await client.query(
          'DELETE FROM player_character_flint_combat_receipts WHERE character_id=$1',
          [req.params.id]
        );
        await client.query(
          'DELETE FROM player_character_flint_combat WHERE character_id=$1',
          [req.params.id]
        );
        await client.query(
          'DELETE FROM player_character_wage_claim_receipts WHERE character_id=$1',
          [req.params.id]
        );
        await client.query(
          'UPDATE player_character_wage_claim SET state=$2::jsonb,revision=$3,updated_at=NOW() WHERE character_id=$1',
          [req.params.id,JSON.stringify(prior),prior.revision]
        );
        await client.query(
          "UPDATE player_characters SET tutorial_stage=5,tutorial_status='IN_PROGRESS',current_health=$2 WHERE id=$1",
          [req.params.id,restoredHealth]
        );
        await client.query('COMMIT');transaction=false;
        return {
          stage:5,tutorialStatus:'IN_PROGRESS',
          route:'/characters/'+req.params.id+'/millhand/wage-claim'
        };
      }

      const plate=await client.query<{state:{phase:string}}>(
        'SELECT state FROM player_character_platework WHERE character_id=$1',[req.params.id]
      );
      const stamp=await client.query<{state:{phase:string;branch:MissingStampBranch|null}}>(
        'SELECT state FROM player_character_missing_stamp WHERE character_id=$1',[req.params.id]
      );
      const job=await client.query<{state:{phase:string;branch:MissingStampBranch}}>(
        'SELECT state FROM player_character_second_job WHERE character_id=$1',[req.params.id]
      );
      if(job.rows[0] && job.rows[0].state.branch!==stamp.rows[0]?.state.branch){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'unsafe_second_job_state'});
      }
      let plan;
      try {
        plan=planMillhandRewind(
          c.rows[0].tutorial_stage,c.rows[0].major_skill_bonuses,
          stamp.rows[0]?.state.branch??null,
          plate.rows[0]?.state.phase??null,
          stamp.rows[0]?.state.phase??null,
          job.rows[0]?.state.phase??null
        );
      } catch(e) {
        if(!(e instanceof MillhandRewindInvalid))throw e;
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:e.message});
      }

      // Wipe only the stage replayed (and any dependent future stage). Receipt
      // clearing prevents old successful requests from replaying stale results.
      // A Stage 5→4 development rewind must also erase Stage 5 action receipts;
      // otherwise a stale Flint confrontation survives a replayed Stage 4 route.
      if(expectedStage===5){
        await client.query('DELETE FROM player_character_wage_claim_receipts WHERE character_id=$1',[req.params.id]);
        await client.query('DELETE FROM player_character_wage_claim WHERE character_id=$1',[req.params.id]);
      }
      if(plan.removeSecondJob){
        await client.query('DELETE FROM player_character_second_job_receipts WHERE character_id=$1',[req.params.id]);
        await client.query('DELETE FROM player_character_second_job WHERE character_id=$1',[req.params.id]);
      }
      if(plan.removeMissingStamp){
        await client.query('DELETE FROM player_character_missing_stamp_receipts WHERE character_id=$1',[req.params.id]);
        await client.query('DELETE FROM player_character_missing_stamp WHERE character_id=$1',[req.params.id]);
      }
      if(plan.resetPlatework||plan.removePlatework){
        await client.query('DELETE FROM player_character_work_receipts WHERE character_id=$1',[req.params.id]);
      }
      if(plan.resetPlatework){
        await client.query(
          'UPDATE player_character_platework SET state=$2::jsonb,revision=0,updated_at=NOW() WHERE character_id=$1',
          [req.params.id,JSON.stringify(INITIAL_PLATEWORK)]
        );
      }
      if(plan.removePlatework){
        await client.query('DELETE FROM player_character_platework WHERE character_id=$1',[req.params.id]);
      }
      const status=plan.toStage===2?'IN_PROGRESS':'NOT_STARTED';
      await client.query(
        'UPDATE player_characters SET tutorial_stage=$2,tutorial_status=$3,major_skill_bonuses=$4::jsonb WHERE id=$1',
        [req.params.id,plan.toStage,status,JSON.stringify(plan.nextBonuses)]
      );
      await client.query('COMMIT');transaction=false;
      const route=plan.toStage===1?'opening':plan.toStage===2?'millhand/work':plan.toStage===3?'millhand/missing-stamp':'millhand/second-job';
      return {stage:plan.toStage,tutorialStatus:status,route:'/characters/'+req.params.id+'/'+route};
    } catch(e) {
      if(transaction){try{await client.query('ROLLBACK');}catch{/* keep original error */}}
      if((e as {code?:string})?.code==='42P01')
        return reply.code(503).send({
          error:bellrunner?'bellrunner_migration_required':expectedStage===8?'home_schema_missing':expectedStage===7?'clinic_schema_missing':expectedStage===6?'combat_schema_missing':'second_job_schema_missing',
          setup:bellrunner?'npm run bellrunner:migrate':expectedStage===8?'npm run home:migrate':expectedStage===7?'npm run clinic:migrate':expectedStage===6?'npm run combat:migrate':'npm run second-job:migrate'
        });
      throw e;
    } finally {client.release();}
  });
}
