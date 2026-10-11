export async function requestNarrative(payload: {evidence:{id:string}[];[key:string]:unknown},signal:AbortSignal,transport:typeof fetch=fetch):Promise<string>{
 const response=await transport('/api/companion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal});
 let data;try{data=await response.json();}catch{throw Error('The server returned an unreadable reply. Your saved narrative is safe.');}
 if(!response.ok){const retry=Math.min(3600,Math.max(1,Number(data.retryAfter)||Number(response.headers.get('Retry-After'))||60));throw Error(response.status===429?`The AI needs a breather. Try again after ${retry} seconds, or use the local reflection.`:'AI is unavailable. Your saved narrative and local reflection are safe.');}
 if(data.origin!=='provider'||typeof data.text!=='string'||!data.text.trim()||data.text.length>15000||!Array.isArray(data.citations)||data.citations.some((id:unknown)=>!payload.evidence.some(e=>e.id===id)))throw Error('The reply failed evidence checks. Nothing was accepted.');
 const inline=[...data.text.matchAll(/\[(E\d+)\]/g)].map(m=>m[1]);if(inline.some(id=>!data.citations.includes(id))||data.citations.some((id:string)=>!inline.includes(id)))throw Error('The reply contained inconsistent evidence references. Nothing was accepted.');
 return data.text;
}
