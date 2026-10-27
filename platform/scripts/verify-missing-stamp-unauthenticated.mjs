// Negative smoke test only. Does not mutate any real character.
import {strict as assert} from 'node:assert';
const base='http://127.0.0.1:8788';
const path='/api/characters/00000000-0000-4000-8000-000000000001/millhand/missing-stamp';
async function send(method,headers={},body=undefined){
  const r=await fetch(base+path,{method,headers,body,redirect:'manual'});
  return {status:r.status,body:await r.json().catch(()=>null)};
}
try {
  const healthy=await fetch(base+'/health');
  assert.equal(healthy.status,200,'API must be running');
  for(const [name,method,headers,body] of [
    ['anonymous evidence read','GET',{},undefined],
    ['anonymous Stage 3 mutation','POST',{'content-type':'application/json',origin:'http://127.0.0.1:5173'},
      JSON.stringify({action:'read_cancellation_slip',expectedRevision:0,requestId:'00000000-0000-4000-8000-000000000999'})],
    ['forged session read','GET',{'cookie':'better-auth.session_token=fake','x-account-id':'fake'},undefined]
  ]){
    const result=await send(method,headers,body);
    assert.equal(result.status,401,name+' must require a real login');
    assert.equal(result.body?.error,'unauthorized',name+' expected generic unauthorised response');
    console.log('PASS:',name,'blocked');
  }
  console.log('PASS: Missing Stamp anonymous protection. Authenticated ownership and idempotency need browser/API integration tests.');
}catch(e){
  console.error('FAILED:',e instanceof Error?e.message:String(e));
  process.exitCode=1;
}
