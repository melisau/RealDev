export async function verifyFirebaseSession(token,env){
 if(typeof token!=='string'||token.length<20||token.length>12000)throw Error('invalid_token');
 const projectId=env.FIREBASE_PROJECT_ID;
 if(typeof projectId!=='string'||!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId))throw Error('invalid_project_id');
 const apiKey=env.FIREBASE_API_KEY;
 if(typeof apiKey!=='string'||!/^[A-Za-z0-9_-]{20,}$/.test(apiKey))throw Error('invalid_api_key');
 let response;
 try{response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'content-type':'application/json',Accept:'application/json'},body:JSON.stringify({idToken:token}),redirect:'manual',signal:AbortSignal.timeout(5000)});}catch{throw Error('auth_provider_unavailable');}
 if(!response.ok)throw Error('invalid_token');
 const reader=response.body?.getReader();let bytes=0,text='';
 if(reader){const decoder=new TextDecoder();while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>16000){await reader.cancel();throw Error('auth_response_too_large');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}else text=JSON.stringify(await response.json());
 let result;try{result=JSON.parse(text);}catch{throw Error('invalid_auth_response');}
 const user=result?.users?.[0];
 if(!user||typeof user.localId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(user.localId))throw Error('invalid_auth_response');
 if(user.emailVerified!==true)throw Error('email_not_verified');
 return {id:'firebase:'+projectId+':'+user.localId,email:typeof user.email==='string'?user.email.slice(0,320):''};
}
