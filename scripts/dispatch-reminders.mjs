import {pathToFileURL} from 'node:url';

export const reminderOrigin='https://realdev.melisauyar.com';
const fail=message=>{throw Error(message);};
function report(value){
 if(!value||typeof value.at!=='string'||!Number.isFinite(Date.parse(value.at))||new Date(value.at).toISOString()!==value.at||!['accepted','failed'].every(key=>Number.isSafeInteger(value[key])&&value[key]>=0&&value[key]<=500)||(value.truncated!==undefined&&typeof value.truncated!=='boolean'))fail('invalid_dispatch_report');
 return {at:value.at,accepted:value.accepted,failed:value.failed,...(value.truncated?{truncated:true}:{})};
}

// This caller has one destination and one purpose. Never follow a redirect with the dispatcher secret.
export async function dispatchAndVerify({token,origin=reminderOrigin,fetcher=fetch}={}){
 if(typeof token!=='string'||token.length<32||/[\r\n]/.test(token))fail('reminder_dispatch_secret_missing_or_invalid');
 let base;try{base=new URL(origin);}catch{fail('invalid_reminder_origin');}
 if(base.href!==reminderOrigin+'/')fail('invalid_reminder_origin');
 async function request(path,method){
  let response;try{response=await fetcher(new URL(path,base),{method,headers:{Authorization:'Bearer '+token,Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(method==='POST'?120000:20000)});}catch{fail('reminder_'+method.toLowerCase()+'_network_error');}
  if(!response.ok)fail('reminder_'+method.toLowerCase()+'_http_'+response.status);
  let value;try{value=await response.json();}catch{fail('invalid_dispatch_report');}return report(value);
 }
 // A lost POST response is not retried here. The server's durable daily claims protect the next scheduled run.
 const dispatched=await request('/internal/reminders/dispatch','POST');
 const persisted=await request('/internal/reminders/status','GET');
 if(JSON.stringify(dispatched)!==JSON.stringify(persisted))fail('reminder_readback_mismatch');
 return {...dispatched,verified:true};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const result=await dispatchAndVerify({token:process.env.REMINDER_DISPATCH_TOKEN});
  console.log(JSON.stringify(result));
  if(result.failed||result.truncated)process.exitCode=1;
 }catch(error){console.error('Reminder dispatch failed: '+error.message);process.exitCode=1;}
}
