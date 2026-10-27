/**
 * Local developer tool for replaying Millhand introduction stages with one
 * existing character. Registered only when the API binds to loopback AND
 * NODE_ENV is not production. This is not a normal gameplay capability.
 */
import type {FastifyInstance} from 'fastify';
import {fromNodeHeaders} from 'better-auth/node';
import pg from 'pg';
import {auth} from './auth.js';
import {INITIAL_PLATEWORK,planMillhandRewind,MillhandRewindInvalid} from '@the-pall/game-core';
import type {MissingStampBranch} from '@the-pall/game-core';

const db = new pg.Pool({connectionString:process.env.DATABASE_URL});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params={id:string};
type CharacterState={origin:string;tutorial_stage:number;tutorial_status:string;major_skill_bonuses:Record<string,number>};

export function registerMillhandStageRewindRoutes(app:FastifyInstance){
  app.addHook('onClose',async()=>{await db.end();});
  const host=process.env.API_HOST??'127.0.0.1';
  const loopback=host==='127.0.0.1'||host==='::1'||host==='localhost';
  if(process.env.NODE_ENV==='production'||!loopback)return;

  app.get<{Params:Params}>('/api/characters/:id/dev/rewind-stage',async(req,reply)=>{
    const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
    if(!session?.user.emailVerified)return reply.code(401).send({error:'unauthorized'});
    if(!UUID.test(req.params.id))return reply.code(404).send({error:'not_found'});
    const result=await db.query<CharacterState>(
      'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses FROM player_characters WHERE id=$1 AND account_id=$2',
      [req.params.id,session.user.id]
    );
    if(!result.rowCount||result.rows[0].origin!=='Millhand')
      return reply.code(404).send({error:'not_found'});
    const stage=result.rows[0].tutorial_stage;
    return {enabled:true,canRewind:stage>=2&&stage<=4,stage,targetStage:stage>1&&stage<=4?stage-1:null};
  });

  app.post<{Params:Params}>('/api/characters/:id/dev/rewind-stage',async(req,reply)=>{
    const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
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
    if(!Number.isSafeInteger(expectedStage)||(expectedStage as number)<2||(expectedStage as number)>4)
      return reply.code(400).send({error:'invalid_stage'});

    const client=await db.connect();
    let transaction=false;
    try {
      await client.query('BEGIN');transaction=true;
      // Serialise against BOTH Stage 2 and Stage 3 gameplay commands by
      // locking the same owner-scoped character row first.
      const c=await client.query<CharacterState>(
        'SELECT origin,tutorial_stage,tutorial_status,major_skill_bonuses FROM player_characters WHERE id=$1 AND account_id=$2 FOR UPDATE',
        [req.params.id,session.user.id]
      );
      if(!c.rowCount||c.rows[0].origin!=='Millhand'){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(404).send({error:'not_found'});
      }
      if(c.rows[0].tutorial_stage!==expectedStage){
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:'stale_stage',stage:c.rows[0].tutorial_stage});
      }
      const plate=await client.query<{state:{phase:string}}>(
        'SELECT state FROM player_character_platework WHERE character_id=$1',[req.params.id]
      );
      const stamp=await client.query<{state:{phase:string;branch:MissingStampBranch|null}}>(
        'SELECT state FROM player_character_missing_stamp WHERE character_id=$1',[req.params.id]
      );
      let plan;
      try {
        plan=planMillhandRewind(
          c.rows[0].tutorial_stage,c.rows[0].major_skill_bonuses,
          stamp.rows[0]?.state.branch??null,
          plate.rows[0]?.state.phase??null,
          stamp.rows[0]?.state.phase??null
        );
      } catch(e) {
        if(!(e instanceof MillhandRewindInvalid))throw e;
        await client.query('ROLLBACK');transaction=false;
        return reply.code(409).send({error:e.message});
      }

      // Wipe only the stage replayed (and any dependent future stage). Receipt
      // clearing prevents old successful requests from replaying stale results.
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
      const route=plan.toStage===1?'opening':plan.toStage===2?'millhand/work':'millhand/missing-stamp';
      return {stage:plan.toStage,tutorialStatus:status,route:'/characters/'+req.params.id+'/'+route};
    } catch(e) {
      if(transaction){try{await client.query('ROLLBACK');}catch{/* keep original error */}}
      throw e;
    } finally {client.release();}
  });
}
