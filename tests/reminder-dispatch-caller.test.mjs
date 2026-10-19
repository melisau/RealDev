import test from 'node:test';
import assert from 'node:assert/strict';
import {dispatchAndVerify,reminderOrigin,exitCodeFor} from '../scripts/dispatch-reminders.mjs';
const token='test-only-dispatcher-secret-'.repeat(3);
const result={at:'2026-10-19T18:00:00.000Z',accepted:2,failed:0};
const response=value=>Response.json(value);

test('unattended reminder caller authenticates the exact Site, posts once and reads back its persisted report',async()=>{
 const requests=[];const actual=await dispatchAndVerify({token,fetcher:async(url,options)=>{requests.push({url:String(url),options});return response(result);}});
 assert.deepEqual(actual,{...result,verified:true});assert.equal(requests.length,2);
 assert.deepEqual(requests.map(x=>[x.url,x.options.method]),[[reminderOrigin+'/internal/reminders/dispatch','POST'],[reminderOrigin+'/internal/reminders/status','GET']]);
 for(const {options} of requests){assert.equal(options.headers.Authorization,'Bearer '+token);assert.equal(options.redirect,'manual');assert.equal(new Headers(options.headers).has('origin'),false);assert.ok(options.signal instanceof AbortSignal);}
});
test('reminder caller rejects missing secrets and untrusted destinations before any network request',async()=>{
 const fetcher=()=>assert.fail('must not send a request');
 for(const secret of [undefined,'short',token+'\n'])await assert.rejects(dispatchAndVerify({token:secret,fetcher}),/secret_missing_or_invalid/);
 for(const origin of ['http://realdev.melisauyar.com','https://attacker.test','https://realdev.melisauyar.com/path','https://realdev.melisauyar.com?next=x','https://user@realdev.melisauyar.com'])await assert.rejects(dispatchAndVerify({token,origin,fetcher}),/invalid_reminder_origin/);
});
test('reminder caller refuses redirects and authorization errors without forwarding the secret',async()=>{
 for(const status of [302,307,401,403,502]){let requests=0;await assert.rejects(dispatchAndVerify({token,fetcher:async()=>{requests++;return new Response(null,{status});}}),new RegExp('http_'+status));assert.equal(requests,1);}
});
test('reminder caller does not retry uncertain writes or expose remote error messages',async()=>{
 let requests=0;await assert.rejects(dispatchAndVerify({token,fetcher:async()=>{requests++;throw Error(token);}}),error=>error.message==='reminder_post_network_error'&&!error.message.includes(token));assert.equal(requests,1);
});
test('reminder caller rejects malformed reports and an inconsistent persisted timestamp',async()=>{
 for(const invalid of [null,{}, {...result,accepted:-1},{...result,failed:'0'},{...result,at:'yesterday'},{...result,truncated:'yes'}])await assert.rejects(dispatchAndVerify({token,fetcher:async()=>response(invalid)}),/invalid_dispatch_report/);
 let requests=0;await assert.rejects(dispatchAndVerify({token,fetcher:async()=>response(++requests===1?result:{...result,at:'2026-10-19T19:00:00.000Z'})}),/readback_mismatch/);
});
test('a zero-device run verifies the dispatcher but does not manufacture a delivery receipt',async()=>{
 const actual=await dispatchAndVerify({token,fetcher:async()=>response({...result,accepted:0})});assert.deepEqual(actual,{...result,accepted:0,verified:true});assert.equal('delivered' in actual,false);
});
test('expired subscriptions pass through readback and do not fail the workflow; failures and truncation do',async()=>{
 const withExpired={...result,expired:3};
 const actual=await dispatchAndVerify({token,fetcher:async()=>response(withExpired)});assert.deepEqual(actual,{...withExpired,verified:true});
 assert.equal(exitCodeFor(actual),0);assert.equal(exitCodeFor({...actual,failed:1}),1);assert.equal(exitCodeFor({...actual,truncated:true}),1);
 await assert.rejects(dispatchAndVerify({token,fetcher:async()=>response({...result,expired:-1})}),/invalid_dispatch_report/);
 // A server report without the field (older deployment) is still accepted.
 assert.equal(exitCodeFor(await dispatchAndVerify({token,fetcher:async()=>response(result)})),0);
});
