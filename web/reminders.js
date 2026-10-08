(() => {
 const t=(tr,en)=>window.realdevLocale==='en'?en:tr;
 let data=null, busy=false, revision=0;
 const supported=()=>window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
 const dialog=document.createElement('dialog');dialog.className='reminder-dialog';dialog.id='reminderDialog';document.body.append(dialog);
 const deadline=(promise,ms=15000)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('timeout')),ms);
  Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});
 });
 async function api(path,body,method='POST'){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch('/api/reminders'+path,{method:body===undefined?'GET':method,headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});const value=await response.json();if(!response.ok)throw Error(value.error);return value;}
  catch(error){if(error.name==='AbortError')throw Error('timeout');throw error;}finally{clearTimeout(timer);}
 }
 const registration=()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(()=>navigator.serviceWorker.ready);
 const settings=()=>({enabled:dialog.querySelector('#reminderEnabled').checked,time:dialog.querySelector('#reminderTime').value,timezone:dialog.querySelector('#reminderZone').value,language:window.realdevLocale==='en'?'en':'tr'});
 const status=text=>{const node=dialog.querySelector('[role=status]');if(node)node.textContent=text;};
 const scheduleText=()=>data.scheduled?t('Zamanlayıcı etkin olarak yapılandırılmış. Bildirimler seçtiğin saatten sonraki saatlik kontrolde gönderilir; yaklaşık bir saat gecikebilir. Teslimat internet ve cihaz ayarlarına bağlıdır.','Scheduling is configured as active. Reminders are sent on the hourly check after your chosen time, possibly about an hour later. Delivery depends on network and device settings.'):t('Arka plan gönderim zamanlayıcısı henüz etkin değil. Ayarını kaydedebilirsin; günlük teslimat başlamadı.','Background scheduling is not active yet. You can save settings; daily delivery has not started.');
 const updateDevices=()=>{const node=dialog.querySelector('[data-device-count]');if(node)node.textContent=t('Bağlı cihaz: ','Connected devices: ')+data.devices;};
 async function open(){
  if(dialog.open)return;
  const current=++revision;busy=false;
  dialog.innerHTML=`<h2>${t('Günlük hatırlatıcı','Daily reminder')}</h2><p role="status">${t('Yükleniyor…','Loading…')}</p><button type="button" data-reminder="close">${t('Kapat','Close')}</button>`;dialog.showModal();
  try{const loaded=await api('');if(current!==revision||!dialog.open)return;data=loaded;const s=data.settings;
   const zones=[...new Set([s.timezone,Intl.DateTimeFormat().resolvedOptions().timeZone,'Europe/Istanbul','Europe/London','Europe/Berlin','America/New_York','America/Los_Angeles','Asia/Tokyo','UTC'])];
   const last=data.lastDispatch?new Date(data.lastDispatch):null;
   const lastText=last&&!Number.isNaN(last.getTime())?t('Son sunucu kontrolü: ','Last server check: ')+last.toLocaleString(window.realdevLocale==='en'?'en-GB':'tr-TR'):t('Henüz başarılı bir sunucu kontrolü kaydı yok.','No successful server check has been recorded yet.');
   dialog.innerHTML=`<div class="rd"><h2>${t('Günlük hatırlatıcı','Daily reminder')}</h2><p>${t('Saat ve saat dilimi hesabında saklanır. Bu cihazda bildirim izni ver; ardından test bildiriminin geldiğini kontrol et.','Time and timezone are saved to your account. Allow notifications on this device, then check that a test notification arrives.')}</p><label class="rd-answer"><input type="checkbox" id="reminderEnabled" ${s.enabled?'checked':''}>${t('Günlük hatırlatma açık','Enable daily reminders')}</label><label class="rd-label" for="reminderTime">${t('Hatırlatma saati','Reminder time')}</label><input type="time" id="reminderTime" value="${s.time}" required><label class="rd-label" for="reminderZone">${t('Saat dilimi','Timezone')}</label><select id="reminderZone">${zones.map(z=>`<option value="${esc(z)}" ${z===s.timezone?'selected':''}>${esc(z)}</option>`).join('')}</select><p data-device-count></p><p>${!supported()?t('Bu tarayıcı Web Push desteklemiyor. Chrome, Edge, Firefox veya destekli Safari kullan. iPhone’da önce Safari’den ana ekrana ekle.','This browser does not support Web Push. Use Chrome, Edge, Firefox or supported Safari. On iPhone, add the Site to your home screen first.'):Notification.permission==='denied'?t('Bildirim izni engellenmiş. Tarayıcının site ayarlarından izin verebilirsin.','Notifications are blocked. Allow them in your browser’s Site settings.'):t('İzin yalnızca aşağıdaki cihaz düğmesine basınca istenir.','Permission is requested only when you choose the device button below.')}</p><p class="muted">${scheduleText()}</p><p class="muted">${esc(lastText)}</p><div class="rd-actions"><button class="primary-button" data-reminder="save">${t('Saati kaydet','Save time')}</button><button class="secondary-button" data-reminder="enable" ${!supported()||!data.configured?'disabled':''}>${t('Bu cihazda bildirim aç','Enable on this device')}</button><button class="secondary-button" data-reminder="test" ${!supported()||!data.configured?'disabled':''}>${t('Test bildirimi gönder','Send test notification')}</button><button class="secondary-button" data-reminder="remove" ${!supported()?'disabled':''}>${t('Bu cihazı kaldır','Remove this device')}</button><button class="secondary-button" data-reminder="close">${t('Kapat','Close')}</button></div><p role="status" aria-live="polite"></p></div>`;updateDevices();
  }catch(error){if(current===revision)status(error.message==='timeout'?t('Sunucu yanıt vermedi. Kapatıp yeniden deneyebilirsin.','The server did not respond. Close and try again.'):t('Ayarlar yüklenemedi. Hesabına giriş yapıp yeniden dene.','Settings could not load. Sign in and try again.'));}
 }
 window.realdevReminders=open;
 const invalidate=()=>{revision++;busy=false;};dialog.addEventListener('close',invalidate);dialog.addEventListener('cancel',invalidate);
 dialog.addEventListener('click',async event=>{
  const button=event.target.closest('[data-reminder]');if(!button)return;const action=button.dataset.reminder;
  if(action==='close'){invalidate();dialog.close();return;}if(busy||button.disabled)return;
  busy=true;const current=revision;
  const controls=[...dialog.querySelectorAll('[data-reminder]')].filter(node=>node.dataset.reminder!=='close').map(node=>({node,disabled:node.disabled}));
  controls.forEach(({node})=>node.disabled=true);
  const step=async(promise,ms)=>{const value=await deadline(promise,ms);if(current!==revision||!dialog.open)throw Error('cancelled');return value;};
  status(t('İşlem sürüyor…','Working…'));
  try{
   if(action==='save'){await step(api('',settings(),'PUT'));status(t('Saat ve hatırlatma tercihin kaydedildi. Cihaz izni ayrıca gerekir. ','Your time and preference are saved. Device permission is also required. ')+scheduleText());}
   if(action==='enable'){
    status(t('Tarayıcıdaki bildirim izni penceresini kontrol et.','Check the browser notification permission prompt.'));
    const permission=await step(Notification.requestPermission(),30000);if(permission!=='granted')throw Error('permission');
    status(t('Cihazın bildirim servisine bağlanıyor…','Connecting this device to its push service…'));
    const reg=await step(registration());let subscription=await step(reg.pushManager.getSubscription());
    if(!subscription){const b64=data.publicKey.replace(/-/g,'+').replace(/_/g,'/');const key=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));subscription=await step(reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key}),20000);}
    await step(api('/subscription',{subscription:subscription.toJSON()}));
    await step(api('',{...settings(),enabled:true},'PUT'));dialog.querySelector('#reminderEnabled').checked=true;
    data=await step(api(''));updateDevices();
    status(t('Bu cihaz bağlandı, tercihin kaydedildi. Test bildiriminin geldiğini kontrol et. ','This device is connected and your preference is saved. Check delivery with a test notification. ')+scheduleText());
   }
   if(action==='test'){const subscription=await step((await step(registration())).pushManager.getSubscription());if(!subscription)throw Error('missing');await step(api('/test',{endpoint:subscription.endpoint,language:window.realdevLocale==='en'?'en':'tr'}));status(t('Test bildirimi bildirim servisine iletildi. Cihazında geldiğini kontrol et; bu yanıt teslimat garantisi değildir.','The push service accepted the test notification. Check your device; acceptance does not guarantee delivery.'));}
   if(action==='remove'){const subscription=await step((await step(registration())).pushManager.getSubscription());if(subscription){await step(api('/subscription',{remove:true,endpoint:subscription.endpoint}));await step(subscription.unsubscribe());}data=await step(api(''));updateDevices();status(t('Bu cihazın bildirim bağlantısı kaldırıldı. Diğer cihazlar değişmedi.','This device is disconnected. Other devices are unchanged.'));}
  }catch(error){if(current===revision)status(error.message==='timeout'?t('İşlem zaman aşımına uğradı. Tarayıcının izin penceresini ve bildirim desteğini kontrol et. Chrome veya Edge’de tekrar deneyebilirsin; bu pencereyi kapatabilirsin.','The operation timed out. Check the browser permission prompt and notification support. You can retry in Chrome or Edge, or close this window.'):error.message==='push_test_cooldown'?t('Yeni test için bir dakika bekle.','Wait one minute before another test.'):error.message==='permission'?t('Bildirim izni verilmedi. Saat tercihin korunuyor.','Notification permission was not granted. Your time preference is preserved.'):error.message==='missing'?t('Önce bu cihazda bildirim aç.','Enable notifications on this device first.'):t('İşlem tamamlanamadı. Bazı adımlar kaydedilmiş olabilir; ayarları yeniden açıp kontrol et. Bildirim iznini ve internet bağlantını kontrol ederek tekrar dene.','The operation did not complete. Some steps may have been saved; reopen settings to check. Verify notification permission and network access, then retry.'));}
  finally{if(current===revision){busy=false;controls.forEach(({node,disabled})=>node.disabled=disabled);}}
 });
 if(new URLSearchParams(location.search).has('practice'))setTimeout(()=>go('route'),600);
})();