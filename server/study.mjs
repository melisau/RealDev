// Active study is motivation data, never skill evidence. Intervals are unioned so
// retries and overlapping tabs/devices cannot multiply elapsed time.
const fail=message=>Object.assign(new Error(message),{status:400});
export function studyZone(value){if(typeof value!=='string'||value.length>80)throw fail('invalid_study_timezone');try{new Intl.DateTimeFormat('en',{timeZone:value}).format(0);return value;}catch{throw fail('invalid_study_timezone');}}
const dayFormatter=zone=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'});
export const studyDay=(ms,zone)=>dayFormatter(zone).format(new Date(ms));
export function studyLevel(seconds){return seconds>=1200?5:seconds>=900?4:seconds>=600?3:seconds>=300?2:seconds>0?1:0;}
export function unionStudy(rows,zone){
 const fmt=dayFormatter(studyZone(zone)),day=ms=>fmt.format(new Date(ms)),ranges=rows.map(r=>[r.started_at,r.ended_at]).sort((a,b)=>a[0]-b[0]),merged=[];
 for(const [start,end] of ranges){const last=merged.at(-1);if(last&&start<=last[1])last[1]=Math.max(last[1],end);else merged.push([start,end]);}
 const days={};for(let [start,end] of merged){while(start<end){const key=day(start);let stop=end;if(day(end-1)!==key){let lo=start+1,hi=end;while(lo<hi){const mid=Math.floor((lo+hi)/2);if(day(mid)===key)lo=mid+1;else hi=mid;}stop=lo;}days[key]=(days[key]||0)+(stop-start)/1000;start=stop;}}
 return Object.fromEntries(Object.entries(days).map(([key,value])=>[key,Math.floor(value)]));
}
export async function saveStudy(db,user,body,now=Date.now()){
 if(!Array.isArray(body.intervals)||!body.intervals.length||body.intervals.length>8)throw fail('invalid_study_intervals');
 const rows=body.intervals.map(x=>{if(!x||typeof x.id!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(x.id)||!['question','concept'].includes(x.kind)||!Number.isSafeInteger(x.start)||!Number.isSafeInteger(x.end)||x.start%1000||x.end%1000||x.end<=x.start||x.end-x.start>60000||x.start<now-86400000||x.end>now+5000)throw fail('invalid_study_interval');return x;});
 // The owner and id form the key. A retry cannot alter an already saved interval.
 await db.batch(rows.map(x=>['INSERT OR IGNORE INTO study_intervals (user_id,id,started_at,ended_at,kind) VALUES (?,?,?,?,?)',user,x.id,x.start,x.end,x.kind]));
 return {saved:true};
}
export async function studyCalendar(db,user,{month,timezone},now=Date.now()){
 const zone=studyZone(timezone),today=studyDay(now,zone);month=month||today.slice(0,7);
 if(typeof month!=='string'||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))throw fail('invalid_study_month');
 const [year,m]=month.split('-').map(Number),start=Date.UTC(year,m-1,1)-2*86400000,end=Date.UTC(year,m,1)+2*86400000;
 const rows=await db.all('SELECT started_at,ended_at FROM study_intervals WHERE user_id=? AND started_at<? AND ended_at>? ORDER BY started_at',user,end,start);
 const all=unionStudy(rows,zone),days=Object.fromEntries(Object.entries(all).filter(([date])=>date.startsWith(month)));
 let todaySeconds=all[today]||0;if(!today.startsWith(month)){const from=now-2*86400000;todaySeconds=unionStudy(await db.all('SELECT started_at,ended_at FROM study_intervals WHERE user_id=? AND started_at<? AND ended_at>? ORDER BY started_at',user,now+5000,from),zone)[today]||0;}
 return {month,timezone:zone,today,todaySeconds,days,totalSeconds:Object.values(days).reduce((a,b)=>a+b,0)};
}