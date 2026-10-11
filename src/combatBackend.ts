import { CONTENT_VERSION, RUBRIC_VERSION } from './combatContent';
// Extension boundary only: never registered automatically and no server ships here.
// The narrative service cannot return transitions, scores or executable markup.
export type CoachRequest={requestId:string;revision:number;nodeId:string;actionId:string;visibleCues:string[];rationale:string;tone:'supportive'|'playful'};
export type CoachReply={requestId:string;revision:number;contentVersion:string;explanation:string;followUp:string;provenance:'AI narrative'};
export async function requestCombatCoach(request:CoachRequest,signal?:AbortSignal):Promise<CoachReply>{
 const timeout=AbortSignal.timeout(8000);
 const response=await fetch('/api/combat/coach',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({...request,rationale:request.rationale.slice(0,4000),contentVersion:CONTENT_VERSION,rubricVersion:RUBRIC_VERSION}),signal:signal?AbortSignal.any([timeout,signal]):timeout});
 if(!response.ok)throw new Error('Online coach unavailable. Keep using the local explanation.');
 const body=await response.text();if(body.length>16000)throw new Error('Coach response too large.');
 const d=JSON.parse(body);
 if(d.requestId!==request.requestId||d.revision!==request.revision||d.contentVersion!==CONTENT_VERSION||d.provenance!=='AI narrative'||typeof d.explanation!=='string'||typeof d.followUp!=='string'||Object.keys(d).some(k=>!['requestId','revision','contentVersion','explanation','followUp','provenance'].includes(k)))throw new Error('Invalid or stale coach response.');
 return {...d,explanation:d.explanation.slice(0,4000),followUp:d.followUp.slice(0,2000)};
}
