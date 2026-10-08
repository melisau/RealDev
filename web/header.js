/* Mobile keeps the original preference buttons/listeners, moving them into the drawer. */
(() => {
 const sidebar=document.getElementById('sidebar'),menu=document.getElementById('menuButton'),slot=document.getElementById('mobilePreferences'),home=document.getElementById('headerPreferences'),closeButton=document.getElementById('menuClose'),backdrop=document.getElementById('menuBackdrop');
 if(!sidebar||!menu||!slot||!home)return;
 const media=matchMedia('(max-width: 720px)'),language=document.getElementById('languageToggle'),theme=document.getElementById('themeToggle');
 const labels=()=>{const en=window.realdevLocale==='en';document.getElementById('mobilePreferencesLabel').textContent=en?'Language & appearance':'Dil ve görünüm';document.getElementById('mobileMenuLabel').textContent=en?'Menu':'Menü';closeButton.setAttribute('aria-label',en?'Close menu':'Menüyü kapat');backdrop.setAttribute('aria-label',en?'Close menu':'Menüyü kapat');menu.setAttribute('aria-label',sidebar.classList.contains('open')?(en?'Close menu':'Menüyü kapat'):(en?'Open menu':'Menüyü aç'));};
 const sync=()=>{const open=media.matches&&sidebar.classList.contains('open');menu.setAttribute('aria-expanded',String(open));backdrop.hidden=!open;document.body.classList.toggle('mobile-drawer-open',open);labels();};
 const close=()=>{sidebar.classList.remove('open');sync();menu.focus();};
 const place=()=>{const target=media.matches?slot:home;target.append(language,theme);if(!media.matches)sidebar.classList.remove('open');sync();};
 menu.setAttribute('aria-controls','sidebar');closeButton.addEventListener('click',close);backdrop.addEventListener('click',close);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&sidebar.classList.contains('open')){event.preventDefault();close();}});
 document.addEventListener('click',event=>{if(event.target.closest('#languageToggle'))queueMicrotask(labels);});
 new MutationObserver(sync).observe(sidebar,{attributes:true,attributeFilter:['class']});media.addEventListener('change',place);place();
})();
