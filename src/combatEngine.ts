import { disciplines } from './mindState';
import { nodeList } from './combatContent';
import type { Battle, Mark, Node } from './combatContent';

export const initialBattle=():Battle=>({space:2,readiness:2,reserve:1,tempo:2,exposed:false});
export type Decision = { nodeId:string; actionId:string; cue:string; rationale:string; at:string };
export type Receipt = Decision & { encounterId:string; before:Battle; after:Battle; marks:Mark[]; consequence:string; counterfactual:string; ending:string|null };
const clamp=(n:number)=>Math.max(0,Math.min(4,n));
export function digest(s:Battle){return `${s.space}:${s.readiness}:${s.reserve}:${s.tempo}:${s.exposed?1:0}`;}
export function adjustedNode(index:number,battle:Battle):Node {
 const source=nodeList[index].node;
 const branch=source.id==='flank-contact'?(battle.exposed?'Your deep search left you outside healing sightline: returning costs an extra exchange.':'You are close enough to respond from the prepared or forward corner.')
  :source.id==='angle-diver'?(battle.exposed?'You are on the isolated far platform. The lower walking route is the only supported connection; returning concedes the platform.':'You remain connected. Your near/main cover route can support the threatened ally immediately.')
  :source.id==='calls-contest'?(battle.reserve===0?'The defensive reserve has been spent. Your re-entry must use cover and an acknowledged handoff.':'The reserve is still available. Keep it for the contact holder if the covered re-entry is pressured.')
  :source.id==='overtime-final'?(battle.readiness<2?'Prior trades depleted squad readiness. The nearest ally can only follow briefly; keep the target reachable from contact.':'Your prior handoffs preserved readiness. The nearest ally confirms a short follow-up window.')
  :'';
 const options=source.options.map(o=>{
  if(source.id==='rent-finish'&&o.id==='conditional')return {...o,effect:battle.readiness>=2?{space:1,tempo:1,exposed:false}:{readiness:1,tempo:-1,exposed:false},consequence:battle.readiness>=2?'Your squad is ready. The grouped push converts the checkpoint approach into progress.':'Your squad is depleted. You reconnect at cover, gaining readiness at a tempo cost.'};
  if(source.id==='rent-finish'&&o.id==='reset'&&battle.readiness<2)return {...o,marks:o.marks.map(m=>({...m,value:2 as const,reason:'The displayed depleted readiness makes a covered reset appropriate while the objective still permits it.'}))};
  if(source.id==='flank-contact'&&o.id==='peel'&&battle.exposed)return {...o,effect:{...o.effect,tempo:-1},consequence:'You return from the deep search through cover, spending an extra exchange and the reserve to save the support. The enemy takes the forward corner.'};
  if(source.id==='angle-diver'&&o.id==='reconnect'&&battle.exposed)return {...o,effect:{...o.effect,space:-2,tempo:-1},consequence:'You abandon the far platform and take the lower walking route. Your earlier elimination remains, but reconnecting costs the full angle and an extra exchange.'};
  return o;
 });
 // Rotate presentation without changing stable choice IDs or rubric meaning.
 const rotation=index%options.length;
 return {...source,brief:source.brief+(branch?' '+branch:''),options:[...options.slice(rotation),...options.slice(0,rotation)]};
}
export function applyDecision(index:number,battle:Battle,decision:Decision,seed:number):Receipt {
 const row=nodeList[index];
 if(!row||decision.nodeId!==row.node.id)throw new Error('Decision is not at the current node.');
 const node=adjustedNode(index,battle), option=node.options.find(o=>o.id===decision.actionId);
 if(!option&&decision.actionId!=='skip')throw new Error('Unknown action.');
 if(decision.cue&&!node.cues.includes(decision.cue))throw new Error('Unknown visible cue.');
 if(option?.effect.reserve&&battle.reserve+option.effect.reserve<0)throw new Error('Unavailable reserve.');
 const delta=option?.effect||{};
 const after:Battle={space:clamp(battle.space+(delta.space||0)),readiness:clamp(battle.readiness+(delta.readiness||0)),reserve:Math.max(0,Math.min(1,battle.reserve+(delta.reserve||0))),tempo:clamp(battle.tempo+(delta.tempo||0)),exposed:delta.exposed??battle.exposed};
 const ending=row.nodeIndex===row.encounter.nodes.length-1?resolveEnding(after,row.encounterIndex,seed):null;
 return {...decision,encounterId:row.encounter.id,before:{...battle},after,marks:option?.marks||[],consequence:option?.consequence||'Decision skipped. No tactical observation is scored; the situation remains unresolved.',counterfactual:option?.counterfactual||'Rehearse this decision later to explore the alternatives.',ending};
}
export function resolveEnding(s:Battle,encounter:number,seed:number){
 if(s.readiness>=3&&!s.exposed&&s.space>=2){
  if((seed+encounter)%3===0)return 'Sound plan, failed execution: an allied defensive attempt misses during the final exchange. The squad loses ground despite a supported decision. Your rubric is unchanged.';
  return s.reserve===0?'Success at a cost: the squad converts its opening but has spent its defensive reserve. Continuing this encounter would carry a resource bill; the next independent encounter resets resources.':'Supported success: the squad converts useful space while retaining a defensive option. This is one authored outcome, not a prediction.';
 }
 if(s.exposed&&s.space>=3)return 'Costly trade: your pressure produces an elimination, but isolation removes you from the follow-up. A highlight does not settle the objective.';
 if(s.readiness>=2&&!s.exposed)return 'Justified reset / partial success: the squad survives and preserves a feasible next attempt, conceding tempo or forward space.';
 return 'Recoverable failure: fragmented readiness or exposure prevents conversion. Regroup and identify the cue you can change; the next encounter starts a fresh situation.';
}
export function replay(events:Decision[],seed:number){
 let battle=initialBattle();const receipts:Receipt[]=[];let encounterSkipped=false;
 events.forEach((event,index)=>{
  if(index>=nodeList.length)throw new Error('Too many decisions.');
  if(nodeList[index].nodeIndex===0){battle=initialBattle();encounterSkipped=false;}
  const receipt=applyDecision(index,battle,event,seed);encounterSkipped ||= event.actionId==='skip';if(receipt.ending&&encounterSkipped)receipt.ending='Incomplete encounter: a decision was skipped. No complete tactical outcome is inferred; answered decisions retain their individual rubric marks.';receipts.push(receipt);battle=receipt.after;
 });
 if(events.length<nodeList.length&&nodeList[events.length].nodeIndex===0)battle=initialBattle();
 return {battle,receipts,index:events.length};
}
export function score(receipts:Receipt[]){return disciplines.map(([id,name])=>{
 const entries=receipts.flatMap(r=>r.marks.filter(m=>m.category===id).map(m=>({m,r})));
 const weight=entries.reduce((n,e)=>n+e.m.weight,0);
 const index=weight?Math.round(100*entries.reduce((n,e)=>n+e.m.value*e.m.weight,0)/(2*weight)):null;
 const encounterCount=new Set(entries.map(e=>e.r.encounterId)).size;
 const sufficient=entries.length>=3&&encounterCount>=2;
 return {id,name,index,opportunities:entries.length,encounterCount,sufficient,signal:index===null?'Unobserved':!sufficient?'Limited evidence':index>=75?'Consistent practice signal':index>=40?'Context-dependent signal':'Practice opportunity',entries};
});}
