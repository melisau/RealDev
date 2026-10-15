import {assignments,assignment,validateDelivery,deliveryHash,starterFor,DELIVERY_VERSION} from '../delivery/contracts.mjs';
const fail=(message,status=400)=>Object.assign(Error(message),{status});
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const hex=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
async function runner(env,path,body){
 const binding=env.CUSTOMER_HTTP_PROJECT_RUNNER||env.CUSTOMER_HTTP_PISTON,key=env.PROJECT_RUNNER_API_KEY||env.PISTON_API_KEY;
 const options={method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(key?{Authorization:'Bearer '+key}:{})},...(body?{body:JSON.stringify(body)}:{}),redirect:'manual',signal:AbortSignal.timeout(15000)};
 let response;
 try{if(!env.PROJECT_RUNNER_URL&&binding&&typeof binding.fetch==='function')response=await binding.fetch(new Request('https://project-runner.internal'+path,options));else if(env.PROJECT_RUNNER_URL){const base=new URL(env.PROJECT_RUNNER_URL),local=['127.0.0.1','localhost','[::1]'].includes(base.hostname);if(base.username||base.password||base.search||base.hash||base.pathname!=='/'||(!local&&(base.protocol!=='https:'||typeof key!=='string'||key.length<32))||(local&&!['http:','https:'].includes(base.protocol)))throw Error();response=await fetch(new URL(path,base),options);}else throw Error();}catch{throw fail('project_runner_unavailable',503);}
 if(!response.ok){await response.body?.cancel();throw fail(response.status===404?'project_job_missing':response.status===429?'project_runner_busy':'project_runner_unavailable',response.status===404?404:response.status===429?429:503);}
 const reader=response.body?.getReader();let text='',size=0;const decoder=new TextDecoder();if(!reader)throw fail('invalid_project_report',502);while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>48000){await reader.cancel();throw fail('invalid_project_report',502);}text+=decoder.decode(value,{stream:true});}try{return JSON.parse(text+decoder.decode());}catch{throw fail('invalid_project_report',502);}
}
export function verifiedProjectReport(value,row){
 const a=assignment(row.assignment_id);if(!a||value?.assignmentId!==a.id||value?.sourceHash!==row.source_hash||value?.suiteVersion!==row.suite_version||row.suite_version!==DELIVERY_VERSION||value.runner!=='docker-project'||value.engine!==a.runtime||value.scope!==(a.runtime==='unity'?'editor-editmode-playmode':'contract-acceptance')||!Array.isArray(value.cases)||value.cases.length!==a.caseIds.length)throw fail('invalid_project_report',502);
 const ids=new Set();for(const c of value.cases){if(!a.caseIds.includes(c.id)||ids.has(c.id)||typeof c.pass!=='boolean'||typeof c.detail!=='string')throw fail('invalid_project_report',502);ids.add(c.id);}
 const cases=a.caseIds.map(id=>{const c=value.cases.find(x=>x.id===id);return {id,pass:c.pass,detail:c.detail.slice(0,500)};}),passed=cases.filter(x=>x.pass).length;
 return {assignmentId:a.id,sourceHash:row.source_hash,suiteVersion:DELIVERY_VERSION,verification:'server-verified',runner:'docker-project',engine:a.runtime,scope:value.scope,cases,passed,total:cases.length,score:Math.round(passed/cases.length*100)};
}
const publicRow=row=>({...row,user_id:undefined,runner_job:undefined,manifest:undefined,result:row.result?JSON.parse(row.result):null});
export function projectDeliveryEvidence(rows){return rows.flatMap(row=>{if(row.status!=='completed'||!row.result)return [];try{const r=verifiedProjectReport(JSON.parse(row.result),row),a=assignment(row.assignment_id);return [{task_id:'delivery-'+a.id,area:a.area,score:r.score,modality:'project',verification:'server-verified',hinted:0,skipped:0,created_at:row.updated_at}];}catch{return [];}});}
export async function deliveryRoutes({path,method,body,db,user,env}){
 if(path==='/api/deliveries'&&method==='GET'){
  let capabilities;try{capabilities=await runner(env,'/api/v2/project-capabilities');}catch{capabilities={assignments:[],unavailable:true};}
  return json({assignments:assignments.map(a=>({...a,starter:starterFor(a.id),suiteVersion:DELIVERY_VERSION,available:capabilities.suiteVersion===DELIVERY_VERSION&&capabilities.assignments.some(x=>x.id===a.id&&x.available)})),records:(await db.all('SELECT * FROM project_submissions WHERE user_id=? ORDER BY created_at DESC LIMIT 50',user.id)).map(publicRow)});
 }
 if(path==='/api/deliveries'&&method==='POST'){
  if(!/^[a-zA-Z0-9-]{1,80}$/.test(body.id||''))throw fail('invalid_delivery');let clean;try{clean=validateDelivery(body);}catch(error){throw fail(error.message);}
  const hash=await deliveryHash(clean),old=await db.one('SELECT * FROM project_submissions WHERE id=?',body.id);
  if(old){if(old.user_id!==user.id)throw fail('delivery_not_found',404);if(old.source_hash!==hash)throw fail('delivery_conflict',409);return json(publicRow(old));}
  const count=await db.one('SELECT COUNT(*) AS count FROM project_submissions WHERE user_id=? AND created_at>=?',user.id,new Date(Date.now()-15*60000).toISOString());if(count.count>=3)throw fail('delivery_rate_limit',429);
  await db.write("UPDATE project_submissions SET status='failed',error='project_timeout',updated_at=? WHERE user_id=? AND status='running' AND created_at<?",new Date().toISOString(),user.id,new Date(Date.now()-10*60000).toISOString());
  const pending=await db.one("SELECT COUNT(*) AS count FROM project_submissions WHERE user_id=? AND status='running' AND created_at>=?",user.id,new Date(Date.now()-10*60000).toISOString());if(pending.count)throw fail('delivery_already_running',409);
  const now=new Date().toISOString(),jobId=await hex(user.id+'\0'+body.id);
  try{await db.write('INSERT INTO project_submissions (id,user_id,assignment_id,source_hash,suite_version,manifest,status,runner_job,result,error,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',body.id,user.id,clean.assignmentId,hash,DELIVERY_VERSION,JSON.stringify(clean),'running',jobId,null,null,now,now);}catch(error){if(/unique|constraint/i.test(error.message))throw fail('delivery_already_running',409);throw error;}
  try{const job=await runner(env,'/api/v2/project-jobs',{id:jobId,...clean});if(job.id!==jobId||job.sourceHash!==hash)throw fail('invalid_project_report',502);}catch(error){await db.write("UPDATE project_submissions SET status='failed',error=?,updated_at=? WHERE id=? AND user_id=?",error.message,new Date().toISOString(),body.id,user.id);throw error;}
  return json(publicRow(await db.one('SELECT * FROM project_submissions WHERE id=? AND user_id=?',body.id,user.id)),202);
 }
 const match=/^\/api\/deliveries\/([a-zA-Z0-9-]{1,80})$/.exec(path);if(match&&method==='GET'){
  let row=await db.one('SELECT * FROM project_submissions WHERE id=? AND user_id=?',match[1],user.id);if(!row)throw fail('delivery_not_found',404);
  if(row.status==='running'){
   try{if(Date.now()-Date.parse(row.created_at)>10*60000)throw fail('project_timeout',408);const job=await runner(env,'/api/v2/project-jobs/'+row.runner_job);if(job.id!==row.runner_job||job.sourceHash!==row.source_hash)throw fail('invalid_project_report',502);
    if(job.status==='completed'){const report=verifiedProjectReport(job.report,row);await db.write("UPDATE project_submissions SET status='completed',result=?,updated_at=? WHERE id=? AND user_id=?",JSON.stringify(report),new Date().toISOString(),row.id,user.id);}
    else if(job.status==='failed')throw fail('project_execution_failed',502);
   }catch(error){if(['project_job_missing','project_timeout','invalid_project_report','project_execution_failed'].includes(error.message))await db.write("UPDATE project_submissions SET status='failed',error=?,updated_at=? WHERE id=? AND user_id=?",error.message,new Date().toISOString(),row.id,user.id);else return json({...publicRow(row),retryable:true});}
   row=await db.one('SELECT * FROM project_submissions WHERE id=? AND user_id=?',row.id,user.id);
  }
  return json({...publicRow(row),delivery:JSON.parse(row.manifest)});
 }
 return null;
}
