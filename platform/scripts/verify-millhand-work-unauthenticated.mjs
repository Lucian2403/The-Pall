import {strict as assert} from 'node:assert';

const base = 'http://127.0.0.1:8788';
const path = '/api/characters/00000000-0000-4000-8000-000000000001/millhand/work';
async function request(method,headers={},body=undefined){
  const response=await fetch(base+path,{method,headers,body,redirect:'manual'});
  return {status:response.status,body:await response.json().catch(()=>null)};
}
try {
  const healthy=await fetch(base+'/health');
  assert.equal(healthy.status,200,'API must be running');
  console.log('PASS: API health available');
  for (const [what,method,headers,body] of [
    ['anonymous read','GET',{},undefined],
    ['anonymous work handoff','POST',{'content-type':'application/json','origin':'http://127.0.0.1:5173'},
      JSON.stringify({requestId:'00000000-0000-4000-8000-000000000999',expectedRevision:0,action:'take_work_paper'})],
    ['forged session read','GET',{'cookie':'better-auth.session_token=fake','x-account-id':'fake'},undefined]
  ]) {
    const result=await request(method,headers,body);
    assert.equal(result.status,401,what+' expected 401');
    assert.equal(result.body?.error,'unauthorized',what+' expected unauthorized error');
    console.log('PASS: '+what+' blocked');
  }
  console.log('Millhand stage API anonymous checks passed. Logged-in ownership and concurrency need manual QA.');
} catch(e) {
  console.error('FAILED:',e instanceof Error?e.message:String(e));
  process.exitCode=1;
}
