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
