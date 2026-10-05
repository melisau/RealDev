self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
 let message={};try{message=event.data?.json()||{};}catch{}
 event.waitUntil(self.registration.showNotification('RealDev',{body:message.body||'Your practice route is waiting.',tag:message.tag||'realdev-daily',icon:'/icon.svg',badge:'/icon.svg',data:{url:'/?practice=1'}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();event.waitUntil((async()=>{const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const window of windows){if(new URL(window.url).origin===self.location.origin){await window.navigate('/?practice=1');return window.focus();}}return self.clients.openWindow('/?practice=1');})());
});
