// Scheduled production check. A failure fails the GitHub Actions run, and GitHub sends the failure notification.
import {pathToFileURL} from 'node:url';
import {reminderOrigin} from './dispatch-reminders.mjs';

export const maxBackupAgeHours=30;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function siteHealthy({origin,fetcher,attempts,delayMs,sleep}){
 for(let attempt=1;attempt<=attempts;attempt++){
  try{
   const response=await fetcher(new URL('/healthz',origin),{redirect:'manual',signal:AbortSignal.timeout(15000)});
   if(response.status===200&&(await response.text()).trim()==='ok')return true;
  }catch{}
  if(attempt<attempts)await sleep(delayMs);
 }
 return false;
}

async function backupProblem({origin,token,fetcher,now}){
 let response;
 // Never follow a redirect with the secret.
 try{response=await fetcher(new URL('/internal/backup/status',origin),{headers:{Authorization:'Bearer '+token,Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(15000)});}
 catch{return 'backup_status_network_error';}
 if(!response.ok)return 'backup_status_http_'+response.status;
 let value;try{value=await response.json();}catch{return 'backup_status_invalid';}
 const at=typeof value?.at==='string'?Date.parse(value.at):NaN;
 if(!Number.isFinite(at)||typeof value.offsite!=='boolean')return 'backup_status_invalid';
 if(now-at>maxBackupAgeHours*3600000)return 'backup_too_old';
 if(at-now>300000)return 'backup_status_invalid';
 if(!value.offsite)return 'backup_not_offsite';
 return null;
}

export async function checkProduction({token,origin=reminderOrigin,fetcher=fetch,now=Date.now(),attempts=3,delayMs=20000,sleep=wait}={}){
 if(typeof token!=='string'||token.length<32||/[\r\n]/.test(token))return ['check_secret_missing_or_invalid'];
 if(!await siteHealthy({origin,fetcher,attempts,delayMs,sleep}))return ['site_unhealthy'];
 const problem=await backupProblem({origin,token,fetcher,now});
 return problem?[problem]:[];
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const problems=await checkProduction({token:process.env.REMINDER_DISPATCH_TOKEN});
 if(problems.length){console.error('Production check failed: '+problems.join(', '));process.exitCode=1;}
 else console.log('Production check passed: site healthy, recent off-site backup present.');
}
