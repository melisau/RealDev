// Browser security headers added to every response (pages, assets, API). The Site has no proxy in front of the Worker,
// so they are set here; the local preview and the VDS host get the same policy because they call the same function.
//
// Content-Security-Policy, by what the pages really load:
// - script-src: own files; Firebase Auth SDK from www.gstatic.com (web/auth.js); 'wasm-unsafe-eval' lets the QuickJS
//   code runner compile WebAssembly inside /code-worker.js. No inline scripts and no eval.
// - style-src: own files plus 'unsafe-inline', because progress bars use style="" attributes and auth.html has a
//   <style> block. Inline styles cannot run script. styles.css and theme.css @import Google Fonts, so that
//   stylesheet origin and its font files (font-src fonts.gstatic.com) are allowed.
// - connect-src: own API plus Firebase Auth's two REST endpoints (sign-in/verification, token refresh).
// - frame-ancestors 'none' (with X-Frame-Options for older browsers): the app is never embedded, so clickjacking a
//   signed-in learner is not possible.
const csp=[
 "default-src 'self'",
 "script-src 'self' 'wasm-unsafe-eval' https://www.gstatic.com",
 "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
 "img-src 'self' data:",
 "font-src 'self' https://fonts.gstatic.com",
 "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
 "worker-src 'self'",
 "manifest-src 'self'",
 "object-src 'none'",
 "base-uri 'self'",
 "form-action 'self'",
 "frame-ancestors 'none'"
].join('; ');

export const securityHeaders=Object.freeze({
 'Content-Security-Policy':csp,
 // One year, this host only. Browsers ignore it over plain HTTP, so the loopback preview is unaffected.
 'Strict-Transport-Security':'max-age=31536000',
 'X-Frame-Options':'DENY',
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 // The microphone is used for spoken explanations; nothing else on this list is used by the app.
 'Permissions-Policy':'microphone=(self), camera=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
 'Cross-Origin-Opener-Policy':'same-origin'
});

// Returns a copy of the response with the headers above. A header the handler already set is kept.
export function withSecurityHeaders(response){
 const headers=new Headers(response.headers);
 for(const [name,value] of Object.entries(securityHeaders))if(!headers.has(name))headers.set(name,value);
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
