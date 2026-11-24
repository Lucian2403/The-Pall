import assert from 'node:assert/strict';
import {test} from 'node:test';
import Fastify from 'fastify';
import pg from 'pg';
import {getGameplayPool,databasePoolMax} from '../apps/api/src/database-pool.ts';

test('One gameplay pool belongs to each Fastify application, independent across apps',async()=>{
  const first=Fastify({logger:false});
  const second=Fastify({logger:false});
  const one=getGameplayPool(first);
  const two=getGameplayPool(second);
  try{
    assert.strictEqual(getGameplayPool(first),one);
    assert.strictEqual(getGameplayPool(second),two);
    assert.notStrictEqual(one,two);
    assert.equal(one.options.max,10);
    assert.equal(two.options.max,10);
  }finally{
    await first.close();
    await second.close();
  }
  await assert.rejects(one.connect(),/Cannot use a pool after calling end/);
  await assert.rejects(two.connect(),/Cannot use a pool after calling end/);
});

test('Injected shared pool is reused and never closed by Fastify',async()=>{
  const app=Fastify({logger:false});
  const injected=new pg.Pool({max:3});
  try{
    assert.strictEqual(getGameplayPool(app,injected),injected);
    assert.strictEqual(getGameplayPool(app),injected);
    const other=new pg.Pool({max:1});
    try{assert.throws(()=>getGameplayPool(app,other),/conflicting_gameplay_pools/);}
    finally{await other.end();}
    await app.close();
    await injected.end(); // Fails if application ended a caller-owned pool.
  }finally{
    if(!app.listening)await app.close().catch(()=>{});
  }
});

test('Connection caps are bounded and fail closed for malformed settings',()=>{
  const key='GAMEPLAY_DB_POOL_MAX';
  const old=process.env[key];
  try{
    delete process.env[key];
    assert.equal(databasePoolMax(key,10),10);
    for(const [raw,expected] of [['1',1],['8',8],['50',50]]){
      process.env[key]=raw;
      assert.equal(databasePoolMax(key,10),expected);
    }
    for(const raw of ['0','-1','51','1.5','foo',' 10','Infinity']){
      process.env[key]=raw;
      assert.throws(()=>databasePoolMax(key,10),/invalid_gameplay_db_pool_max/);
    }
  }finally{
    if(old===undefined)delete process.env[key];
    else process.env[key]=old;
  }
});

test('Identity budget can be capped independently of gameplay',()=>{
  const key='AUTH_DB_POOL_MAX';
  const old=process.env[key];
  try{
    delete process.env[key];
    assert.equal(databasePoolMax(key,4),4);
    process.env[key]='2';
    assert.equal(databasePoolMax(key,4),2);
    process.env[key]='0';
    assert.throws(()=>databasePoolMax(key,4),/invalid_auth_db_pool_max/);
  }finally{
    if(old===undefined)delete process.env[key];
    else process.env[key]=old;
  }
});
