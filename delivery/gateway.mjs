import {createServer} from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {validateDelivery,deliveryHash} from './contracts.mjs';
import {runProject,runnerCapabilities} from './docker-runner.mjs';
export function createProjectGateway({token,execute=runProject,capabilities=runnerCapabilities,maxJobs=32}={}){
 if(typeof token!=='string'||token.length<32)throw Error('project_runner_auth_not_configured');
 const expected=createHash('sha256').update('Bearer '+token).digest(),jobs=new Map();let active=0,windowAt=0,count=0;
 const server=createServer(async(req,res)=>{
  const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  const received=createHash('sha256').update(req.headers.authorization||'').digest();if(!timingSafeEqual(expected,received)){req.resume();send(401,{error:'unauthorized'});return;}
  try{
   const now=Date.now();for(const [id,job] of jobs)if(job.finishedAt&&now-job.finishedAt>86400000)jobs.delete(id);
   if(req.method==='GET'&&req.url==='/api/v2/project-capabilities'){send(200,await capabilities());return;}
   const match=/^\/api\/v2\/project-jobs\/([a-f0-9]{32,64})$/.exec(req.url);
   if(req.method==='GET'&&match){const job=jobs.get(match[1]);if(!job){send(404,{error:'job_not_found'});return;}send(200,job);return;}
   if(req.method!=='POST'||req.url!=='/api/v2/project-jobs'){req.resume();send(404,{error:'not_found'});return;}
   if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))throw Object.assign(Error('json_required'),{status:415});
   let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>262144)throw Object.assign(Error('delivery_too_large'),{status:413});chunks.push(chunk);}
   const body=JSON.parse(Buffer.concat(chunks).toString('utf8')),clean=validateDelivery(body),hash=await deliveryHash(clean);
   if(!/^[a-f0-9]{32,64}$/.test(body.id||''))throw Error('invalid_job_id');
   const old=jobs.get(body.id);if(old){send(old.sourceHash===hash?200:409,old.sourceHash===hash?old:{error:'job_conflict'});return;}
   if(now-windowAt>60000){windowAt=now;count=0;}if(active>=2||count>=12||jobs.size>=maxJobs)throw Object.assign(Error('project_runner_busy'),{status:429});
   const caps=await capabilities();if(!caps.assignments.some(x=>x.id===clean.assignmentId&&x.available))throw Object.assign(Error('project_runtime_unavailable'),{status:503});
   const job={id:body.id,sourceHash:hash,status:'running',createdAt:new Date().toISOString()};jobs.set(body.id,job);active++;count++;
   Promise.resolve().then(()=>execute(clean,{jobId:body.id})).then(report=>{job.status='completed';job.report=report;}).catch(()=>{job.status='failed';job.error='project_execution_failed';}).finally(()=>{job.finishedAt=Date.now();active--;});
   send(202,job);
  }catch(error){send(error.status||400,{error:error.status?error.message:'invalid_project_request'});}
 });server.requestTimeout=15000;server.headersTimeout=10000;server.maxHeadersCount=30;return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const server=createProjectGateway({token:process.env.PROJECT_RUNNER_API_KEY||process.env.PISTON_API_KEY});server.listen(2002,'127.0.0.1',()=>console.log('Project gateway: http://127.0.0.1:2002 (loopback only)'));}
