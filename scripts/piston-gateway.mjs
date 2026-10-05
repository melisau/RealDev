import {createServer} from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
import {pathToFileURL} from 'node:url';

const MAX_BODY=131072,MAX_OUTPUT=32768;
const languageFiles={python:'main.py',csharp:'main.cs','csharp.net':'main.cs',java:'Main.java'};
function fail(message,status){return Object.assign(Error(message),{status});}
async function readBounded(body,limit,status=413){
 const chunks=[];let size=0;
 for await(const chunk of body){size+=chunk.length;if(size>limit)throw fail(status===413?'payload_too_large':'runner_response_too_large',status);chunks.push(Buffer.from(chunk));}
 return Buffer.concat(chunks);
}
function validatedJob(value){
 const file=languageFiles[value?.language];
 if(!file||typeof value.version!=='string'||!/^\d+\.\d+\.\d+$/.test(value.version))throw fail('unsupported_runtime',400);
 const files=value.files;
 if(!Array.isArray(files)||files.length!==1||files[0]?.name!==file||typeof files[0].content!=='string'||!files[0].content.length||files[0].content.length>12000)throw fail('invalid_source',400);
 if(value.stdin!==undefined&&(typeof value.stdin!=='string'||value.stdin.length>8000))throw fail('invalid_stdin',400);
 // Rebuild the request: a caller cannot override limits, files, args or networking.
 return {language:value.language,version:value.version,files:[{name:file,content:files[0].content}],stdin:value.stdin||'',compile_timeout:10000,compile_cpu_time:10000,run_timeout:3000,run_cpu_time:3000,compile_memory_limit:268435456,run_memory_limit:value.language==='java'?268435456:67108864};
}

export function createPistonGateway({token,upstream='http://127.0.0.1:2000',fetchImpl=fetch,requestsPerMinute=60}={}){
 if(typeof token!=='string'||token.length<32||/[\r\n]/.test(token))throw Error('PISTON_API_KEY must be a secret of at least 32 characters');
 const target=new URL(upstream);
 if(target.protocol!=='http:'||!['127.0.0.1','[::1]'].includes(target.hostname)||target.username||target.password||target.pathname!=='/'||target.search||target.hash)throw Error('Piston upstream must use a loopback HTTP origin');
 if(!Number.isInteger(requestsPerMinute)||requestsPerMinute<1||requestsPerMinute>600)throw Error('Invalid rate limit');
 const expected=createHash('sha256').update(`Bearer ${token}`).digest();let active=0,windowStart=0,count=0;
 const server=createServer(async(req,res)=>{
  const send=(status,body,headers={})=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(typeof body==='string'?body:JSON.stringify(body));};
  const actual=createHash('sha256').update(req.headers.authorization||'').digest();
  if(!timingSafeEqual(expected,actual)){send(401,{error:'unauthorized'});req.resume();return;}
  const route=req.url,method=req.method;
  if(!((route==='/api/v2/runtimes'&&method==='GET')||(route==='/api/v2/execute'&&method==='POST'))){send(404,{error:'not_found'});req.resume();return;}
  const now=Date.now();if(now-windowStart>=60000){windowStart=now;count=0;}
  if(count>=requestsPerMinute){send(429,{error:'rate_limited'},{'Retry-After':'60'});req.resume();return;}
  if(active>=2){send(429,{error:'runner_busy'},{'Retry-After':'3'});req.resume();return;}
  count++;active++;
  try{
   let body;
   if(method==='POST'){
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw fail('json_required',415);
    const raw=await readBounded(req,MAX_BODY);let value;try{value=JSON.parse(raw.toString('utf8'));}catch{throw fail('invalid_json',400);}
    body=JSON.stringify(validatedJob(value));
   }
   const response=await fetchImpl(new URL(route,target),{method,headers:{'Content-Type':'application/json','Accept':'application/json'},body,redirect:'manual',signal:AbortSignal.timeout(15000)});
   if(!response.ok){send(502,{error:'runner_request_failed'});await response.body?.cancel();return;}
   const raw=await readBounded(response.body,MAX_OUTPUT,502);try{JSON.parse(raw.toString('utf8'));}catch{throw fail('invalid_runner_response',502);}
   send(200,raw.toString('utf8'));
  }catch(error){send(error.status||502,{error:error.status?error.message:'runner_unavailable'});}
  finally{active--;}
 });
 server.requestTimeout=20000;server.headersTimeout=10000;server.timeout=20000;server.maxHeadersCount=30;
 return server;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const port=Number(process.env.PISTON_GATEWAY_PORT||2001);
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid gateway port');
 const server=createPistonGateway({token:process.env.PISTON_API_KEY,requestsPerMinute:Number(process.env.PISTON_REQUESTS_PER_MINUTE||60)});
 server.listen(port,'127.0.0.1',()=>console.log(`Authenticated Piston gateway: http://127.0.0.1:${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
