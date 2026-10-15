(function(){
 const paths=new Set(['/today','/quiz','/map','/route','/calendar','/history','/topics','/notes','/library','/lab','/interview','/errors','/concepts','/news','/github','/code-history','/review','/advanced','/account']);
 const safeReturnTo=value=>{if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u001f]/.test(value)||value.includes('?')||value.includes('#'))return '/today';try{const url=new URL(value,location.origin);return url.origin===location.origin&&paths.has(url.pathname)?url.pathname:'/today';}catch{return '/today';}};
 const signInUrl=(value,mode='sign-in')=>'/auth.html?returnTo='+encodeURIComponent(safeReturnTo(value))+'#/'+(mode==='sign-up'?'sign-up':'sign-in');
 const returnTo=search=>safeReturnTo(new URLSearchParams(search||'').get('returnTo'));
 window.RealDevRoutes={safeReturnTo,signInUrl,returnTo};
})();
