(function(){
 const paths=new Set(['/today','/quiz','/map','/route','/calendar','/history','/topics','/notes','/library','/lab','/interview','/errors','/concepts','/news','/github','/code-history','/review','/advanced','/account']);
 const safeReturnTo=value=>{if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\u0000-\u001f]/.test(value)||value.includes('#'))return '/today';try{const url=new URL(value,location.origin);if(url.origin!==location.origin||!paths.has(url.pathname))return '/today';if(url.search&&url.pathname!=='/topics')return '/today';const query=new URLSearchParams();for(const key of ['area','subtopic','level','query']){const v=url.searchParams.get(key);if(v&&v.length<=120)query.set(key,v);}return url.pathname+(query.size?'?'+query:'');}catch{return '/today';}};
 const signInUrl=(value,mode='sign-in')=>'/auth.html?returnTo='+encodeURIComponent(safeReturnTo(value))+'#/'+(mode==='sign-up'?'sign-up':'sign-in');
 const returnTo=search=>safeReturnTo(new URLSearchParams(search||'').get('returnTo'));
 // Decides what a signed-out page shows: public paths render, private paths wait for the session to be known,
 // then go to sign-in with the current page as returnTo (only when sign-in is actually available).
 const guestDecision=({path,signedIn,sessionKnown,canSignIn})=>{if(signedIn||!paths.has(path))return 'render';if(!sessionKnown)return 'wait';return canSignIn?'sign-in':'render';};
 window.RealDevRoutes={safeReturnTo,signInUrl,returnTo,guestDecision};
})();
