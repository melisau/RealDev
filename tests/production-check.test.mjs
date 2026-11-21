import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkProduction} from '../scripts/check-production.mjs';
import {authorizedCheck,backupStatusResponse} from '../deploy/vds/backup-status.mjs';

const token='t'.repeat(40),now=Date.parse('2026-11-21T12:00:00.000Z');
const hoursAgo=hours=>new Date(now-hours*3600000).toISOString();
const fetcher=({health=200,backup={at:hoursAgo(2),offsite:true},backupStatus=200}={})=>async url=>String(url).endsWith('/healthz')
 ?new Response(health===200?'ok':'down',{status:health})
 :new Response(JSON.stringify(backup),{status:backupStatus});
const check=options=>checkProduction({token,now,attempts:2,delayMs:0,sleep:async()=>{},fetcher:fetcher(options)});

test('production check passes with a healthy site and a recent off-site backup',async()=>{assert.deepEqual(await check(),[]);});
test('production check reports an unhealthy site',async()=>{assert.deepEqual(await check({health:503}),['site_unhealthy']);});
test('production check reports stale, local-only and unavailable backups',async()=>{
 assert.deepEqual(await check({backup:{at:hoursAgo(31),offsite:true}}),['backup_too_old']);
 assert.deepEqual(await check({backup:{at:hoursAgo(1),offsite:false}}),['backup_not_offsite']);
 assert.deepEqual(await check({backupStatus:503}),['backup_status_http_503']);
});
test('production check retries a brief site failure',async()=>{
 let calls=0;
 const flaky=async url=>{if(String(url).endsWith('/healthz'))return ++calls===1?new Response('down',{status:502}):new Response('ok');return new Response(JSON.stringify({at:hoursAgo(1),offsite:true}));};
 assert.deepEqual(await checkProduction({token,now,attempts:2,delayMs:0,sleep:async()=>{},fetcher:flaky}),[]);
 assert.equal(calls,2);
});
test('backup status requires the exact bearer token and rejects browser origins',()=>{
 assert.equal(authorizedCheck({authorization:'Bearer '+token,token}),true);
 assert.equal(authorizedCheck({authorization:'Bearer wrong',token}),false);
 assert.equal(authorizedCheck({authorization:undefined,token}),false);
 assert.equal(authorizedCheck({authorization:'Bearer '+token,origin:'https://example.com',token}),false);
 assert.equal(authorizedCheck({authorization:'Bearer short',token:'short'}),false);
});
test('backup status returns only validated fields',()=>{
 const dir=mkdtempSync(join(tmpdir(),'realdev-backup-status-')),file=join(dir,'status.json');
 try{
  const read=()=>backupStatusResponse({method:'GET',authorization:'Bearer '+token,token,file});
  assert.equal(read().status,503);
  writeFileSync(file,JSON.stringify({at:hoursAgo(1),offsite:true,extra:'hidden'}));
  assert.deepEqual(read(),{status:200,body:{at:hoursAgo(1),offsite:true}});
  writeFileSync(file,'{broken');
  assert.equal(read().status,503);
  assert.equal(backupStatusResponse({method:'GET',authorization:'Bearer wrong',token,file}).status,403);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
