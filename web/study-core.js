(function(root){
 'use strict';
 const level=s=>s>=1200?5:s>=900?4:s>=600?3:s>=300?2:s>0?1:0;
 // Monotonic elapsed time prevents sleep, throttled tabs and clock jumps from
 // adding a large inactive gap. Only consecutive eligible samples earn time.
 function tracker(){let previous=null;return sample=>{const eligible=sample.allowed&&sample.visible&&!sample.paused&&sample.now-sample.lastActivity<120000;const old=previous;previous={...sample,eligible};if(!eligible||!old?.eligible||old.kind!==sample.kind||sample.now-old.now>2500||sample.now<=old.now||Math.abs((sample.wall-old.wall)-(sample.now-old.now))>1500)return null;const start=Math.floor(old.wall/1000)*1000,end=Math.floor(sample.wall/1000)*1000;return end>start?{start,end,kind:sample.kind}:null;};}
 function monthCells(month){const [y,m]=month.split('-').map(Number),offset=(new Date(Date.UTC(y,m-1,1)).getUTCDay()+6)%7,count=new Date(Date.UTC(y,m,0)).getUTCDate();return [...Array(offset).fill(null),...Array.from({length:count},(_,i)=>month+'-'+String(i+1).padStart(2,'0'))];}
 root.RealDevStudyCore={level,tracker,monthCells};
})(globalThis);