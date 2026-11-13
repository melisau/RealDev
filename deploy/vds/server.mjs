// Node host for the RealDev Worker bundle on the VDS. TLS and the public domain are handled by the shared Caddy proxy;
// this process only listens on the private Docker network. The Worker code is unchanged: it receives a standard
// Request plus an env object whose DB is a file-backed SQLite database with the same prepare/bind/batch API as D1.
import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import worker from '../../dist/server/index.js';
import {localDb} from '../../scripts/local-db.mjs';

const port=Number(process.env.PORT)||8080;
const origin=new URL(process.env.PUBLIC_ORIGIN||'http://localhost:'+port).origin;
const dbFile=process.env.REALDEV_DB_FILE||'/data/realdev.sqlite';
mkdirSync(dirname(dbFile),{recursive:true});
const DB=localDb(dbFile);
// Identity comes only from a verified Firebase token. Platform identity headers are dropped at the edge so a request
// can never claim an account by setting them, even if Firebase settings were missing.
const stripped=['oai-authenticated-user-id','oai-authenticated-user-email'];
const passEnv=['FIREBASE_PROJECT_ID','FIREBASE_API_KEY','OPENAI_API_KEY','OPENAI_TEXT_MODEL','AI_DAILY_LIMIT','VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY','VAPID_SUBJECT','REMINDER_DISPATCH_TOKEN','REMINDER_SCHEDULE_ENABLED','PROJECT_RUNNER_URL','PROJECT_RUNNER_API_KEY','PISTON_URL','PISTON_API_KEY'];
const env={DB};for(const key of passEnv)if(process.env[key])env[key]=process.env[key];
if(!env.FIREBASE_PROJECT_ID||!env.FIREBASE_API_KEY){console.error('FIREBASE_PROJECT_ID and FIREBASE_API_KEY are required');process.exit(1);}

const server=createServer(async(req,res)=>{
 try{
  if(req.url==='/healthz'){res.writeHead(200,{'content-type':'text/plain'});res.end('ok');return;}
  const url=new URL(req.url,origin);
  const headers=new Headers();
  for(const [name,value] of Object.entries(req.headers)){if(value===undefined||stripped.includes(name))continue;if(Array.isArray(value))for(const v of value)headers.append(name,v);else headers.set(name,value);}
  const hasBody=!['GET','HEAD'].includes(req.method);
  const request=new Request(url,{method:req.method,headers,body:hasBody?Readable.toWeb(req):undefined,duplex:hasBody?'half':undefined});
  const response=await worker.fetch(request,env);
  const out={};response.headers.forEach((value,name)=>{if(name==='set-cookie')return;out[name]=value;});
  const cookies=response.headers.getSetCookie?.()||[];if(cookies.length)out['set-cookie']=cookies;
  res.writeHead(response.status,out);
  if(response.body&&req.method!=='HEAD')Readable.fromWeb(response.body).pipe(res);else res.end();
 }catch(error){
  console.error(new Date().toISOString(),req.method,req.url,error);
  if(!res.headersSent)res.writeHead(500,{'content-type':'text/plain'});res.end('Internal error');
 }
});
server.requestTimeout=120000;server.headersTimeout=30000;
server.listen(port,'0.0.0.0',()=>console.log('RealDev listening on :'+port+' for '+origin));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{server.close(()=>{DB.close();process.exit(0);});setTimeout(()=>process.exit(0),10000).unref();});
