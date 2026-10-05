import test from 'node:test';import assert from 'node:assert/strict';
import {api} from '../server/api.mjs';import {localDb} from '../scripts/local-db.mjs';
import {advancedTasks,interviewTracks} from '../server/advanced.mjs';import {advancedSuites,advancedEvidence} from '../server/advanced-grading.mjs';
function client(DB,user='a',extra={}){return async(path,body,method='POST')=>{const r=await api(new Request('https://realdev.test/api/'+path,{method:body===undefined?'GET':method,headers:{'oai-authenticated-user-id':user,Origin:'https://realdev.test','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)}),{DB,...extra});return {status:r.status,body:await r.json()};};}
test('advanced curriculum adds nine distinct bilingual contracts and 75-minute six-stage interviews',()=>{
 assert.equal(advancedTasks.length,9);for(const task of advancedTasks){assert.equal(advancedSuites[task.id].length,5);assert.ok(task.prompt.tr&&task.prompt.en&&task.starter);assert.equal(task.tests,undefined);}
 for(const track of interviewTracks){assert.equal(track.steps.length,6);assert.equal(track.steps.reduce((sum,s)=>sum+s.minutes,0),75);}
});
test('advanced server tests ignore submitted grades, gate progress and isolate saved code',async()=>{
 const DB=localDb();const runner={fetch:async req=>new URL(req.url).pathname.endsWith('/runtimes')?Response.json([{language:'csharp',version:'6.12.0'}]):Response.json({run:{code:0,stdout:JSON.parse(await req.text()).stdin.trim().split('\n').map(row=>{const [auth,exists,n]=row.split(' ').map(Number);return !auth?401:n<=0?400:!exists?404:n>10?409:201;}).join('\n')}})};
 const a=client(DB,'a',{CUSTOMER_HTTP_PISTON:runner}),b=client(DB,'b',{CUSTOMER_HTTP_PISTON:runner});const body={id:'advanced-test',taskId:'advanced-dotnet-contract',code:'domain model',result:{passed:999}};
 assert.equal((await a('advanced-runs',{...body,taskId:'advanced-dotnet-stock'})).status,409);
 const result=await a('advanced-runs',body);assert.equal(result.status,200);assert.equal(result.body.result.passed,5);
 assert.equal((await a('advanced')).body.projects.find(p=>p.id==='dotnet-service').completedStages,1);assert.equal((await b('advanced')).body.records.length,0);assert.equal((await b('advanced-runs',body)).status,404);
 assert.equal((await a('state')).body.evidence.find(e=>e.area==='dotnet').independent,1);assert.equal((await a('advanced-runs',{...body,code:'different'})).status,409);DB.close();
});
test('a disconnected runner saves no evidence, and stale/forged suites cannot count',async()=>{
 const DB=localDb(),a=client(DB);assert.equal((await a('advanced-runs',{id:'missing',taskId:'advanced-api-validation',code:'source'})).status,503);assert.equal((await a('advanced')).body.records.length,0);
 for(const result of [{verification:'ai-provisional',report:{}},{verification:'server-verified',report:{verification:'server-verified',runner:'piston',taskId:'advanced-api-validation',suiteVersion:0,language:'python',passed:5,total:5}}])assert.deepEqual(advancedEvidence({task_id:'advanced-api-validation',result:JSON.stringify(result)}),[]);DB.close();
});
test('interview drafts resume across reloads and cannot cross users or enter verified evidence',async()=>{
 const DB=localDb(),a=client(DB),b=client(DB,'b');assert.equal((await a('interviews',{track:'fullstack-interview',step:'requirements',answer:'x'},'PUT')).status,409);
 await a('interviews',{track:'fullstack-interview'});await a('interviews',{track:'fullstack-interview',step:'requirements',answer:'Üretim hedefi ve API sözleşmesi'},'PUT');await a('interviews',{track:'fullstack-interview'});
 assert.equal((await a('advanced')).body.sessions[0].answers.requirements,'Üretim hedefi ve API sözleşmesi');assert.equal((await b('advanced')).body.sessions.length,0);
 assert.equal((await a('interviews',{track:'fullstack-interview',step:'bad.path',answer:'x'},'PUT')).status,400);
 assert.equal((await a('state')).body.evidence.every(e=>e.independent===0),true);assert.equal((await a('account/export')).body.data.interview_sessions.length,1);
 await a('account/erase',{scope:'learning',confirmation:'RESET LEARNING'});assert.equal((await a('advanced')).body.sessions.length,0);DB.close();
});
