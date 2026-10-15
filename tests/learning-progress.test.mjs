import test from 'node:test';
import assert from 'node:assert/strict';
import {learningProgress} from '../server/learning-progress.mjs';
test('onboarding advances only on saved profile, completed scan and verified code',()=>{
 assert.equal(learningProgress({profile:{}}).next,'account');
 assert.equal(learningProgress({account:{},profile:{saved:true}}).next,'assessment');
 assert.equal(learningProgress({account:{},profile:{saved:true},baselineComplete:true}).next,'code');
 assert.equal(learningProgress({account:{},profile:{saved:true},baselineComplete:true,codeEvidence:[{task_id:'a',verification:'draft'}]}).next,'code');
});
test('review recovery excludes hints and skips; repeated tasks are not new breadth',()=>{
 const attempts=[{id:'1',task_id:'a',created_at:'2026-01-01',score:0},{id:'2',task_id:'a',created_at:'2026-01-02',score:100,hinted:1},{id:'3',task_id:'b',created_at:'2026-01-02',score:0},{id:'4',task_id:'b',created_at:'2026-01-03',score:100}];
 const p=learningProgress({profile:{},attempts});assert.equal(p.reviewed,2);assert.equal(p.recovered,1);assert.equal(p.answeredTasks,2);
});
