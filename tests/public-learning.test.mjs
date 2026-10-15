import test from 'node:test';
import assert from 'node:assert/strict';
import {lessons,learningPages} from '../server/public-learning.mjs';
import {renderPageDocument,sitemapXml} from '../server/page-routes.mjs';
test('public concepts ship readable bilingual HTML without auth or SPA scripts',()=>{
 assert.equal(lessons.length,12);assert.equal(learningPages.length,26);
 for(const [path] of learningPages){const r=renderPageDocument('',path,'https://realdev.example');assert.match(r.html,/<h1>/);assert.match(r.html,/application\/ld\+json/);assert.match(r.html,/hreflang="tr"/);assert.match(r.html,/hreflang="en"/);assert.doesNotMatch(r.html,/<script[^>]+src=/);assert.match(r.html,/auth.html\?returnTo=/);assert.equal(r.robots,'index, follow');}
 for(const l of lessons){assert.ok(l.sourceUrl.startsWith('https://'));for(const lang of ['tr','en'])assert.ok(l.definition[lang].length>100);}
 assert.match(sitemapXml('https://realdev.example'),/\/learn\/transactions/);
});
test('public articles in local previews keep noindex',()=>{const r=renderPageDocument('','/learn/http','http://localhost:4317',{allowIndexing:false});assert.match(r.html,/noindex, nofollow/);});
