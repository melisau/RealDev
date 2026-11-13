import test from 'node:test';
import assert from 'node:assert/strict';
import {createTopicTasks,topicBankAreas,TOPIC_BANK_VERSION,TOPIC_BANK_CHECKED} from '../server/topic-bank.mjs';
import {tasks,areas,publicTask,baselineIds} from '../server/catalog.mjs';
import {grade} from '../server/assessment.mjs';
const topic=createTopicTasks();

test('every area has at least 100 questions after adding the topic bank',()=>{
 for(const area of Object.keys(areas))assert.ok(tasks.filter(t=>t.area===area).length>=100,area);
 assert.deepEqual(topicBankAreas.map(b=>b.area).sort(),Object.keys(areas).sort());
 assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
 assert.deepEqual(baselineIds,tasks.slice(0,8).map(t=>t.id));
 assert.ok(topic.length>=1100);
});

test('topic questions are bilingual, gradeable and hide their answers',()=>{
 assert.deepEqual(new Set(topic.map(q=>q.answer)),new Set([0,1,2,3]));
 for(const q of topic){
  assert.match(q.id,/^topic-[a-z]+-[a-z0-9-]+$/);
  assert.equal(q.version,TOPIC_BANK_VERSION);
  assert.ok(['multiple-choice','error-diagnostic'].includes(q.kind),q.id);
  assert.ok(['foundation','intermediate','advanced'].includes(q.difficulty),q.id);
  assert.equal(q.options.length,4,q.id);
  for(const lang of ['tr','en'])assert.equal(new Set(q.options.map(o=>o[lang].trim())).size,4,q.id+':'+lang);
  for(const field of [q.title,q.topic,q.prompt,q.explain,q.hint,...q.options,...q.checks])
   for(const lang of ['tr','en']){
    assert.ok(field[lang]?.trim(),q.id+':'+lang);
    assert.doesNotMatch(field[lang],/�/,q.id);
   }
  for(const key of ['answer','hint','explain','checks'])assert.equal(publicTask(q)[key],undefined);
  q.options.forEach((_,i)=>assert.equal(grade(q,i).score,i===q.answer?100:0,q.id));
 }
});

test('topic questions record original authorship and an approved reference',()=>{
 for(const q of topic){
  const s=q.source;
  assert.equal(s.authorship,'RealDev original',q.id);
  assert.equal(s.copiedText,false);assert.equal(s.copiedCode,false);
  assert.equal(s.checkedAt,TOPIC_BANK_CHECKED);
  assert.match(s.url,/^https:\/\//,q.id);
 }
});

test('answer positions are deterministic and not concentrated in one slot',()=>{
 const again=createTopicTasks();
 assert.deepEqual(again.map(q=>q.answer),topic.map(q=>q.answer));
 const counts=[0,0,0,0];for(const q of topic)counts[q.answer]++;
 for(const c of counts)assert.ok(c>topic.length*0.15,String(counts));
});
