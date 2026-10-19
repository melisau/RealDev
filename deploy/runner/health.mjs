// Post-deploy check run on the runner host. Proves the gateway rejects unauthenticated calls, executes real Python,
// C# and Java programs through the same client the Site uses, and that the project runner answers. Never prints the key.
import {pathToFileURL} from 'node:url';
import {executePiston,runtimes} from '../../sandbox/piston.mjs';

export const programs=[
 {language:'python',code:'print(6 * 7)'},
 {language:'csharp',code:'using System; class Program { static void Main() { Console.WriteLine(6 * 7); } }'},
 {language:'java',code:'public class Main { public static void main(String[] args) { System.out.println(6 * 7); } }'}
];

export async function checkRunner({origin='http://127.0.0.1:2001',key=process.env.PISTON_API_KEY,fetcher=fetch,execute=executePiston,list=runtimes,log=console.log}={}){
 if(typeof key!=='string'||key.length<32)throw Error('runner_key_missing');
 const anonymous=await fetcher(origin+'/api/v2/runtimes',{redirect:'manual',signal:AbortSignal.timeout(10000)});
 if(anonymous.status!==401)throw Error('gateway_accepts_unauthenticated_requests_'+anonymous.status);
 const env={PISTON_URL:origin,PISTON_API_KEY:key};
 const available=await list(env);
 for(const name of ['python','csharp','java'])if(!available.some(r=>r.id===name))throw Error('runtime_missing_'+name);
 for(const item of programs){const r=await execute(env,item);if(r.exitCode!==0||r.signal||String(r.stdout).trim()!=='42')throw Error('execution_failed_'+item.language);log(`${item.language}: ok`);}
 const caps=await fetcher(origin+'/api/v2/project-capabilities',{headers:{Authorization:'Bearer '+key},redirect:'manual',signal:AbortSignal.timeout(15000)});
 if(!caps.ok)throw Error('project_runner_http_'+caps.status);
 const body=await caps.json();if(!Array.isArray(body.assignments))throw Error('project_runner_invalid');
 const ready=body.assignments.filter(a=>a.available).map(a=>a.id);log('project runner: '+(ready.join(', ')||'no assignments available'));
 for(const id of ['booking-api','dotnet-board'])if(!ready.includes(id))throw Error('project_assignment_unavailable_'+id);
 return {runtimes:available.map(r=>r.id),projects:ready};
}

export async function checkWithRetry(options={},{attempts=30,delay=4000}={}){
 let last;for(let i=0;i<attempts;i++){try{return await checkRunner(options);}catch(error){last=error;if(error.message==='runner_key_missing'||error.message.startsWith('gateway_accepts'))throw error;await new Promise(r=>setTimeout(r,delay));}}
 throw last;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{await checkWithRetry({log:console.log});console.log('Runner health check passed');}catch(error){console.error('Runner health check failed: '+error.message);process.exitCode=1;}
}
