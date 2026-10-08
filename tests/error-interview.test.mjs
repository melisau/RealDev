import test from 'node:test';
import assert from 'node:assert/strict';
import {createErrorTasks} from '../server/error-bank.mjs';
import {filterErrors,normalizeErrorSearch} from '../sandbox/error-library.mjs';
import {tasks,publicTask} from '../server/catalog.mjs';
import {grade} from '../server/assessment.mjs';
import {interviewPracticeTasks,takeHomeTasks,interviewQuestions} from '../server/interview-bank.mjs';
import {interviewTracks} from '../server/advanced.mjs';
import {publicPractice} from '../server/practice.mjs';
import {api} from '../server/api.mjs';
import {localDb} from '../scripts/local-db.mjs';
const errors=createErrorTasks();
function client(DB,user='a',extra={}){return async(path,body,method='POST')=>{const r=await api(new Request('https://realdev.test/api/'+path,{method:body===undefined?'GET':method,headers:{'oai-authenticated-user-id':user,Origin:'https://realdev.test','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)}),{DB,...extra});return {status:r.status,body:await r.json()};};}
test('24 diagnostics cover 11 areas with hidden solutions and evidence-led repairs',()=>{
 assert.equal(errors.length,24);assert.equal(new Set(errors.map(t=>t.area)).size,11);
 assert.equal(tasks.filter(t=>t.kind==='error-diagnostic').length,56);
 for(const q of errors){
  assert.equal(tasks.find(t=>t.id===q.id).version,'2026-10-08.3');
  assert.equal(q.options.length,3);assert.equal(new Set(q.options.map(o=>o.en)).size,3);
  for(const lang of ['tr','en']){for(const x of [q.title,q.topic,q.prompt,q.explain,q.hint,...q.options]){assert.ok(x[lang]?.trim());assert.doesNotMatch(x[lang],/\uFFFD/);}assert.equal(q.explain[lang].split('\n\n').length,4);}
  for(const key of ['answer','explain','checks','hint'])assert.equal(publicTask(q)[key],undefined);
  q.options.forEach((_,i)=>assert.equal(grade(q,i).score,i===q.answer?100:0));
  assert.equal(q.source.use,'technical-reference-only');assert.equal(q.source.copiedCode,false);assert.equal(q.source.copiedText,false);
 }
});
test('error filters search Turkish accents, both languages and exact log text together',()=>{
 assert.equal(normalizeErrorSearch('İŞ ÇÖZÜMÜ'),'is cozumu');
 assert.ok(filterErrors(errors,{query:'rebase cakismasi'}).some(q=>q.id.includes('rebase-stop')));
 assert.ok(filterErrors(errors,{query:'effect loop',language:'tr'}).some(q=>q.id.includes('react-effect-loop')));
 assert.ok(filterErrors(errors,{query:'non-fast-forward',area:'git'}).length);
 assert.equal(filterErrors(errors,{query:'non-fast-forward',area:'unity'}).length,0);
 assert.ok(filterErrors(errors,{area:'sql',level:'intermediate'}).every(q=>q.area==='sql'&&q.level==='intermediate'));
 assert.equal(filterErrors(errors,{query:'does-not-exist'}).length,0);
 const old={id:'old',title:{tr:'Eski örnek',en:'Old example'},topic:'IDE'};
 assert.equal(filterErrors([old],{level:'unspecified',query:'IDE'}).length,1);
});
test('all new diagnostics grade on the server, preserve repair feedback and isolate saved attempts',async()=>{
 const DB=localDb(),a=client(DB),b=client(DB,'b');
 try{for(const [i,q] of errors.entries()){
  const id='diag-run-'+i;assert.equal((await a('runs',{id,kind:'practice',taskId:q.id})).status,200);
  const result=await a('answer',{runId:id,taskId:q.id,answer:q.answer,explanation:'',confidence:1,skipped:false});
  assert.equal(result.status,200,q.id);assert.equal(result.body.attempt.score,100);
  assert.equal(result.body.attempt.feedback.explain.en,q.explain.en);
 }
 assert.equal((await a('state')).body.attempts.length,24);assert.equal((await b('state')).body.attempts.length,0);
 }finally{DB.close();}
});
test('14 original interview/assignment briefs are bilingual, timeboxed and hide reference answers',()=>{
 assert.equal(takeHomeTasks.length,6);assert.equal(interviewQuestions.length,8);
 assert.equal(new Set(interviewPracticeTasks.map(t=>t.id)).size,14);
 for(const q of interviewPracticeTasks){assert.equal(q.modality,'review');assert.equal(q.authorship,'RealDev-original');assert.ok(q.minutes>=20);assert.equal(new URL(q.source.url).protocol,'https:');assert.ok(q.reference.length>100);assert.equal(publicPractice(q).reference,undefined);
  for(const lang of ['tr','en']){assert.ok(q.title[lang]&&q.prompt[lang]);for(const c of q.criteria)assert.ok(c.text[lang]);}
 }
 assert.equal(interviewTracks.length,7);for(const track of interviewTracks){assert.equal(track.steps.length,6);assert.equal(track.steps.reduce((s,x)=>s+x.minutes,0),track.minutes);}
});
test('written drafts save without AI, resume privately, export/delete and grant no evidence',async()=>{
 const DB=localDb();let calls=0;const a=client(DB,'a',{AI_FETCH:()=>{calls++;throw Error('must not call AI');}}),b=client(DB,'b');
 const body={id:'home-draft',taskId:'takehome-helpdesk',mode:'draft',code:'',explanation:'API sözleşmesi ve iki kullanıcı için test planım.'};
 try{
 const before=(await a('state')).body.evidence;
 const saved=await a('practice',{...body,result:{verification:'server-verified',score:100}});assert.equal(saved.status,200);assert.equal(saved.body.result.verification,'draft');assert.equal(saved.body.result.evaluated,false);assert.equal(saved.body.result.score,undefined);assert.equal(calls,0);
 assert.equal((await a('practice',body)).status,200);assert.equal((await a('practice')).body.records.length,1);
 assert.equal((await a('practice')).body.records[0].explanation,body.explanation);assert.deepEqual((await a('state')).body.evidence,before);
 assert.equal((await b('practice')).body.records.length,0);assert.equal((await b('practice',body)).status,404);
 assert.equal((await a('practice',{...body,explanation:'changed'})).status,409);assert.equal((await a('practice',{...body,mode:undefined,consent:true})).status,409);
 assert.equal((await a('practice',{...body,id:'empty-draft',explanation:' '})).status,400);
 assert.equal((await a('practice',{...body,id:'code-draft',taskId:'project-api-validation'})).status,400);
 assert.equal((await a('practice',{...body,id:'bad-mode',mode:'verified'})).status,400);
 assert.equal((await a('practice',{...body,id:'no-consent',mode:undefined})).body.error,'ai_consent_required');assert.equal(calls,0);
 assert.equal((await a('account/export')).body.data.practice_submissions.length,1);
 await a('account/erase',{scope:'learning',confirmation:'RESET LEARNING'});assert.equal((await a('practice')).body.records.length,0);
 }finally{DB.close();}
});
test('new role interview answers resume without scoring or crossing accounts',async()=>{
 const DB=localDb(),a=client(DB),b=client(DB,'b');try{for(const track of interviewTracks.slice(3)){
 assert.equal((await a('interviews',{track:track.id})).status,200);
 assert.equal((await a('interviews',{track:track.id,step:'debug',answer:'Kanıt, varsayım ve regresyon planı'},'PUT')).status,200);
 }
 const sessions=(await a('advanced')).body.sessions;assert.equal(sessions.length,4);assert.ok(sessions.every(s=>s.answers.debug==='Kanıt, varsayım ve regresyon planı'));
 assert.equal((await b('advanced')).body.sessions.length,0);assert.ok((await a('state')).body.evidence.every(e=>e.independent===0));
 }finally{DB.close();}
});
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
test('topic search puts never-answered/skipped tasks first and labels latest real answers',()=>{
 const source=readFileSync(new URL('../web/assessment.js',import.meta.url),'utf8');
 const code=source.slice(source.indexOf(' function topicProgress('),source.indexOf(' function topicsView('));
 const fixture={tasks:['a','b','c','d'].map(id=>({id,area:'api',title:{tr:'API '+id,en:'API '+id},prompt:{tr:'İstek',en:'Request'}})),areas:{api:{tr:'API',en:'API'}},attempts:[
 {task_id:'a',score:100,skipped:0,created_at:'2026-10-07'},
 {task_id:'b',score:0,skipped:1,created_at:'2026-10-07'},
 {task_id:'c',score:100,skipped:0,created_at:'2026-10-07'},
 {task_id:'c',score:0,skipped:0,created_at:'2026-10-08'},
 {task_id:'a',score:0,skipped:1,created_at:'2026-10-08'}]};
 const context={data:fixture,topicQuery:'API',aliases:{api:'api http'},normalize:s=>s.toLowerCase(),t:(tr,en)=>tr,local:x=>x.tr,safe:x=>String(x),btn:(label,action,attr)=>'<button '+attr+'>'+label+'</button>'};
 const html=runInNewContext(code+'searchResults()',context);
 assert.deepEqual([...html.matchAll(/data-task="(\w)"/g)].map(m=>m[1]),['b','d','a','c']);
 assert.deepEqual([...html.matchAll(/data-topic-status="(\w+)"/g)].map(m=>m[1]),['new','new','correct','retry']);
 assert.match(html,/2 çözülmemiş/);assert.match(html,/✓ Çözüldü · doğru/);assert.match(html,/↻ Çözüldü · tekrar çalış/);
 context.topicQuery='absent';assert.match(runInNewContext(code+'searchResults()',context),/0 soru bulundu/);
});
