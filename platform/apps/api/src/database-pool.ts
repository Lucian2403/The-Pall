/** One managed gameplay connection pool per Fastify application.
 * Standalone tests can inject a pool and retain ownership of its lifetime. */
import type {FastifyInstance} from 'fastify';
import pg from 'pg';

type Entry={pool:pg.Pool;owned:boolean};
const pools=new WeakMap<FastifyInstance,Entry>();

/** Refuse accidental zero, nonsensical or excessive pool allocations. */
export function databasePoolMax(name:string,fallback:number):number{
  const raw=process.env[name];
  if(raw===undefined)return fallback;
  if(!/^[1-9][0-9]*$/.test(raw)||Number(raw)>50)
    throw Error('invalid_'+name.toLowerCase());
  return Number(raw);
}

/** Reuse an app's pool across all origins, stages, Clinic, Home and Journal.
 * An injected test pool is never ended by this application. */
export function getGameplayPool(app:FastifyInstance,injected?:pg.Pool):pg.Pool{
  const existing=pools.get(app);
  if(existing){
    if(injected&&injected!==existing.pool)throw Error('conflicting_gameplay_pools');
    return existing.pool;
  }
  const owned=injected===undefined;
  const pool=injected??new pg.Pool({
    connectionString:process.env.DATABASE_URL,
    max:databasePoolMax('GAMEPLAY_DB_POOL_MAX',10)
  });
  if(owned)pool.on('error',(error)=>app.log.error({err:error},'Idle PostgreSQL gameplay connection failed'));
  pools.set(app,{pool,owned});
  app.addHook('onClose',async()=>{
    pools.delete(app);
    if(owned)await pool.end();
  });
  return pool;
}
