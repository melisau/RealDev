export const pistonLanguages={python:{label:'Python',names:['python'],file:'main.py'},csharp:{label:'C#',names:['csharp','csharp.net'],file:'main.cs'},java:{label:'Java',names:['java'],file:'Main.java'}};
const jsonHeaders={'Content-Type':'application/json','Accept':'application/json'};
const maxOutput=32768;
function endpoint(env,path,init={}){
 const headers={...jsonHeaders,...init.headers};
 if(env?.PISTON_API_KEY)headers.Authorization=`Bearer ${env.PISTON_API_KEY}`;
 const options={...init,headers,redirect:'manual',signal:init.signal||AbortSignal.timeout(15000)};
 if(env?.CUSTOMER_HTTP_PISTON?.fetch)return env.CUSTOMER_HTTP_PISTON.fetch(new Request(`http://piston${path}`,options));
 if(typeof env?.PISTON_URL==='string'&&env.PISTON_URL){
  const base=new URL(env.PISTON_URL),local=['localhost','127.0.0.1','[::1]'].includes(base.hostname);
  if(base.username||base.password||base.search||base.hash||base.pathname!=='/'||!(base.protocol==='https:'||(local&&base.protocol==='http:')))throw Error('invalid_piston_url');
  if(!local&&(typeof env.PISTON_API_KEY!=='string'||env.PISTON_API_KEY.length<32))throw Object.assign(Error('piston_auth_not_configured'),{status:503});
  return fetch(new URL(path,base),options);
 }
 const error=Error('piston_not_configured');error.status=503;throw error;
}
async function boundedJson(response){const reader=response.body?.getReader();if(!reader)return response.json();const decoder=new TextDecoder();let size=0,text='';while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxOutput){await reader.cancel();throw Error('piston_response_too_large');}text+=decoder.decode(value,{stream:true});}return JSON.parse(text+decoder.decode());}
async function request(env,path,init){const response=await endpoint(env,path,init);if(!response.ok){const error=Error(response.status===404?'piston_runtime_missing':'piston_request_failed');error.status=response.status===404?503:502;throw error;}return boundedJson(response);}
export async function runtimes(env){
 const rows=await request(env,'/api/v2/runtimes',{method:'GET',signal:AbortSignal.timeout(10000)});
 if(!Array.isArray(rows))throw Error('invalid_piston_runtimes');
 return Object.entries(pistonLanguages).flatMap(([key,info])=>{
  const found=rows.filter(row=>typeof row.version==='string'&&(info.names.includes(row.language)||info.names.some(name=>row.aliases?.includes(name)))).sort((a,b)=>{
   const rank=row=>{const index=info.names.indexOf(row.language);return index<0?info.names.length:index;};
   const priority=rank(a)-rank(b);if(priority)return priority;
   const av=a.version.split('.').map(Number),bv=b.version.split('.').map(Number);
   for(let i=0;i<Math.max(av.length,bv.length);i++){const difference=(bv[i]||0)-(av[i]||0);if(difference)return difference;}return 0;
  })[0];
  return found?[{id:key,label:info.label,language:found.language,version:found.version}]:[];
 });
}
async function executeRuntime(env,{language,code,stdin=''},runtime){
 const info=pistonLanguages[language];if(!info)throw Object.assign(Error('unsupported_language'),{status:400});
 if(typeof code!=='string'||code.length<1||code.length>12000||typeof stdin!=='string'||stdin.length>8000)throw Object.assign(Error('invalid_code_run'),{status:400});
 const payload={language:runtime.language,version:runtime.version,files:[{name:info.file,content:code}],stdin,compile_timeout:10000,run_timeout:3000,compile_cpu_time:10000,run_cpu_time:3000,compile_memory_limit:268435456,run_memory_limit:language==='java'?268435456:67108864};
 const output=await request(env,'/api/v2/execute',{method:'POST',headers:jsonHeaders,body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});
 const compile=output.compile||null,run=output.run||{};
 return {language,version:runtime.version,stdin,stdout:String(run.stdout||'').slice(0,16000),stderr:String(run.stderr||'').slice(0,16000),compileStdout:String(compile?.stdout||'').slice(0,4000),compileStderr:String(compile?.stderr||'').slice(0,4000),compileStatus:compile?.status||null,compileExitCode:compile?.code??null,compileSignal:compile?.signal||null,runStatus:run.status||null,exitCode:run.code??null,signal:run.signal||null,cpuMs:run.cpu_time??null,wallMs:run.wall_time??null,memoryBytes:run.memory??null,message:String(run.message||compile?.message||'').slice(0,500)};
}
export async function executePiston(env,job){
 const runtime=(await runtimes(env)).find(item=>item.id===job.language);if(!runtime)throw Object.assign(Error('piston_runtime_missing'),{status:503});
 return executeRuntime(env,job,runtime);
}
export async function executePistonCases(env,{language,code,inputs}){
 if(!pistonLanguages[language]||typeof code!=='string'||!code.trim()||code.length>12000||!Array.isArray(inputs)||inputs.length<1||inputs.length>6||inputs.some(x=>typeof x!=='string'||x.length>8000))throw Object.assign(Error('invalid_code_run'),{status:400});
 const runtime=(await runtimes(env)).find(item=>item.id===language);if(!runtime)throw Object.assign(Error('piston_runtime_missing'),{status:503});
 const results=[];
 for(const stdin of inputs){
  const result=await executeRuntime(env,{language,code,stdin},runtime);results.push(result);
  // A compile failure is identical for every input: avoid recompiling it repeatedly.
  if(result.compileSignal||(result.compileExitCode!==null&&result.compileExitCode!==0)||(result.compileStatus&&!['OK'].includes(result.compileStatus)))break;
 }
 return results;
}
