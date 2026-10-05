(function(){
 const rawFetch=window.fetch.bind(window);let client=null;let activeMode='sign-in';
 const status=()=>document.getElementById('authStatus');
 const currentLanguage=()=>window.realdevLocale||localStorage.getItem('realdev-language')||'tr';
 const text=(tr,en)=>currentLanguage()==='en'?en:tr;
 const applyLanguage=locale=>{document.documentElement.lang=locale;document.title=locale==='en'?'RealDeveloper · Sign in':'RealDeveloper · Hesap girişi';const en=locale==='en';const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};set('authHeading',en?'Sign in or create an account':'Giriş yap veya kayıt ol');set('authLanguageToggle',en?'TR':'EN');set('authSubmit',activeMode==='sign-in'?(en?'Sign in →':'Giriş yap →'):(en?'Create account →':'Hesap oluştur →'));set('signInTab',en?'Sign in':'Giriş yap');set('signUpTab',en?'Create account':'Kayıt ol');const loginLink=document.getElementById('authLink');if(loginLink)loginLink.textContent=en?'Sign in / Create account':'Giriş / Kayıt';const heading=document.querySelector('.auth-intro h1');if(heading)heading.textContent=en?'continue with your account':'kendi hesabınla devam et';const intro=document.querySelector('.auth-intro p');if(intro)intro.textContent=en?'Your learning route, answers, notes and code practice are saved to your account.':'Öğrenme rotan, cevapların, notların ve kod çalışmaların hesabına kaydedilir.';const back=document.querySelector('.auth-back');if(back)back.textContent=en?'← Back to workspace':'← Çalışma alanına dön';const eyebrow=document.querySelector('.auth-form .eyebrow');if(eyebrow)eyebrow.textContent=en?'ACCOUNT':'HESAP';const email=document.querySelector('label[for=authEmail]');if(email)email.textContent=en?'Email':'E-posta';const password=document.querySelector('label[for=authPassword]');if(password)password.textContent=en?'Password':'Parola';};
 window.realdevAuthLocale=applyLanguage;
 const configPromise=rawFetch('/api/auth/config',{headers:{Accept:'application/json'}}).then(r=>r.json()).then(async config=>{
  if(!config.configured)return config;
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js';script.onload=()=>{const authScript=document.createElement('script');authScript.src='https://www.gstatic.com/firebasejs/12.19.0/firebase-auth-compat.js';authScript.onload=resolve;authScript.onerror=()=>reject(Error('auth_sdk_unavailable'));document.head.appendChild(authScript);};script.onerror=()=>reject(Error('auth_sdk_unavailable'));document.head.appendChild(script);});
  client=window.firebase.initializeApp({apiKey:config.apiKey,authDomain:config.projectId+'.firebaseapp.com',projectId:config.projectId}).auth();await client.setPersistence(window.firebase.auth.Auth.Persistence.SESSION);
  if(location.pathname.endsWith('/auth.html'))setupForm();
  return config;
 }).catch(()=>({configured:false,error:true}));
 window.realdevAuthReady=configPromise;
 window.fetch=async function(input,init={}){
  let url;try{url=new URL(typeof input==='string'?input:input.url,location.href);}catch{return rawFetch(input,init);}
  if(url.origin!==location.origin||!url.pathname.startsWith('/api/')||url.pathname==='/api/auth/config')return rawFetch(input,init);
  await configPromise;if(!client)return rawFetch(input,init);
  const token=client.currentUser?await client.currentUser.getIdToken():null;
  if(token){const headers=new Headers(input instanceof Request?input.headers:undefined);new Headers(init.headers).forEach((value,key)=>headers.set(key,value));headers.set('Authorization','Bearer '+token);init={...init,headers};}
  return rawFetch(input,init);
 };
 function setMode(mode){activeMode=mode;const signIn=mode==='sign-in';document.getElementById('signInTab').setAttribute('aria-selected',String(signIn));document.getElementById('signUpTab').setAttribute('aria-selected',String(!signIn));applyLanguage(currentLanguage());status().textContent='';document.getElementById('authPassword').autocomplete=signIn?'current-password':'new-password';}
 function setupForm(){
  const form=document.getElementById('authForm');if(!form)return;
  applyLanguage(localStorage.getItem('realdev-language')||'tr');
  document.getElementById('signInTab').addEventListener('click',()=>setMode('sign-in'));document.getElementById('signUpTab').addEventListener('click',()=>setMode('sign-up'));
  form.addEventListener('submit',async e=>{e.preventDefault();const button=document.getElementById('authSubmit');const email=document.getElementById('authEmail').value.trim();const password=document.getElementById('authPassword').value;button.disabled=true;status().textContent=text('İşleniyor…','Working…');
   try{const result=activeMode==='sign-up'?await client.createUserWithEmailAndPassword(email,password):await client.signInWithEmailAndPassword(email,password);if(activeMode==='sign-up'){await result.user.sendEmailVerification();await client.signOut();status().textContent=text('Hesabın oluşturuldu. E-posta doğrulama bağlantısını kontrol et, ardından giriş yap.','Account created. Check your email for the verification link, then sign in.');return;}if(!result.user.emailVerified){await client.signOut();status().textContent=text('Girişten önce e-posta adresini doğrulaman gerekiyor. Gelen kutunu kontrol et.','Verify your email address before signing in. Check your inbox.');return;}status().textContent=text('Giriş başarılı. Çalışma alanın açılıyor…','Signed in. Opening your workspace…');location.assign('/#today');}
   catch(error){status().textContent=error.message==='Invalid login credentials'?text('E-posta veya parola doğru değil.','Email or password is incorrect.'):text('İşlem tamamlanamadı. Bilgileri kontrol edip tekrar dene.','Could not complete the request. Check the details and try again.');}
   finally{button.disabled=false;}
  });
 }
 document.addEventListener('DOMContentLoaded',async()=>{
  applyLanguage(localStorage.getItem('realdev-language')||'tr');document.getElementById('authLanguageToggle')?.addEventListener('click',()=>{const next=currentLanguage()==='tr'?'en':'tr';localStorage.setItem('realdev-language',next);applyLanguage(next);});const link=document.getElementById('authLink');if(link)link.hidden=false;
  if(location.pathname.endsWith('/auth.html')){const config=await configPromise;if(!config.configured){document.querySelectorAll('#authForm input,#authForm button,#signInTab,#signUpTab').forEach(el=>el.disabled=true);status().textContent=text('Kayıt ve giriş henüz bağlanmadı. Firebase proje ayarları gerekiyor; parolan bu sitede saklanmaz.','Sign-in is not connected yet. Firebase project settings are required first. This site never stores your password.');}}
 });
})();
