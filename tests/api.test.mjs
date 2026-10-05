import test from 'node:test';import assert from 'node:assert/strict';import {api} from '../server/api.mjs';import {localDb} from '../scripts/local-db.mjs';
const origin='https://realdev.test';
function client(DB,user='user-a'){return async(path,body,method='POST',other={})=>{const headers={...(user?{'oai-authenticated-user-id':user,'oai-authenticated-user-email':user+'@test.local'}:{}),...(body?{'Content-Type':'application/json',Origin:origin}:{}),...other};const response=await api(new Request(origin+'/api/'+path,{method:body?method:'GET',headers,body:body?JSON.stringify(body):undefined}),{DB});return {status:response.status,body:await response.json()};};}
test('account ownership, durable state, idempotency, hints and profile route flow',async()=>{
 const DB=localDb();const a=client(DB),b=client(DB,'user-b');
 assert.equal((await client(DB,null)('state')).status,401);
 assert.equal((await a('profile',{goals:['game'],dailyMinutes:10},'PUT',{Origin:'https://evil.test'})).status,403);
 assert.equal((await a('profile',{goals:['game'],dailyMinutes:10},'PUT')).status,200);
 assert.deepEqual((await a('state')).body.profile.goals,['game']);assert.equal((await b('state')).body.profile.saved,false);
 const started=(await a('runs',{id:'run-1',kind:'baseline'})).body;assert.equal(started.taskIds.length,8);
 assert.equal((await a('runs',{id:'run-2',kind:'baseline'})).body.id,'run-1');
 assert.equal((await b('run?id=run-1')).status,404);
 assert.equal((await b('hint',{runId:'run-1',taskId:'react-1'})).status,404);
 assert.equal((await a('hint',{runId:'run-1',taskId:'react-1'})).status,200);
 const answer={runId:'run-1',taskId:'react-1',answer:0,explanation:'same render snapshot',confidence:2,skipped:false};
 const saved=(await a('answer',answer)).body;assert.equal(saved.attempt.hinted,1);assert.equal(saved.attempt.score,100);
 assert.equal((await a('answer',{...answer,answer:1})).body.attempt.id,saved.attempt.id);
 const reloaded=(await a('state')).body;assert.equal(reloaded.attempts.length,1);assert.equal(reloaded.activeRun.attempts.length,1);assert.equal((await b('state')).body.attempts.length,0);
 assert.equal((await a('answer',{...answer,taskId:'git-1'})).status,409);
 DB.close();
});
test('unsupported code is not recorded, completed run and history survive reload',async()=>{
 const DB=localDb(),a=client(DB);await a('runs',{id:'practice-1',kind:'practice',taskId:'predicate-1'});
 const answer={runId:'practice-1',taskId:'predicate-1',answer:'while(true){}',explanation:'test',confidence:1,skipped:false};
 assert.equal((await a('answer',answer)).status,422);assert.equal((await a('state')).body.attempts.length,0);
 const result=(await a('answer',{...answer,answer:'n > 0 && n % 2 === 0'})).body;assert.equal(result.run.complete,true);assert.equal(result.attempt.score,100);
 assert.equal((await a('run?id=practice-1')).body.complete,true);DB.close();
});
test('database failure has a recoverable error and never reports saved',async()=>{const r=await client(null)('state');assert.equal(r.status,503);assert.equal(r.body.error,'storage_unavailable');});
test('registration is durable, validates fields and isolates accounts and code history',async()=>{
 const DB=localDb(),a=client(DB),b=client(DB,'user-b');
 const p={displayName:'Melisa Çığ',technologies:'C#, React, Unity',goals:['fullstack'],dailyMinutes:15};
 assert.equal((await a('profile',{...p,displayName:' '},'PUT')).status,400);
 assert.equal((await a('profile',p,'PUT')).status,200);
 const first=(await a('state')).body;assert.equal(first.account.display_name,p.displayName);assert.equal((await b('state')).body.account,null);
 await a('profile',{...p,technologies:'Python'},'PUT');const later=(await a('state')).body;assert.equal(later.account.created_at,first.account.created_at);assert.equal(later.account.technologies,'Python');
 const code={id:'code-one',taskId:'sum-positive',code:'function solve(numbers) { return numbers.filter(n => n > 0).reduce((sum, n) => sum + n, 0); }',result:{passed:999,total:999}};
 const verified=await a('code-runs',code);assert.equal(verified.status,200);assert.equal(verified.body.verification,'server-verified');assert.equal(verified.body.result.total,4);assert.equal(verified.body.result.passed,4);
 await a('code-runs',code);assert.equal((await a('code-runs',{...code,code:'function solve(n){return 999}'})).status,409);
 assert.equal((await a('code-runs')).body.records.length,1);assert.equal((await b('code-runs')).body.records.length,0);assert.equal((await b('code-runs',code)).status,404);
 const practical={id:'data-code-one',taskId:'data-code-dedupe',code:'function solve(records){const seen=new Set();return records.filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true})}'};
 const executed=await a('code-runs',practical);assert.equal(executed.body.result.passed,3);assert.equal(executed.body.result.total,3);
 const measured=(await a('state')).body;const data=measured.evidence.find(e=>e.area==='data');assert.equal(data.distinct,1);assert.equal(data.independent,1);assert.equal(data.status,'initial');assert.equal(measured.route.find(r=>r.area==='data').taskId,'error-data-unique');
 assert.equal(measured.attempts.length,0);DB.close();
});
test('notes persist with answers, are idempotent, editable and user-owned',async()=>{
 const DB=localDb(),a=client(DB),b=client(DB,'user-b');
 await a('runs',{id:'note-run',kind:'practice',taskId:'cors-1'});
 const note={id:'note-1',text:'API nedir?'};
 const answer={runId:'note-run',taskId:'cors-1',answer:2,explanation:'headers',confidence:1,skipped:false,note};
 assert.equal((await a('answer',answer)).status,200);await a('answer',answer);
 let state=(await a('state')).body;assert.equal(state.notes.length,1);assert.equal(state.notes[0].body,'API nedir?');assert.equal(state.notes[0].task_id,'cors-1');
 assert.equal((await b('state')).body.notes.length,0);
 assert.equal((await b('notes',{id:note.id,resolved:true},'PUT')).status,404);
 assert.equal((await b('notes',{id:note.id,text:'hijack',taskId:'cors-1'})).status,404);
 await a('notes',{id:note.id,text:'API ve endpoint farkı',taskId:'cors-1'});
 await a('notes',{id:note.id,resolved:true},'PUT');state=(await a('state')).body;assert.equal(state.notes[0].resolved,1);assert.equal(state.notes[0].body,'API ve endpoint farkı');
 await a('notes',{id:note.id,resolved:false},'PUT');assert.equal((await a('state')).body.notes[0].resolved,0);DB.close();
});
test('saved questions keep the wrong answer, survive reload and cannot cross accounts',async()=>{
 const DB=localDb(),a=client(DB),b=client(DB,'user-b');await a('runs',{id:'library-run',kind:'practice',taskId:'react-1'});
 const response=await a('answer',{runId:'library-run',taskId:'react-1',answer:1,explanation:'thought both increments apply',confidence:2,skipped:false});const id=response.body.attempt.id;
 assert.equal(response.body.attempt.score,0);assert.equal((await b('library',{attemptId:id})).status,404);
 assert.equal((await a('library',{attemptId:id})).status,200);await a('library',{attemptId:id});
 const state=(await a('state')).body;assert.equal(state.library.length,1);assert.equal(state.library[0].attempt_id,id);assert.equal(state.attempts.find(x=>x.id===id).answer,1);assert.equal((await b('state')).body.library.length,0);DB.close();
});
