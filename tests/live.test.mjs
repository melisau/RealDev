import test from 'node:test';import assert from 'node:assert/strict';
import {parseFeed,newsFeed,githubRepo,validateRepo} from '../server/live.mjs';
import {localDb} from '../scripts/local-db.mjs';import {database} from '../server/db.mjs';
const xml=host=>`<rss><channel><item><title>Release &amp; news</title><link>https://${host}/release</link><pubDate>Mon, 05 Oct 2026 10:00:00 GMT</pubDate><description><![CDATA[<p>Source summary</p>]]></description></item></channel></rss>`;
test('RSS parsing keeps official HTTPS links and rejects entities',()=>{
 const feed={id:'test',name:'Test',host:'example.com'};
 assert.equal(parseFeed(xml('example.com'),feed)[0].summary,'Source summary');
 assert.equal(parseFeed(xml('evil.test'),feed).length,0);
 assert.throws(()=>parseFeed('<!DOCTYPE rss>'+xml('example.com'),feed));
});
test('live feeds cache successful data and label stale fallback on failure',async()=>{
 const DB=localDb(),db=database({DB});let calls=0;
 const fetcher=async url=>{calls++;return new Response(xml(new URL(url).hostname));};
 const first=await newsFeed(db,fetcher);assert.equal(first.items.length,4);
 await newsFeed(db,fetcher);assert.equal(calls,4);
 await db.write("UPDATE source_cache SET fetched_at = '2000-01-01T00:00:00Z'");
 await db.write("UPDATE source_health SET attempted_at = '2000-01-01T00:00:00Z'");
 const stale=await newsFeed(db,async()=>{throw Error('offline');});assert.equal(stale.items.length,0);assert.equal(stale.archived.length,4);assert.ok(stale.archived.every(x=>x.stale));assert.ok(stale.sources.every(x=>x.error==='offline'));
 DB.close();
});
test('news requests follow canonical redirects and reject feeds leaving their trusted host',async()=>{
 const DB=localDb(),db=database({DB});let calls=0;
 const result=await newsFeed(db,async(url,options)=>{calls++;assert.equal(options.redirect,'follow');const r=new Response(xml(new URL(url).hostname));if(url.includes('openai.com'))Object.defineProperty(r,'url',{value:'https://untrusted.example/feed.xml'});return r;});
 assert.equal(calls,4);assert.equal(result.sources.find(x=>x.id==='openai').error,'unexpected_feed_host');assert.ok(result.sources.filter(x=>x.id!=='openai').every(x=>!x.error));assert.equal(result.items.length,3);DB.close();
});
test('GitHub validates repo paths, tolerates independent section failure and caches',async()=>{
 assert.equal(validateRepo('melisau/RealDev'),true);for(const x of ['https://evil.test','x/../../y','x/y?z','x/y/z'])assert.equal(validateRepo(x),false);
 const DB=localDb(),db=database({DB});let count=0;
 const mock=async (url,options)=>{count++;assert.equal(options.redirect,'follow');if(url.includes('/actions/'))return new Response('',{status:403});if(url.includes('/commits')||url.includes('/pulls'))return Response.json([]);if(url.includes('/languages'))return Response.json({JavaScript:100});return Response.json({private:false,full_name:'melisau/RealDev',html_url:'https://github.com/melisau/RealDev',default_branch:'main'});};
 const r=await githubRepo(db,'melisau/RealDev',mock);assert.equal(r.repository.name,'melisau/RealDev');assert.equal(r.errors[0].section,'actions');await githubRepo(db,'melisau/RealDev',mock);assert.equal(count,5);DB.close();
});
test('GitHub follows redirects only while the final API host remains trusted',async()=>{
 const DB=localDb(),db=database({DB});
 const result=await githubRepo(db,'melisau/RealDev',async(url,options)=>{
  assert.equal(options.redirect,'follow');
  const response=Response.json({private:false,full_name:'melisau/RealDev',html_url:'https://github.com/melisau/RealDev',default_branch:'main'});
  Object.defineProperty(response,'url',{value:'https://untrusted.example/repos/melisau/RealDev'});
  return response;
 });
 assert.equal(result.error,'unexpected_github_host');
 DB.close();
});
