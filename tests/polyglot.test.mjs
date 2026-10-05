import test from 'node:test';import assert from 'node:assert/strict';
import {api} from '../server/api.mjs';import {localDb} from '../scripts/local-db.mjs';
import {polyglotTasks} from '../sandbox/polyglot-tasks.mjs';import {gradePolyglot,polyglotEvidence} from '../server/polyglot.mjs';
import {evidence} from '../server/assessment.mjs';

const runtimes=[{language:'python',version:'3.12.0'},{language:'csharp',version:'6.12.0'},{language:'java',version:'15.0.2'}];
const outputs={'4\n2 -3 0 5\n':'7','0\n\n':'0','3\n-9 0 -1\n':'0','3\n1 2 3\n':'6','4\n-1000 1000 999 -999\n':'1999'};
function service(behavior){let calls=0,listings=0;return {get calls(){return calls;},get listings(){return listings;},fetch:async req=>{
 if(new URL(req.url).pathname.endsWith('/runtimes')){listings++;return Response.json(runtimes);}
 calls++;const job=await req.json();return Response.json(behavior?behavior(job):{compile:{code:0},run:{code:0,stdout:job.files[0].content==='good'?outputs[job.stdin]:'0'}});
}};}
function client(db,user='user-a',extra={}){return async(path,body)=>{const response=await api(new Request('https://realdev.test/api/'+path,{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':user,Origin:'https://realdev.test','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined}),{DB:db,...extra});return {status:response.status,body:await response.json()};};}
test('nine bilingual tasks expose examples without the server grading suite',()=>{
 assert.equal(polyglotTasks.length,9);
 for(const lang of ['python','csharp','java'])assert.deepEqual(polyglotTasks.filter(t=>t.language===lang).map(t=>t.modality),['code','debug','transfer']);
 for(const task of polyglotTasks){assert.ok(task.title.tr&&task.title.en&&task.starter&&task.source.url.startsWith('https://'));assert.equal(task.tests,undefined);assert.equal(task.examples.length,1);}
});
test('server chooses every test input, ignores client grades, persists history and owns records',async()=>{
 const db=localDb(),runner=service(),a=client(db,'user-a',{CUSTOMER_HTTP_PISTON:runner}),b=client(db,'user-b',{CUSTOMER_HTTP_PISTON:runner});
 const body={id:'poly-1',taskId:'polyglot-python-positive-sum',code:'good',result:{passed:999},stdin:'malicious',language:'java'};
 const saved=await a('polyglot-runs',body);assert.equal(saved.status,200);assert.equal(saved.body.result.passed,5);assert.equal(saved.body.result.total,5);assert.equal(saved.body.result.language,'python');assert.equal(runner.calls,5);assert.equal(runner.listings,1);
 const replay=await a('polyglot-runs',body);assert.equal(replay.body.result.score,100);assert.equal(runner.calls,5);
 assert.equal((await b('polyglot-runs',body)).status,404);assert.equal((await a('polyglot-runs',{...body,code:'different'})).status,409);
 const state=(await a('state')).body;assert.equal(state.evidence.find(e=>e.area==='structures').independent,1);assert.deepEqual(state.evidence.find(e=>e.area==='structures').languages,['python']);
 assert.equal((await a('code-runs')).body.records.length,1);assert.equal((await b('code-runs')).body.records.length,0);
 assert.equal((await b('state')).body.evidence.find(e=>e.area==='structures').distinct,0);db.close();
});
test('an unavailable runner does not save results or add skill evidence',async()=>{
 const db=localDb(),a=client(db);const result=await a('polyglot-runs',{id:'unavailable',taskId:'polyglot-java-positive-sum',code:'source'});
 assert.equal(result.status,503);assert.equal(result.body.error,'piston_not_configured');assert.equal((await a('code-runs')).body.records.length,0);db.close();
});
test('incorrect output, timeout, compile failure and forged stdout cannot receive full credit',async()=>{
 const wrong=await gradePolyglot({CUSTOMER_HTTP_PISTON:service()},'polyglot-python-positive-sum','wrong');assert.ok(wrong.passed<wrong.total);
 for(const behavior of [job=>({compile:{code:1,stderr:'CS1002'},run:{code:0,stdout:outputs[job.stdin]}}),job=>({run:{code:0,status:'TO',stdout:outputs[job.stdin]}}),job=>({run:{code:0,signal:'SIGKILL',stdout:outputs[job.stdin]}})]){
  const runner=service(behavior);const report=await gradePolyglot({CUSTOMER_HTTP_PISTON:runner},'polyglot-csharp-positive-sum','code');assert.equal(report.passed,0);assert.equal(report.total,5);
 }
});
test('same algorithm in three languages and repeat submissions remain one evidence family',async()=>{
 const runner=service();const base=await gradePolyglot({CUSTOMER_HTTP_PISTON:runner},'polyglot-python-positive-sum','good');
 const rows=['python','csharp','java'].flatMap((language,i)=>{const taskId=`polyglot-${language}-positive-sum`;return polyglotEvidence({task_id:taskId,created_at:`2026-10-05T10:00:0${i}Z`,result:JSON.stringify({verification:'server-verified',report:{...base,taskId,language}})});});
 const area=evidence(rows).find(e=>e.area==='structures');assert.equal(area.distinct,1);assert.equal(area.independent,1);assert.equal(area.status,'initial');assert.equal(area.languages.length,3);
 const taskId='polyglot-python-positive-sum';assert.deepEqual(polyglotEvidence({task_id:taskId,result:JSON.stringify({verification:'piston-executed-unscored',report:base})}),[]);
 assert.deepEqual(polyglotEvidence({task_id:taskId,result:JSON.stringify({verification:'server-verified',report:{...base,suiteVersion:0}})}),[]);
});
test('task execution is capped per account and replay remains available at the cap',async()=>{
 const db=localDb(),runner=service(),a=client(db,'user-a',{CUSTOMER_HTTP_PISTON:runner});
 const taskId='polyglot-python-positive-sum',now=new Date().toISOString();
 for(let i=0;i<12;i++)await db.prepare('INSERT INTO code_runs (id,user_id,task_id,code,result,created_at) VALUES (?,?,?,?,?,?)').bind('limit-'+i,'user-a',taskId,'good',JSON.stringify({verification:'server-verified',report:{passed:5,total:5}}),now).run();
 assert.equal((await a('polyglot-runs',{id:'over-limit',taskId,code:'good'})).status,429);assert.equal(runner.calls,0);
 assert.equal((await a('polyglot-runs',{id:'limit-0',taskId,code:'good'})).status,200);db.close();
});
