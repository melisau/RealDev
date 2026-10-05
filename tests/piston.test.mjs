import test from 'node:test';
import assert from 'node:assert/strict';
import {createPistonGateway} from '../scripts/piston-gateway.mjs';
import {executePiston,runtimes} from '../sandbox/piston.mjs';

const token='test-only-secret-'.repeat(3),rows=[{language:'python',version:'3.9.4'},{language:'python',version:'3.12.0'},{language:'csharp',version:'6.12.0'},{language:'java',version:'15.0.2'}];
async function gateway(t,options={}){
 const server=createPistonGateway({token,...options});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));
 const origin=`http://127.0.0.1:${server.address().port}`;
 return (path,body,key=token)=>fetch(origin+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
}
const job={language:'python',version:'3.12.0',files:[{name:'main.py',content:'print(42)'}]};

test('gateway rejects unauthorized access and package-management endpoints without reaching Piston',async t=>{
 let calls=0;const call=await gateway(t,{fetchImpl:async()=>{calls++;return Response.json(rows);}});
 assert.equal((await call('/api/v2/runtimes',null,'wrong')).status,401);
 assert.equal((await call('/api/v2/packages',{})).status,404);
 assert.equal((await call('/api/v2/runtimes?redirect=evil')).status,404);
 assert.equal((await call('/api/v2/runtimes')).status,200);assert.equal(calls,1);
 assert.throws(()=>createPistonGateway({token:'short'}));
 assert.throws(()=>createPistonGateway({token,upstream:'http://example.com'}));
});
test('gateway enforces its own limits and rejects arbitrary files, languages and oversized source',async t=>{
 let received;const call=await gateway(t,{fetchImpl:async(url,init)=>{received=JSON.parse(init.body);assert.equal(init.redirect,'manual');return Response.json({run:{stdout:'42\n',code:0}});}});
 assert.equal((await call('/api/v2/execute',{...job,run_timeout:999999,run_memory_limit:-1,args:['untrusted']})).status,200);
 assert.equal(received.run_timeout,3000);assert.equal(received.run_memory_limit,67108864);assert.equal(received.args,undefined);
 assert.equal((await call('/api/v2/execute',{...job,files:[...job.files,{name:'other.py',content:'secret'}]})).status,400);
 assert.equal((await call('/api/v2/execute',{...job,language:'bash'})).status,400);
 assert.equal((await call('/api/v2/execute',{...job,files:[{name:'main.py',content:'a'.repeat(12001)}]})).status,400);
 assert.equal((await call('/api/v2/execute',{...job,stdin:'b'.repeat(140000)})).status,413);
});
test('gateway applies a request quota and rejects redirects, invalid JSON and oversized upstream output',async t=>{
 const limited=await gateway(t,{requestsPerMinute:1,fetchImpl:async()=>Response.json(rows)});
 assert.equal((await limited('/api/v2/runtimes')).status,200);assert.equal((await limited('/api/v2/runtimes')).status,429);
 for(const response of [new Response(null,{status:302,headers:{Location:'https://evil.test'}}),new Response('invalid'),new Response('x'.repeat(32769))]){
  const call=await gateway(t,{fetchImpl:async()=>response});assert.equal((await call('/api/v2/runtimes')).status,502);
 }
});
test('gateway admits only two concurrent upstream runs',async t=>{
 let calls=0,release;const wait=new Promise(resolve=>{release=resolve;});
 const call=await gateway(t,{fetchImpl:async()=>{calls++;await wait;return Response.json(rows);}});
 const first=call('/api/v2/runtimes'),second=call('/api/v2/runtimes');
 while(calls<2)await new Promise(resolve=>setTimeout(resolve,5));
 const third=await call('/api/v2/runtimes');assert.equal(third.status,429);release();
 assert.equal((await first).status,200);assert.equal((await second).status,200);
});
test('Piston client selects the newest runtime and sends its credential only to a validated HTTPS origin',async t=>{
 const original=globalThis.fetch;const calls=[];
 globalThis.fetch=async(url,init)=>{calls.push({url:String(url),init});return Response.json(rows);};t.after(()=>{globalThis.fetch=original;});
 assert.equal((await runtimes({PISTON_URL:'https://runner.example',PISTON_API_KEY:token}))[0].version,'3.12.0');
 assert.equal(calls[0].init.headers.Authorization,`Bearer ${token}`);assert.equal(calls[0].init.redirect,'manual');
 await assert.rejects(()=>runtimes({PISTON_URL:'http://runner.example',PISTON_API_KEY:token}),/invalid_piston_url/);
 await assert.rejects(()=>runtimes({PISTON_URL:'https://runner.example'}),/piston_auth_not_configured/);
 await assert.rejects(()=>runtimes({PISTON_URL:'https://user:password@runner.example',PISTON_API_KEY:token}),/invalid_piston_url/);
 assert.equal(calls.length,1);
});
test('client can execute through the authenticated gateway and keeps Java memory within the runner cap',async t=>{
 const payloads=[];const server=createPistonGateway({token,fetchImpl:async(url,init)=>{
  if(new URL(url).pathname.endsWith('runtimes'))return Response.json(rows);
  payloads.push(JSON.parse(init.body));return Response.json({run:{stdout:'42\n',code:0}});
 }});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));
 const env={PISTON_URL:`http://127.0.0.1:${server.address().port}`,PISTON_API_KEY:token};
 for(const language of ['python','csharp','java'])assert.equal((await executePiston(env,{language,code:'source'})).stdout,'42\n');
 assert.equal(payloads[2].run_memory_limit,268435456);assert.equal(payloads[0].run_memory_limit,67108864);
});
