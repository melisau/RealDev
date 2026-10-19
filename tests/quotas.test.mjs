import test from 'node:test';import assert from 'node:assert/strict';import {api} from '../server/api.mjs';import {database} from '../server/db.mjs';import {localDb} from '../scripts/local-db.mjs';
const origin='https://realdev.test';
const client=(DB,user)=>async(path,body)=>{const r=await api(new Request(origin+'/api/'+path,{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':user,Origin:origin,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}),{DB});return {status:r.status,body:await r.json()};};
const recent=()=>new Date(Date.now()-60000).toISOString(),old=()=>new Date(Date.now()-20*60000).toISOString();
async function seed(DB,table,user,count,taskId,at=recent){const db=database({DB});for(let i=0;i<count;i++){if(table==='code_runs')await db.write('INSERT INTO code_runs (id,user_id,task_id,code,result,created_at) VALUES (?,?,?,?,?,?)',`seed-${taskId}-${user}-${i}`,user,taskId,'x','{"report":{}}',at());else await db.write('INSERT INTO practice_submissions (id,user_id,task_id,modality,code,explanation,result,created_at) VALUES (?,?,?,?,?,?,?,?)',`seed-${user}-${i}`,user,taskId,'review','','x','{"verification":"draft"}',at());}}
test('playground and code-task execution is limited per account; replays and other accounts are unaffected',async()=>{
 const DB=localDb(),a=client(DB,'a'),b=client(DB,'b');
 const first={id:'quota-first',taskId:'playground',code:'console.log(1)'};assert.equal((await a('code-runs',first)).status,200);
 await seed(DB,'code_runs','a',29,'playground');
 assert.equal((await a('code-runs',{id:'quota-over',taskId:'playground',code:'1'})).status,429);
 assert.equal((await a('code-runs',{id:'quota-over',taskId:'playground',code:'1'})).body.error,'code_rate_limited');
 assert.equal((await a('code-runs',first)).status,200,'an idempotent replay is not a new execution');
 assert.equal((await b('code-runs',{id:'quota-b',taskId:'playground',code:'1'})).status,200);
 const DB2=localDb();await seed(DB2,'code_runs','a',40,'playground',old);assert.equal((await client(DB2,'a')('code-runs',{id:'quota-window',taskId:'playground',code:'1'})).status,200,'runs older than the window do not count');
 DB.close();DB2.close();
});
test('Piston execution has its own per-account limit, checked before the runner is contacted',async()=>{
 const DB=localDb(),a=client(DB,'a');await seed(DB,'code_runs','a',12,'piston-python');await seed(DB,'code_runs','a',40,'playground');
 const r=await a('piston-runs',{id:'piston-over',language:'python',code:'print(1)',stdin:''});assert.equal(r.status,429);assert.equal(r.body.error,'piston_rate_limited');DB.close();
});
test('practice submissions are limited per account after replay detection',async()=>{
 const DB=localDb(),a=client(DB,'a');await seed(DB,'practice_submissions','a',30,'review-sql-injection');
 const r=await a('practice',{id:'practice-over',taskId:'review-sql-injection',code:'',explanation:'draft text',mode:'draft'});assert.equal(r.status,429);assert.equal(r.body.error,'practice_rate_limited');
 assert.equal((await client(DB,'b')('practice',{id:'practice-b',taskId:'review-sql-injection',code:'',explanation:'draft text',mode:'draft'})).status,200);DB.close();
});
test('GitHub repository changes are limited per account per day before any GitHub request',async()=>{
 const DB=localDb(),db=database({DB}),realFetch=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return new Response('{}',{status:404});};
 const put=user=>api(new Request(origin+'/api/github',{method:'PUT',headers:{'oai-authenticated-user-id':user,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({repository:'melisau/RealDev'})}),{DB});
 try{await db.write('INSERT INTO ai_usage (user_id,day,kind,count) VALUES (?,?,?,?)','a',new Date().toISOString().slice(0,10),'github-repo',20);
  const limited=await put('a');assert.equal(limited.status,429);assert.equal((await limited.json()).error,'github_rate_limited');assert.equal(calls,0);
  assert.notEqual((await put('b')).status,429);assert.ok(calls>0);
  assert.equal((await db.one("SELECT count FROM ai_usage WHERE user_id='a' AND kind='text'")),null,'the GitHub counter does not consume AI quota');}
 finally{globalThis.fetch=realFetch;DB.close();}
});
