// Protected, read-only view of the last successful backup, used by scripts/check-production.mjs.
import {readFileSync} from 'node:fs';
import {createHash,timingSafeEqual} from 'node:crypto';

export const backupStatusPath='/internal/backup/status';
const digest=value=>createHash('sha256').update(value).digest();

export function authorizedCheck({authorization,origin,token}){
 if(typeof token!=='string'||token.length<32||origin)return false;
 if(typeof authorization!=='string'||!authorization.startsWith('Bearer '))return false;
 return timingSafeEqual(digest(authorization.slice(7)),digest(token));
}

export function readBackupStatus(file){
 try{
  const value=JSON.parse(readFileSync(file,'utf8'));
  if(typeof value?.at!=='string'||!Number.isFinite(Date.parse(value.at))||new Date(value.at).toISOString()!==value.at||typeof value.offsite!=='boolean')return null;
  return {at:value.at,offsite:value.offsite};
 }catch{return null;}
}

export function backupStatusResponse({method,authorization,origin,token,file}){
 if(!authorizedCheck({authorization,origin,token}))return {status:403,body:{error:'service_only'}};
 if(method!=='GET')return {status:405,body:{error:'method_not_allowed'}};
 const value=readBackupStatus(file);
 return value?{status:200,body:value}:{status:503,body:{error:'backup_status_missing'}};
}
