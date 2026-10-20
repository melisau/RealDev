import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {tasks,areas} from '../server/catalog.mjs';
import {lessons,learningDocument} from '../server/public-learning.mjs';
const context={window:{},URLSearchParams};
runInNewContext(readFileSync(new URL('../web/question-bank.js',import.meta.url),'utf8'),context);
const bank=context.window.RealDevBank;

test('all 13 areas partition the complete bank; filters never cross area or level',()=>{
 assert.equal(Object.keys(areas).length,13);
 let total=0;
 for(const area of Object.keys(areas)){
  const all=bank.filter(tasks,[],{area});total+=all.length;assert.ok(all.length>=100);
  for(const subtopic of new Set(all.map(q=>bank.subtopic(q)[0]))){
   const subset=bank.filter(tasks,[],{area,subtopic,level:'advanced'});
   assert.ok(subset.every(q=>q.area===area&&q.difficulty==='advanced'&&bank.subtopic(q)[0]===subtopic));
  }
 }
 assert.equal(total,tasks.length);
 assert.equal(bank.filter(tasks,[],{area:'api',query:'no-such-question-xyz'}).length,0);
});

test('unsolved follows latest real answers; wrong answers are attempted and skipped remain unsolved',()=>{
 const fixture=tasks.filter(q=>q.area==='api').slice(0,4),[a,b,c]=fixture;
 const attempts=[{task_id:a.id,score:100,created_at:'2026-10-01'},{task_id:a.id,score:0,skipped:1,created_at:'2026-10-02'},{task_id:b.id,score:0,created_at:'2026-10-01'},{task_id:c.id,score:0,skipped:1,created_at:'2026-10-01'}];
 assert.deepEqual(Array.from(bank.filter(fixture,attempts,{area:'api',unsolved:true}),q=>q.id),[c.id,fixture[3].id]);
 assert.equal(bank.latest(attempts).get(a.id).score,100);
});

test('concept links select populated questions and survive safe sign-in roundtrips',()=>{
 for(const concept of [{id:'cors',source:{url:'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS'}},{id:'clr'},{id:'react-state'},{id:'kubernetes'}]){
  const filters=bank.related(concept,tasks);assert.ok(filters.area,concept.id);
  assert.ok(bank.filter(tasks,[],filters).length,concept.id);
  const href=bank.href(filters),routes={window:{},location:{origin:'https://realdev.test'},URL,URLSearchParams};
  runInNewContext(readFileSync(new URL('../web/auth-redirect.js',import.meta.url),'utf8'),routes);
  const auth=routes.window.RealDevRoutes.signInUrl(href);
  assert.equal(routes.window.RealDevRoutes.returnTo(new URL(auth,'https://realdev.test').search),href);
  for(const unsafe of ['//evil.test','/topics?returnTo=https://evil.test','/quiz?area=api','/topics#evil']){
   assert.ok(!routes.window.RealDevRoutes.safeReturnTo(unsafe).includes('evil'));
  }
 }
 for(const lesson of lessons){
  const doc=learningDocument('/learn/'+lesson.slug,'https://realdev.test');
  assert.ok(doc.includes('İlgili soruları çöz'),lesson.slug);
  const area=doc.match(/href="\/topics\?area=([a-z]+)"/)?.[1];assert.ok(areas[area],lesson.slug);
 }
});
