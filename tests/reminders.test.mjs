import test from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync,randomBytes} from 'node:crypto';
import {localDb} from '../scripts/local-db.mjs';import {database} from '../server/db.mjs';import {api} from '../server/api.mjs';import {eraseAccount,exportAccount} from '../server/account.mjs';
import {saveReminder,saveSubscription,dispatchReminders,dueReminder,reminderSettings,validateSubscription,authorizedDispatcher,sendPush,removeSubscription} from '../server/reminders.mjs';
const env={VAPID_PUBLIC_KEY:'x',VAPID_PRIVATE_KEY:'y',REMINDER_DISPATCH_TOKEN:'s'.repeat(40)};
const subscription=id=>({endpoint:'https://fcm.googleapis.com/fcm/send/'+id,keys:{p256dh:'A'.repeat(87),auth:'B'.repeat(22)}});
test('reminder times and timezones are validated and midnight/DST use the local calendar day',()=>{
 assert.throws(()=>reminderSettings({enabled:true,time:'25:00',timezone:'UTC',language:'tr'}));assert.throws(()=>reminderSettings({enabled:true,time:'10:00',timezone:'No/Where',language:'tr'}));
 assert.deepEqual(dueReminder({time:'00:00',timezone:'Europe/Istanbul'},new Date('2026-10-05T21:05:00Z')),{date:'2026-10-06',due:true});
 assert.equal(dueReminder({time:'19:00',timezone:'Europe/Istanbul'},new Date('2026-10-05T15:59:00Z')).due,false);
 assert.equal(dueReminder({time:'19:00',timezone:'Europe/Istanbul'},new Date('2026-10-05T17:15:00Z')).due,false);
 assert.deepEqual(dueReminder({time:'23:30',timezone:'Europe/Istanbul'},new Date('2026-10-05T21:05:00Z')),{date:'2026-10-05',due:true});
 assert.equal(dueReminder({time:'01:15',timezone:'America/New_York'},new Date('2026-11-01T06:16:00Z')).due,true);
});
test('push endpoints cannot target arbitrary hosts, credentials, redirects or local infrastructure',()=>{
 for(const endpoint of ['http://fcm.googleapis.com/x','https://127.0.0.1/x','https://evil.test/x','https://fcm.googleapis.com.evil.test/x','https://fcm.googleapis.com:8443/x','https://user@fcm.googleapis.com/x'])assert.throws(()=>validateSubscription({...subscription('x'),endpoint}));
 assert.ok(validateSubscription(subscription('real')));assert.throws(()=>validateSubscription({...subscription('x'),keys:{p256dh:'x',auth:'y'}}));
});
test('dispatch requires a strong bearer credential; origin and wrong credentials never authorize',async()=>{
 const req=(headers={})=>new Request('https://realdev.test/internal/reminders/dispatch',{method:'POST',headers});
 assert.equal(await authorizedDispatcher(req(),env),false);assert.equal(await authorizedDispatcher(req({authorization:'Bearer wrong'}),env),false);
 assert.equal(await authorizedDispatcher(req({authorization:'Bearer '+env.REMINDER_DISPATCH_TOKEN,origin:'https://realdev.test'}),env),false);
 assert.equal(await authorizedDispatcher(req({authorization:'Bearer '+env.REMINDER_DISPATCH_TOKEN}),env),true);
 assert.equal(await authorizedDispatcher(req({authorization:'Bearer short'}),{REMINDER_DISPATCH_TOKEN:'short'}),false);
});
test('closed-page dispatch claims devices once per local day, honours opt-out and expires dead subscriptions',async()=>{
 const DB=localDb(),db=database({DB});await saveReminder(db,'a',{enabled:true,time:'19:00',timezone:'Europe/Istanbul',language:'tr'});await saveReminder(db,'b',{enabled:false,time:'19:00',timezone:'Europe/Istanbul',language:'en'});
 await saveSubscription(db,'a',subscription('one'));await saveSubscription(db,'b',subscription('two'));
 let sends=0;const sender=async()=>{sends++;return 201;},now=new Date('2026-10-05T16:02:00Z');
 assert.equal((await dispatchReminders(db,env,{now,sender})).accepted,1);await dispatchReminders(db,env,{now:new Date('2026-10-05T16:17:00Z'),sender});assert.equal(sends,1);
 const expired=await dispatchReminders(db,env,{now:new Date('2026-10-06T16:02:00Z'),sender:async()=>410});assert.equal(expired.failed,1);assert.equal((await db.all('SELECT * FROM push_subscriptions WHERE user_id=?','a')).length,0);assert.equal((await db.all('SELECT * FROM push_subscriptions WHERE user_id=?','b')).length,1);DB.close();
});
test('parallel dispatches do not duplicate a claimed delivery; temporary failure retries only after lease',async()=>{
 const DB=localDb(),db=database({DB});await saveReminder(db,'a',{enabled:true,time:'10:00',timezone:'UTC',language:'en'});await saveSubscription(db,'a',subscription('concurrent'));const now=new Date('2026-10-05T10:01:00Z');let calls=0;
 const sender=async()=>{calls++;return 503;};await Promise.all([dispatchReminders(db,env,{now,sender}),dispatchReminders(db,env,{now,sender})]);assert.equal(calls,1);
 await dispatchReminders(db,env,{now:new Date('2026-10-05T10:05:00Z'),sender});assert.equal(calls,1);
 await dispatchReminders(db,env,{now:new Date('2026-10-05T10:16:00Z'),sender:async()=>{calls++;return 201;}});assert.equal(calls,2);DB.close();
});
test('settings/subscriptions are account-owned, exported, and removed atomically with the account',async()=>{
 const DB=localDb(),db=database({DB});await saveReminder(db,'a',{enabled:true,time:'19:00',timezone:'UTC',language:'tr'});await saveSubscription(db,'a',subscription('a'));await saveSubscription(db,'b',subscription('b'));
 await assert.rejects(saveSubscription(db,'b',subscription('a')),/push_device_in_use/);await removeSubscription(db,'b',subscription('a').endpoint);assert.equal((await db.all('SELECT * FROM push_subscriptions')).length,2);
 const exported=await exportAccount(db,'a');assert.equal(exported.data.push_subscriptions.length,1);assert.equal(exported.data.reminder_settings.length,1);
 await eraseAccount(db,'a','learning');assert.equal((await db.all('SELECT * FROM reminder_settings')).length,1);
 await eraseAccount(db,'a','account');assert.equal((await db.all('SELECT * FROM reminder_settings')).length,0);assert.equal((await db.all('SELECT * FROM push_subscriptions'))[0].user_id,'b');
 const request=new Request('https://realdev.test/api/reminders',{headers:{'oai-authenticated-user-id':'b'}});const result=await (await api(request,{DB,...env})).json();assert.equal(result.devices,1);assert.equal(result.settings.enabled,false);assert.equal(JSON.stringify(result).includes('fcm.googleapis'),false);DB.close();
});
test('Web Push builds an encrypted RFC payload and never follows provider redirects',async()=>{
 const key=generateKeyPairSync('ec',{namedCurve:'prime256v1'}).privateKey.export({format:'jwk'});const receiver=generateKeyPairSync('ec',{namedCurve:'prime256v1'}).publicKey.export({format:'jwk'});
 const raw=j=>Buffer.concat([Buffer.from([4]),Buffer.from(j.x,'base64url'),Buffer.from(j.y,'base64url')]).toString('base64url');
 let payload;const status=await sendPush({...env,VAPID_PUBLIC_KEY:raw(key),VAPID_PRIVATE_KEY:key.d},{endpoint:subscription('encrypted').endpoint,keys:{p256dh:raw(receiver),auth:randomBytes(16).toString('base64url')}},'tr','daily',async(url,options)=>{payload=options;return new Response(null,{status:201});});
 assert.equal(status,201);assert.equal(payload.redirect,'manual');assert.ok(payload.body);assert.equal(new TextDecoder().decode(payload.body).includes('Çalışma'),false);assert.ok(new Headers(payload.headers).get('authorization').startsWith('vapid '));assert.equal(new Headers(payload.headers).get('content-encoding'),'aes128gcm');
});
