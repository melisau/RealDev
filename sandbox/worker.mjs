import {execute} from './runtime.mjs';
self.onmessage=async event=>{const {id,code,taskId}=event.data||{};try{self.postMessage({id,result:await execute(code,taskId)});}catch{self.postMessage({id,result:{error:'sandbox_unavailable',logs:[],cases:[]}});}};
