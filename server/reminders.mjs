import {buildPushPayload} from '@block65/webcrypto-web-push';
const fail=(message,status=400)=>Object.assign(Error(message),{status});
export const pushConfigured=env=>Boolean(env.VAPID_PUBLIC_KEY&&env.VAPID_PRIVATE_KEY&&env.REMINDER_DISPATCH_TOKEN?.length>=32);
export async function authorizedDispatcher(request,env){
 const token=env.REMINDER_DISPATCH_TOKEN;
 if(!token||token.length<32||request.headers.has('origin'))return false;
 const header=request.headers.get('authorization');if(!header?.startsWith('Bearer '))return false;
 const digest=async x=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(x)));
 const [a,b]=await Promise.all([digest(header.slice(7)),digest(token)]);let different=0;for(let i=0;i<a.length;i++)different|=a[i]^b[i];return different===0;
}
export function reminderSettings(body){
 if(typeof body.enabled!=='boolean'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)||typeof body.timezone!=='string'||body.timezone.length>80||!['tr','en'].includes(body.language))throw fail('invalid_reminder');
 try{new Intl.DateTimeFormat('en',{timeZone:body.timezone}).format();}catch{throw fail('invalid_timezone');}
 return body;
}
export function validateSubscription(input){
 if(!input||typeof input.endpoint!=='string'||input.endpoint.length>2048)throw fail('invalid_push_subscription');
 let u;try{u=new URL(input.endpoint);}catch{throw fail('invalid_push_subscription');}
 const allowed=u.hostname==='fcm.googleapis.com'||u.hostname==='web.push.apple.com'||u.hostname==='updates.push.services.mozilla.com'||/^([a-z0-9-]+\.)?(notify\.windows\.com|push\.services\.mozilla\.com)$/.test(u.hostname);
 if(u.protocol!=='https:'||u.port||u.username||u.password||u.hash||!allowed||!input.keys||!/^[\w-]{87}$/.test(input.keys.p256dh)||!/^[\w-]{22}$/.test(input.keys.auth))throw fail('invalid_push_subscription');
 return {endpoint:u.href,keys:{p256dh:input.keys.p256dh,auth:input.keys.auth}};
}
export function dueReminder(settings,now=new Date()){
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:settings.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(x=>[x.type,x.value]));
 const [h,m]=settings.time.split(':').map(Number),current=+p.hour*60+ +p.minute,target=h*60+m,delta=(current-target+1440)%1440;
 // Hourly cloud cadence; include a small grace window and yesterday's due time across midnight.
 const date=current<target?new Date(Date.UTC(+p.year,+p.month-1,+p.day-1)).toISOString().slice(0,10):`${p.year}-${p.month}-${p.day}`;
 return {date,due:delta<75};
}
async function digest(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
export async function reminderState(db,user,env){
 const settings=await db.one('SELECT enabled,time,timezone,language FROM reminder_settings WHERE user_id = ?',user);
 const subscriptions=await db.one('SELECT COUNT(*) AS count FROM push_subscriptions WHERE user_id = ?',user);
 const last=await db.one('SELECT payload FROM source_cache WHERE key = ?', 'reminder-dispatch');
 return {settings:settings?{...settings,enabled:!!settings.enabled}:{enabled:false,time:'19:00',timezone:'Europe/Istanbul',language:'tr'},devices:subscriptions.count,configured:pushConfigured(env),publicKey:env.VAPID_PUBLIC_KEY||null,scheduled:env.REMINDER_SCHEDULE_ENABLED==='1',lastDispatch:last?JSON.parse(last.payload).at:null};
}
export async function saveReminder(db,user,body){
 reminderSettings(body);await db.write('INSERT INTO reminder_settings (user_id,enabled,time,timezone,language,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET enabled=excluded.enabled,time=excluded.time,timezone=excluded.timezone,language=excluded.language,updated_at=excluded.updated_at',user,body.enabled?1:0,body.time,body.timezone,body.language,new Date().toISOString());
}
export async function saveSubscription(db,user,input){
 const sub=validateSubscription(input),id=await digest(sub.endpoint),now=new Date().toISOString();
 const prior=await db.one('SELECT user_id FROM push_subscriptions WHERE id = ?',id);
 if(prior&&prior.user_id!==user)throw fail('push_device_in_use',409);
 const count=await db.one('SELECT COUNT(*) AS count FROM push_subscriptions WHERE user_id = ?',user);if(!prior&&count.count>=5)throw fail('push_device_limit',429);
 await db.write('INSERT INTO push_subscriptions (id,user_id,subscription,created_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET subscription=excluded.subscription WHERE push_subscriptions.user_id=excluded.user_id',id,user,JSON.stringify(sub),now);return id;
}
export async function removeSubscription(db,user,endpoint){if(typeof endpoint!=='string')throw fail('invalid_push_subscription');const id=await digest(endpoint);await db.batch([['DELETE FROM reminder_deliveries WHERE user_id = ? AND subscription_id = ?',user,id],['DELETE FROM push_subscriptions WHERE user_id = ? AND id = ?',user,id]]);}
export async function sendPush(env,subscription,language,tag,fetcher=fetch){
 const sub=validateSubscription(subscription);
 const data=JSON.stringify({title:'RealDev',body:language==='en'?'One small step today. Your practice route is waiting.':'Bugün küçük bir adım at. Çalışma rotan seni bekliyor.',url:'/?practice=1',tag});
 const payload=await buildPushPayload({data,options:{ttl:1800}},{...sub,expirationTime:null},{subject:env.VAPID_SUBJECT||'https://realdev.melisauyar5225.chatgpt.site',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY});
 const r=await fetcher(sub.endpoint,{...payload,redirect:'manual',signal:AbortSignal.timeout(8000)});return r.status;
}
export async function testReminder(db,user,body,env,fetcher=fetch,now=new Date()){
 if(!pushConfigured(env))throw fail('push_not_configured',503);
 const id=await digest(body.endpoint||''),sub=await db.one('SELECT * FROM push_subscriptions WHERE user_id = ? AND id = ?',user,id);if(!sub)throw fail('push_device_not_found',404);
 if(sub.last_test_at&&now-new Date(sub.last_test_at)<60000)throw fail('push_test_cooldown',429);
 await db.write('UPDATE push_subscriptions SET last_test_at = ? WHERE id = ? AND user_id = ?',now.toISOString(),id,user);
 const status=await sendPush(env,JSON.parse(sub.subscription),body.language==='en'?'en':'tr','realdev-test',fetcher);
 if(status===404||status===410)await removeSubscription(db,user,body.endpoint);
 if(status<200||status>=300)throw fail('push_delivery_failed',502);return {accepted:true};
}
export async function dispatchReminders(db,env,{now=new Date(),fetcher=fetch,sender=sendPush}={}){
 if(!pushConfigured(env))throw fail('push_not_configured',503);
 const rows=await db.all('SELECT s.*,p.id AS subscription_id,p.subscription FROM reminder_settings s JOIN push_subscriptions p ON p.user_id=s.user_id WHERE s.enabled=1 ORDER BY p.id LIMIT 200');
 let accepted=0,failed=0;const at=now.toISOString();
 for(const row of rows){
  const {due,date}=dueReminder(row,now);if(!due)continue;
  const id=row.subscription_id+'-'+date,claim=crypto.randomUUID();
  await db.write('INSERT OR IGNORE INTO reminder_deliveries (id,user_id,subscription_id,day,status,attempts,updated_at,claim) VALUES (?,?,?,?,?,0,?,?)',id,row.user_id,row.subscription_id,date,'pending','1970-01-01T00:00:00.000Z','');
  await db.write("UPDATE reminder_deliveries SET claim=?,updated_at=?,attempts=attempts+1 WHERE id=? AND status<>'accepted' AND attempts<3 AND updated_at<?",claim,at,id,new Date(now.getTime()-10*60000).toISOString());
  const delivery=await db.one('SELECT claim FROM reminder_deliveries WHERE id=?',id);if(delivery.claim!==claim)continue;
  let status;try{status=await sender(env,JSON.parse(row.subscription),row.language,'realdev-daily-'+date,fetcher);}catch{status=503;}
  const ok=status>=200&&status<300;ok?accepted++:failed++;
  await db.write('UPDATE reminder_deliveries SET status=?,http_status=?,updated_at=? WHERE id=? AND claim=?',ok?'accepted':'failed',status,at,id,claim);
  if(status===404||status===410)await db.write('DELETE FROM push_subscriptions WHERE id=? AND user_id=?',row.subscription_id,row.user_id);
 }
 const report={at,accepted,failed};await db.write('INSERT OR REPLACE INTO source_cache (key,payload,fetched_at) VALUES (?,?,?)','reminder-dispatch',JSON.stringify(report),at);
 await db.write('DELETE FROM reminder_deliveries WHERE updated_at<?',new Date(now.getTime()-30*86400000).toISOString());return report;
}
