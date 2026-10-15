import test from 'node:test';import assert from 'node:assert/strict';
import {once} from 'node:events';
import {assignments,validateDelivery,deliveryHash,starterFor,DELIVERY_VERSION} from '../delivery/contracts.mjs';
import {verifiedProjectReport,projectDeliveryEvidence} from '../server/delivery.mjs';
import {createProjectGateway} from '../delivery/gateway.mjs';
import {runProject} from '../delivery/docker-runner.mjs';
import {createPistonGateway} from '../scripts/piston-gateway.mjs';
import {api} from '../server/api.mjs';import {localDb} from '../scripts/local-db.mjs';
const origin='https://realdev.test';
const client=(DB,user='a',env={})=>async(path,body)=>{const r=await api(new Request(origin+'/api/'+path,{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':user,Origin:origin,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined}),{DB,...env});return {status:r.status,value:await r.json()};};
const mockRunner=()=>{let job;return {fetch:async req=>{const path=new URL(req.url).pathname;if(path==='/api/v2/project-capabilities')return Response.json({suiteVersion:DELIVERY_VERSION,assignments:assignments.map(a=>({id:a.id,available:true}))});if(req.method==='POST'){const body=await req.json();job={id:body.id,status:'running',sourceHash:await deliveryHash(body)};return Response.json(job,{status:202});}return Response.json(job);},complete(a,overrides={}){job.status='completed';job.report={assignmentId:a.id,sourceHash:job.sourceHash,suiteVersion:DELIVERY_VERSION,runner:'docker-project',engine:a.runtime,scope:a.runtime==='unity'?'editor-editmode-playmode':'contract-acceptance',cases:a.caseIds.map(id=>({id,pass:true,detail:'independent check'})),...overrides};}};};
test('delivery contracts use real HTTP/database or Unity engine scopes, bounded allowlisted source files',async()=>{
 assert.equal(assignments.length,3);for(const a of assignments){assert.equal(a.caseIds.length,8);assert.equal(new Set(a.caseIds).size,8);assert.ok(a.contract.tr&&a.contract.en);validateDelivery(starterFor(a.id));}
 const base=starterFor('dotnet-board');for(const path of ['../escape.cs','src/../../escape.cs','/abs.cs','C:/escape.cs','src\\Program.cs','.env','src/Directory.Build.props','src/Extra.cs'])assert.throws(()=>validateDelivery({...base,files:[{path,content:'x'}]}));
 assert.throws(()=>validateDelivery({...base,files:[base.files[0],base.files[0]]}));assert.throws(()=>validateDelivery({...base,files:[{path:'src/Program.cs',content:'\0'}]}));assert.throws(()=>validateDelivery({...base,files:[{path:'src/Program.cs',content:'ş'.repeat(30001)}]}));
 const first={assignmentId:'booking-api',files:[{path:'app.py',content:'a\r\nb'},{path:'store.py',content:'c'}]},second={...first,files:[first.files[1],{path:'app.py',content:'a\nb'}]};assert.equal(await deliveryHash(first),await deliveryHash(second));
});
test('server-derived acceptance reports ignore grades and reject mismatched suites, files, engines and missing tests',()=>{
 for(const a of assignments){const row={assignment_id:a.id,source_hash:'a'.repeat(64),suite_version:DELIVERY_VERSION};const good={assignmentId:a.id,sourceHash:row.source_hash,suiteVersion:DELIVERY_VERSION,runner:'docker-project',engine:a.runtime,scope:a.runtime==='unity'?'editor-editmode-playmode':'contract-acceptance',passed:999,score:999,cases:a.caseIds.map((id,i)=>({id,pass:i!==0,detail:'result'}))};assert.equal(verifiedProjectReport(good,row).passed,7);assert.equal(verifiedProjectReport(good,row).score,88);
 for(const bad of [{...good,sourceHash:'other'},{...good,suiteVersion:'old'},{...good,engine:'csharp-model'},{...good,cases:good.cases.slice(1)},{...good,cases:good.cases.map(()=>good.cases[0])},{...good,cases:good.cases.map(c=>({...c,pass:'true'}))}])assert.throws(()=>verifiedProjectReport(bad,row));
 }
});
test('project submission runs asynchronously, is idempotent, private and contributes only trusted current evidence',async()=>{
 const DB=localDb(),runner=mockRunner(),a=client(DB,'a',{CUSTOMER_HTTP_PROJECT_RUNNER:runner}),b=client(DB,'b',{CUSTOMER_HTTP_PROJECT_RUNNER:runner});const input={id:'project-one',...starterFor('booking-api'),result:{score:100}};
 try{assert.equal((await a('deliveries')).value.assignments[0].available,true);
 const started=await a('deliveries',input);assert.equal(started.status,202);assert.equal(started.value.status,'running');assert.equal(started.value.runner_job,undefined);assert.equal(started.value.manifest,undefined);
 assert.equal((await a('deliveries',input)).status,200);assert.equal((await a('deliveries',{...input,files:[{path:'app.py',content:'different'}]})).status,409);
 assert.equal((await b('deliveries/project-one')).status,404);assert.equal((await b('deliveries',input)).status,404);assert.equal((await b('deliveries')).value.records.length,0);assert.equal((await a('state')).value.evidence.find(x=>x.area==='api').independent,0);
 runner.complete(assignments[0]);const completed=await a('deliveries/project-one');assert.equal(completed.value.result.passed,8);assert.equal(completed.value.delivery.files.length,2);assert.equal((await a('state')).value.evidence.find(x=>x.area==='api').independent,1);
 const exported=(await a('account/export')).value;assert.equal(exported.data.project_submissions.length,1);assert.equal(exported.data.project_submissions[0].user_id,undefined);
 assert.equal(projectDeliveryEvidence([{...exported.data.project_submissions[0],suite_version:'stale'}]).length,0);
 await a('account/erase',{scope:'learning',confirmation:'RESET LEARNING'});assert.equal((await a('deliveries')).value.records.length,0);
 }finally{DB.close();}
});
test('failed, malformed or disconnected runs cannot add verified project evidence',async()=>{
 for(const mode of ['disconnected','forged']){const DB=localDb(),runner=mockRunner(),a=client(DB,'a',mode==='forged'?{CUSTOMER_HTTP_PROJECT_RUNNER:runner}:{});try{
 const input={id:'failure',...starterFor('booking-api')},started=await a('deliveries',input);if(mode==='disconnected')assert.equal(started.status,503);else{runner.complete(assignments[0],{sourceHash:'forged'});assert.equal((await a('deliveries/failure')).value.status,'failed');}
 assert.equal((await a('state')).value.evidence.find(x=>x.area==='api').independent,0);
 }finally{DB.close();}}
});
test('project source bundles above the ordinary JSON limit remain bounded and valid',async()=>{const DB=localDb(),runner=mockRunner(),a=client(DB,'large',{CUSTOMER_HTTP_PROJECT_RUNNER:runner});try{const input={id:'large-source',assignmentId:'booking-api',files:[{path:'app.py',content:'#'+'x'.repeat(40000)}]};assert.equal((await a('deliveries',input)).status,202);assert.equal((await a('deliveries',{...input,id:'too-large',files:[{path:'app.py',content:'x'.repeat(60001)}]})).status,400);}finally{DB.close();}});
test('project runner gateway requires a bearer, rejects arbitrary routes, and deduplicates jobs',async()=>{
 const token='t'.repeat(64);let calls=0;const gateway=createProjectGateway({token,capabilities:async()=>({suiteVersion:DELIVERY_VERSION,assignments:[{id:'booking-api',available:true}]}),execute:async()=>{calls++;return {};}});gateway.listen(0,'127.0.0.1');await once(gateway,'listening');const base='http://127.0.0.1:'+gateway.address().port,headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
 try{assert.equal((await fetch(base+'/api/v2/project-capabilities')).status,401);assert.equal((await fetch(base+'/shell',{headers})).status,404);const job={id:'a'.repeat(64),...starterFor('booking-api')};assert.equal((await fetch(base+'/api/v2/project-jobs',{method:'POST',headers,body:JSON.stringify(job)})).status,202);assert.equal((await fetch(base+'/api/v2/project-jobs',{method:'POST',headers,body:JSON.stringify(job)})).status,200);assert.equal(calls,1);assert.equal((await fetch(base+'/api/v2/project-jobs',{method:'POST',headers,body:JSON.stringify({...job,files:[{path:'app.py',content:'other'}]})})).status,409);}
 finally{gateway.closeAllConnections();await new Promise(resolve=>gateway.close(resolve));}
});
test('Docker orchestration drops privilege and egress, separates tests and cleans each job',async()=>{
 const commands=[],id='a'.repeat(32),a=assignments[0];const command=async(args)=>{commands.push(args);if(args.includes('realdev-project-tester:20261015'))return {code:0,stdout:JSON.stringify({cases:(args.at(-2)==='initial'?a.caseIds.slice(0,-1):['persistence']).map(id=>({id,pass:true,detail:'test'}))}),stderr:''};return {code:0,stdout:'ok',stderr:''};};
 const report=await runProject(starterFor(a.id),{jobId:id,command});assert.equal(report.cases.length,8);const app=commands.find(x=>x[0]==='run'&&x.includes('rd-app-'+id));assert.equal(app[app.indexOf('--network')+1],'none');assert.equal(app[app.indexOf('--user')+1],'10001:10001');assert.ok(app.includes('--read-only'));assert.ok(app.includes('no-new-privileges'));assert.ok(!app.some(x=>x.includes('docker.sock')));assert.ok(!app.includes('--privileged'));const testers=commands.filter(x=>x.includes('realdev-project-tester:20261015'));assert.equal(testers.length,2);assert.ok(testers.every(x=>x.includes('container:rd-app-'+id)));assert.ok(commands.some(x=>x[0]==='restart'));assert.ok(commands.some(x=>x.join(' ')==='volume rm -f rd-data-'+id));
});
test('optional Piston gateway project forwarding keeps the private bearer and route boundary',async()=>{
 const token='t'.repeat(64);let forwarded;const server=createPistonGateway({token,projectUpstream:'http://127.0.0.1:2002',fetchImpl:async(url,options)=>{forwarded={url:String(url),options};return Response.json({suiteVersion:DELIVERY_VERSION});}});server.listen(0,'127.0.0.1');await once(server,'listening');try{const base='http://127.0.0.1:'+server.address().port;assert.equal((await fetch(base+'/api/v2/project-capabilities',{headers:{Authorization:'Bearer '+token}})).status,200);assert.equal(forwarded.options.headers.Authorization,'Bearer '+token);assert.equal(forwarded.url,'http://127.0.0.1:2002/api/v2/project-capabilities');assert.equal((await fetch(base+'/api/v2/project-jobs/../../execute',{headers:{Authorization:'Bearer '+token}})).status,404);}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
