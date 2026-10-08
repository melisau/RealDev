import test from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {createExpandedTasks} from '../server/expanded-bank.mjs';
import {originalReference,referencePolicies} from '../server/content-policy.mjs';
import {tasks,areas,publicTask,baselineIds} from '../server/catalog.mjs';
import {grade,route} from '../server/assessment.mjs';
import {api} from '../server/api.mjs';
import {localDb} from '../scripts/local-db.mjs';
const added=createExpandedTasks();
const find=slug=>added.find(q=>q.id==='expanded-'+slug+'-20261008');

test('52 original bilingual questions cover all 13 areas without changing the baseline',()=>{
 assert.equal(added.length,52);
 assert.equal(tasks.length,168);
 assert.equal(new Set(tasks.map(q=>q.id)).size,tasks.length);
 assert.deepEqual(baselineIds,tasks.slice(0,8).map(q=>q.id));
 for(const area of Object.keys(areas))assert.equal(added.filter(q=>q.area===area).length,4,area);
 assert.deepEqual(new Set(added.map(q=>q.answer)),new Set([0,1,2,3]));
 for(const q of added){
  assert.equal(q.version,'2026-10-08.2');
  assert.ok(['multiple-choice','error-diagnostic'].includes(q.kind));
  assert.equal(q.options.length,4);
  assert.equal(new Set(q.options.map(o=>o.en)).size,4,q.id);
  for(const field of [q.title,q.topic,q.prompt,q.explain,q.hint,...q.options,...q.checks])
   for(const lang of ['tr','en']){
    assert.ok(field[lang]?.trim(),q.id+':'+lang);
    assert.doesNotMatch(field[lang],/\uFFFD/,q.id);
   }
  for(const key of ['answer','hint','explain','checks'])assert.equal(publicTask(q)[key],undefined);
  q.options.forEach((_,i)=>assert.equal(grade(q,i).score,i===q.answer?100:0,q.id));
 }
});
test('reference metadata distinguishes original authorship from third-party licensing',()=>{
 for(const q of added){
  const s=q.source;
  assert.equal(s.checkedAt,'2026-10-08');
  assert.equal(s.licenseCheckedAt,'2026-10-08');
  assert.equal(s.authorship,'RealDev original');
  assert.equal(s.use,'technical-reference-only');
  assert.equal(s.copiedText,false);
  assert.equal(s.copiedCode,false);
  assert.ok(s.referenceLicense.length>5);
  assert.equal(new URL(s.referenceLicenseUrl).protocol,'https:');
  assert.match(s.note,/not a license grant/);
 }
 assert.equal(find('unity-raycast-hit').source.referenceLicense,'No redistribution permission assumed');
});
test('reference helper rejects unknown providers, spoofed domains and credentials',()=>{
 assert.throws(()=>originalReference('unknown','https://example.com'));
 for(const url of ['http://react.dev/learn','https://react.dev.evil.test/learn','https://user:secret@react.dev/learn','https://example.com/learn'])
  assert.throws(()=>originalReference('react',url),url);
 for(const [provider,policy] of Object.entries(referencePolicies)){
  const s=originalReference(provider,'https://'+policy.hosts[0]+'/');
  assert.equal(s.referenceLicense,policy.license);
 }
});
test('shallow copy and numeric sort keys agree with independently executed JavaScript',()=>{
 const q=find('js-shallow-copy');
 const actual=runInNewContext(q.code+'\noriginal.profile.level');
 assert.equal(actual,2);
 assert.match(q.options[q.answer].en,/^2;/);
 const sorting=find('js-numeric-sort');
 const result=runInNewContext(sorting.code+'\n'+sorting.options[sorting.answer].en+'\nJSON.stringify({values,sorted})');
 assert.deepEqual(JSON.parse(result),{values:[12,3,40],sorted:[3,12,40]});
});
test('aggregate question keys agree with independent SQL fixtures',()=>{
 const db=new DatabaseSync(':memory:');
 try{
  db.exec("CREATE TABLE orders(customer_id INTEGER); INSERT INTO orders VALUES(1),(1),(1),(2),(2),(3),(3),(3),(3); CREATE TABLE users(nickname TEXT); INSERT INTO users VALUES('Ada'),(NULL),('Lin');");
  const q=find('sql-having-groups');
  assert.deepEqual(db.prepare(q.options[q.answer].en).all().map(x=>x.customer_id).sort(),[1,3]);
  const counts=db.prepare(find('sql-count-null').code).get();
  assert.deepEqual(Object.values(counts),[3,2]);
 }finally{db.close();}
});
test('precision, recall and imbalanced-class evidence match independent counts',()=>{
 const labels=[1,1,1,1,1,1,0,0,1,1,1,1];
 const predicted=[1,1,1,1,1,1,1,1,0,0,0,0];
 const tp=labels.filter((y,i)=>y===1&&predicted[i]===1).length;
 const fp=labels.filter((y,i)=>y===0&&predicted[i]===1).length;
 const fn=labels.filter((y,i)=>y===1&&predicted[i]===0).length;
 const precision=find('ai-precision-count'),recall=find('ai-recall-count');
 assert.equal(parseFloat(precision.options[precision.answer].en),tp/(tp+fp));
 assert.equal(parseFloat(recall.options[recall.answer].en),tp/(tp+fn));
 assert.match(find('ai-imbalanced-accuracy').options[find('ai-imbalanced-accuracy').answer].en,/recall is 0/);
});
test('each area can progress into the expanded questions once older tasks were seen',()=>{
 const old=tasks.filter(q=>!q.id.startsWith('expanded-')).map(q=>({task_id:q.id,area:q.area,score:100,skipped:0,created_at:'2026-10-08T08:00:00Z'}));
 for(const area of Object.keys(areas)){
  const selected=route({goals:['fullstack','game'],dailyMinutes:60},old,new Date('2026-10-08')).find(r=>r.area===area);
  assert.equal(selected.taskId,added.find(q=>q.area===area).id,area);
 }
});
test('new diagnostic questions persist server-graded evidence, source rights and notes under the owner',async()=>{
 const DB=localDb(),origin='https://realdev.test';
 const request=async(path,body,user='expanded-user')=>{
  const res=await api(new Request(origin+'/api/'+path,{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':user,...(body?{'Content-Type':'application/json',Origin:origin}:{})},...(body?{body:JSON.stringify(body)}:{})}),{DB});
  return {status:res.status,body:await res.json()};
 };
 try{
  const q=find('unity-raycast-hit');
  const visible=(await request('state')).body.tasks.find(t=>t.id===q.id);
  assert.equal(visible.kind,'error-diagnostic');
  assert.equal(visible.answer,undefined);
  assert.equal((await request('runs',{id:'expanded-run',kind:'practice',taskId:q.id})).status,200);
  const res=await request('answer',{runId:'expanded-run',taskId:q.id,answer:q.answer,explanation:'',confidence:1,skipped:false,note:{id:'expanded-note',text:'Raycast bool sonucunu kontrol et.'}});
  assert.equal(res.status,200);
  assert.equal(res.body.attempt.score,100);
  assert.equal(res.body.attempt.version,q.version);
  assert.equal(res.body.attempt.feedback.source.referenceLicense,q.source.referenceLicense);
  const state=(await request('state')).body;
  assert.equal(state.attempts[0].task_id,q.id);
  assert.equal(state.notes[0].body,'Raycast bool sonucunu kontrol et.');
  const other=(await request('state',undefined,'another-user')).body;
  assert.equal(other.attempts.length,0);
  assert.equal(other.notes.length,0);
 }finally{DB.close();}
});
