// Optional same-origin transport for a future backend. No credentials belong here.
// Server must authenticate, rate-limit, cap input, retrieve allowed sources, and
// treat proposals and retrieved text as untrusted data rather than instructions.
import type { Case } from './courtState';
import type { Evidence } from './courtAI';
export type CourtRequest = { case:Case; round:0|1|2; tone:'friendly'|'fair'|'petty' };
export type CourtResponse = { objection:string; prompt:string; evidence:Evidence[]; modelLabel:string };
export async function requestCourtAI(request:CourtRequest, signal?:AbortSignal):Promise<CourtResponse> {
 const response=await fetch('/api/court/objection',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal});
 if(!response.ok) throw new Error('Court service unavailable; use the explicit offline adapter.');
 const data=await response.json();
 if(typeof data.objection!=='string'||typeof data.prompt!=='string'||typeof data.modelLabel!=='string'||!Array.isArray(data.evidence))throw new Error('Invalid court response');
 const evidence:Evidence[]=data.evidence.filter((e:Evidence)=>e&&['official','community'].includes(e.category)&&typeof e.title==='string'&&typeof e.excerpt==='string'&&typeof e.retrievedAt==='string'&&typeof e.url==='string'&&e.url.startsWith('https://'));
 return {objection:data.objection.slice(0,4000),prompt:data.prompt.slice(0,4000),modelLabel:data.modelLabel.slice(0,100),evidence:evidence.slice(0,12)};
}
