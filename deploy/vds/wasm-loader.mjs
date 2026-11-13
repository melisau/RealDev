// Workers import a .wasm file as a compiled WebAssembly.Module. Node's own wasm import instantiates the module instead,
// so this hook gives the bundle the same Module the Worker runtime would (used for the precompiled QuickJS runner).
export async function load(url,context,next){
 if(url.startsWith('file:')&&url.endsWith('.wasm'))return {format:'module',shortCircuit:true,source:`import {readFileSync} from 'node:fs';export default new WebAssembly.Module(readFileSync(new URL(${JSON.stringify(url)})));`};
 return next(url,context);
}
