import test from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {createBankTasks} from '../server/bank-tasks.mjs';
import {tasks, areas, publicTask} from '../server/catalog.mjs';
import {grade, route, evidence} from '../server/assessment.mjs';
import {api} from '../server/api.mjs';
import {localDb} from '../scripts/local-db.mjs';

const bank = createBankTasks();
const find = slug => bank.find(q => q.id === 'bank-' + slug + '-20261008');
const correctText = q => q.options[q.answer].en;

test('new bank has complete bilingual questions, unique IDs, primary references and all areas', () => {
  assert.equal(bank.length, 39);
  assert.equal(new Set(tasks.map(q => q.id)).size, tasks.length);
  for (const area of Object.keys(areas)) assert.equal(bank.filter(q => q.area === area).length, 3, area);
  assert.deepEqual(new Set(bank.map(q => q.format)), new Set(['scenario','diagnosis','code-reading']));
  assert.deepEqual(new Set(bank.map(q => q.answer)), new Set([0,1,2,3]));
  for (const q of bank) {
    assert.equal(tasks.find(t => t.id === q.id)?.version, '2026-10-08.1');
    for (const text of [q.title,q.prompt,q.topic,q.explain,q.hint,...q.options,...q.checks]) {
      for (const lang of ['tr','en']) {
        assert.ok(text[lang]?.trim().length > 0, q.id + ':' + lang);
        assert.doesNotMatch(text[lang], /[\uFFFD]/, q.id);
      }
    }
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options.map(o => o.en)).size, 4, q.id);
    assert.equal(new URL(q.source.url).protocol, 'https:');
    assert.equal(q.source.checkedAt, '2026-10-08');
    for (const key of ['answer','explain','hint','checks']) assert.equal(publicTask(q)[key], undefined);
    q.options.forEach((_, index) => assert.equal(grade(q,index).score, index === q.answer ? 100 : 0));
  }
});

test('new bank becomes the next route task after existing questions in an area are seen', () => {
  for (const area of Object.keys(areas)) {
    const records = tasks.filter(q => q.area === area && !q.id.startsWith('bank-')).map(q => ({
      task_id:q.id, area, score:100, hinted:0, skipped:0, created_at:'2026-10-01T12:00:00Z'
    }));
    const next = route({goals:['fullstack','game'],dailyMinutes:30},records,new Date('2026-10-08')).find(r => r.area === area);
    assert.equal(next.taskId, bank.find(q => q.area === area).id, area);
    assert.equal(next.reason, 'transfer', area);
  }
});

test('answering every new choice question does not by itself establish expert depth', () => {
  const records = bank.map(q => ({task_id:q.id, area:q.area, score:100, hinted:0, skipped:0, created_at:'2026-10-08T12:00:00Z'}));
  for (const item of evidence(records)) {
    assert.equal(item.status, 'initial');
    assert.deepEqual(item.modalities, ['choice']);
  }
});

test('JavaScript zero/default answer agrees with execution, including null and undefined', () => {
  const q = find('js-nullish');
  const expr = correctText(q);
  assert.equal(expr, 'stock ?? 10');
  for (const [stock, expected] of [[0,0],[null,10],[undefined,10],[7,7]]) {
    assert.equal(runInNewContext(expr,{stock}),expected);
  }
  assert.equal(runInNewContext('stock || 10',{stock:0}),10);
});

test('SQL NULL and LEFT JOIN answer keys agree with independent data fixtures', () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec("CREATE TABLE users(id INTEGER PRIMARY KEY, deleted_at TEXT); CREATE TABLE orders(id INTEGER PRIMARY KEY, user_id INTEGER, status TEXT); INSERT INTO users VALUES (1,NULL),(2,NULL),(3,'2026-01-01'); INSERT INTO orders VALUES (10,1,'paid'),(11,2,'unpaid');");
    const filter = correctText(find('sql-null-filter'));
    assert.deepEqual(db.prepare('SELECT id FROM users ' + filter + ' ORDER BY id').all().map(r=>r.id),[1,2]);
    const bad = db.prepare("SELECT u.id FROM users u LEFT JOIN orders o ON o.user_id=u.id WHERE o.status='paid' ORDER BY u.id").all();
    const fixed = db.prepare("SELECT u.id, o.id AS order_id FROM users u LEFT JOIN orders o ON o.user_id=u.id AND o.status='paid' ORDER BY u.id").all();
    assert.deepEqual(bad.map(r=>r.id),[1]);
    assert.deepEqual(fixed.map(r=>[r.id,r.order_id]),[[1,10],[2,null],[3,null]]);
    assert.match(correctText(find('sql-left-join-filter')), /JOIN ON/);
  } finally { db.close(); }
});

test('new questions grade on the server, keep source/version/notes on reload and isolate accounts', async () => {
  const DB=localDb(), origin='https://realdev.test';
  async function request(path,body,user='bank-user') {
    const response=await api(new Request(origin+'/api/'+path,{
      method:body?'POST':'GET',
      headers:{'oai-authenticated-user-id':user,...(body?{'Content-Type':'application/json',Origin:origin}:{})},
      ...(body?{body:JSON.stringify(body)}:{})
    }),{DB});
    return {status:response.status,body:await response.json()};
  }
  try {
    const q=find('sql-left-join-filter');
    const state=await request('state');
    const visible=state.body.tasks.find(t=>t.id===q.id);
    assert.ok(visible.tags.includes('SQL · LEFT JOIN ON WHERE'));
    assert.equal(visible.answer,undefined);
    assert.equal(visible.explain,undefined);
    assert.equal((await request('runs',{id:'bank-test-run',kind:'practice',taskId:q.id})).status,200);
    const result=await request('answer',{runId:'bank-test-run',taskId:q.id,answer:q.answer,explanation:'The WHERE clause removes unmatched users.',confidence:1,skipped:false,note:{id:'bank-note',text:'ON ve WHERE farkını tekrar çalış.'}});
    assert.equal(result.status,200);
    assert.equal(result.body.attempt.score,100);
    assert.equal(result.body.attempt.version,q.version);
    assert.equal(result.body.attempt.feedback.source.url,q.source.url);
    assert.equal(result.body.run.complete,true);
    const reload=(await request('state')).body;
    assert.equal(reload.attempts[0].task_id,q.id);
    assert.equal(reload.notes[0].body,'ON ve WHERE farkını tekrar çalış.');
    const other=(await request('state',undefined,'other-user')).body;
    assert.equal(other.attempts.length,0);
    assert.equal(other.notes.length,0);
  } finally {DB.close();}
});
