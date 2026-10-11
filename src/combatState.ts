import { decodeMind, diagnosis, provisional } from './mindState';
import { CONTENT_VERSION, RUBRIC_VERSION, nodeList } from './combatContent';
import { replay } from './combatEngine';
import type { Decision } from './combatEngine';
import type { Discipline, Mind } from './mindState';

export const COMBAT_KEY='rivals-workshop.chapter4.v1';
export type Run={id:string;seed:number;kind:'first'|'rehearsal';parentId:string|null;forkAt:number;briefing:Mind;hasBriefing:boolean;role:string;events:Decision[]};
export type CombatSave={schemaVersion:1;contentVersion:string;rubricVersion:string;revision:number;writer:string;stage:number;tone:'supportive'|'playful';active:number;runs:Run[];draft:{nodeId:string;actionId:string;cue:string;rationale:string};finished:boolean;drafts?:Record<string,CombatSave['draft']>;pendingResults?:Record<string,boolean>};
export function blankCombat():CombatSave{return {schemaVersion:1,contentVersion:CONTENT_VERSION,rubricVersion:RUBRIC_VERSION,revision:0,writer:'',stage:0,tone:'playful',active:0,runs:[],draft:{nodeId:'',actionId:'',cue:'',rationale:''},finished:false};}
function validBriefing(raw:string|null){try{const d=JSON.parse(raw||'null');return d?.version===1||d?.version===2;}catch{return false;}}
export function createRun(mindRaw:string|null,role:string,seed:number,id:string,kind:Run['kind']='first'):Run{return {id,seed,kind,parentId:null,forkAt:0,briefing:decodeMind(mindRaw),hasBriefing:validBriefing(mindRaw),role,events:[]};}
export function focusDossier(run:Run):Discipline[]{
 if(!run.hasBriefing)return [];
 const rows=diagnosis(run.briefing);
 return [...new Set([run.briefing.top.find(Boolean),rows.find(r=>r.tension)?.id,run.briefing.weakest||rows.find(r=>r.signal==='Practice opportunity')?.id||rows.find(r=>r.signal==='Unobserved')?.id].filter((v):v is Discipline=>!!v))];
}
export function dossier(run:Run){return {profile:provisional(run.briefing),rows:diagnosis(run.briefing),focus:focusDossier(run)};}
const text=(v:unknown,max=4000)=>typeof v==='string'?v.slice(0,max):'';
export function decodeCombat(raw:string|null):CombatSave {
 if(!raw)return blankCombat();
 if(raw.length>2_000_000)throw new Error('Backup exceeds the 2 MB limit.');
 let data;try{data=JSON.parse(raw);}catch{throw new Error('Backup is not valid JSON.');}
 if(data?.schemaVersion!==1)throw new Error('Unsupported save schema. Your original data is preserved.');
 if(data.contentVersion!==CONTENT_VERSION||data.rubricVersion!==RUBRIC_VERSION)throw new Error('This run uses different encounter content. Keep the backup and open it with its matching app version.');
 if(!Array.isArray(data.runs)||data.runs.length>12)throw new Error('Invalid run list (maximum 12).');
 const clean=blankCombat();
 clean.runs=data.runs.map((r:Run)=>{
  if(!r||typeof r.id!=='string'||!Number.isInteger(r.seed)||r.seed<0||r.seed>1_000_000||!['first','rehearsal'].includes(r.kind)||!Array.isArray(r.events)||r.events.length>nodeList.length)throw new Error('Invalid run.');
  const events=r.events.map((e:Decision)=>{
   if(!e||typeof e.nodeId!=='string'||typeof e.actionId!=='string'||typeof e.cue!=='string'||typeof e.rationale!=='string'||typeof e.at!=='string')throw new Error('Invalid decision record.');
   return {nodeId:text(e.nodeId,80),actionId:text(e.actionId,80),cue:text(e.cue,300),rationale:text(e.rationale),at:text(e.at,40)};
  });
  replay(events,r.seed); // Validate order, legal actions, visible cues and resource use.
  if(r.kind==='rehearsal'&&(!Number.isInteger(r.forkAt)||r.forkAt<0||r.forkAt>events.length))throw new Error('Invalid rehearsal boundary.');
  return {id:text(r.id,100),seed:r.seed,kind:r.kind,parentId:r.kind==='rehearsal'?text(r.parentId,100):null,forkAt:r.kind==='rehearsal'?r.forkAt:0,briefing:decodeMind(JSON.stringify(r.briefing)),hasBriefing:r.hasBriefing===true,role:text(r.role,100),events};
 });
 if(new Set(clean.runs.map(r=>r.id)).size!==clean.runs.length)throw new Error('Duplicate run identifiers.');
 clean.active=Number.isInteger(data.active)&&data.active>=0&&data.active<clean.runs.length?data.active:0;
 clean.stage=Number.isInteger(data.stage)&&data.stage>=0&&data.stage<6?data.stage:0;
 clean.tone=data.tone==='supportive'?'supportive':'playful';
 clean.revision=Number.isSafeInteger(data.revision)&&data.revision>=0?data.revision:0;
 clean.writer=text(data.writer,100);
 const run=clean.runs[clean.active],next=run&&nodeList[run.events.length]?.node;
 if(next&&data.draft?.nodeId===next.id)clean.draft={nodeId:next.id,actionId:next.options.some(o=>o.id===data.draft.actionId)?data.draft.actionId:'',cue:next.cues.includes(data.draft.cue)?data.draft.cue:'',rationale:text(data.draft.rationale)};
 clean.drafts={};clean.pendingResults={};
 for(const r of clean.runs){
  const n=nodeList[r.events.length]?.node,d=data.drafts?.[r.id];
  if(n&&d?.nodeId===n.id)clean.drafts[r.id]={nodeId:n.id,actionId:n.options.some(o=>o.id===d.actionId)?d.actionId:'',cue:n.cues.includes(d.cue)?d.cue:'',rationale:text(d.rationale)};
  if(r.events.length&&data.pendingResults?.[r.id]===true)clean.pendingResults[r.id]=true;
 }
 if(run&&clean.draft.nodeId)clean.drafts[run.id]=clean.draft;
 else if(run&&clean.drafts[run.id])clean.draft=clean.drafts[run.id];
 clean.finished=!!run&&run.events.length===nodeList.length&&data.finished===true;
 return clean;
}
export function encounterStage(index:number){return index<9?2:index<15?3:4;}
export function commit(s:CombatSave,event:Decision):CombatSave {
 const run=s.runs[s.active];
 if(!run||run.events.length>=nodeList.length||event.nodeId!==nodeList[run.events.length].node.id)return s;
 if(event.actionId!=='skip'&&!event.cue)return s;
 replay([...run.events,event],run.seed);
 const updated={...run,events:[...run.events,event]};
 return {...s,runs:s.runs.map((r,i)=>i===s.active?updated:r),draft:blankCombat().draft,drafts:{...s.drafts,[run.id]:blankCombat().draft},pendingResults:{...s.pendingResults,[run.id]:true},stage:updated.events.length===nodeList.length?5:encounterStage(updated.events.length),finished:updated.events.length===nodeList.length};
}
export function forkRun(s:CombatSave,eventIndex:number,id:string):CombatSave {
 const parent=s.runs[s.active];
 if(!parent||s.runs.length>=12||!Number.isInteger(eventIndex)||eventIndex<0||eventIndex>=parent.events.length)return s;
 const run:Run={...parent,id,kind:'rehearsal',parentId:parent.id,forkAt:eventIndex,events:parent.events.slice(0,eventIndex)};
 return {...s,runs:[...s.runs,run],active:s.runs.length,stage:encounterStage(eventIndex),draft:blankCombat().draft,finished:false};
}

export function rememberDraft(s:CombatSave):CombatSave {const r=s.runs[s.active];return r?{...s,drafts:{...s.drafts,[r.id]:s.draft}}:s;}
export function selectRun(s:CombatSave,active:number):CombatSave {
 if(!s.runs[active])return s;const kept=rememberDraft(s);
 return {...kept,active,stage:0,draft:kept.drafts?.[s.runs[active].id]||blankCombat().draft,finished:s.runs[active].events.length===nodeList.length};
}
export function mergeBackup(s:CombatSave,imported:CombatSave):CombatSave {
 const kept=rememberDraft(s),incoming=rememberDraft(imported);
 const additions=incoming.runs.filter(r=>!kept.runs.some(old=>old.id===r.id));
 if(kept.runs.length+additions.length>12)throw new Error('Combined backup would exceed 12 runs.');
 if(!additions.length)throw new Error('No new run IDs found. Existing histories and drafts are unchanged.');
 const drafts={...kept.drafts},pendingResults={...kept.pendingResults};
 for(const r of additions){if(incoming.drafts?.[r.id])drafts[r.id]=incoming.drafts[r.id];if(incoming.pendingResults?.[r.id])pendingResults[r.id]=true;}
 const desired=incoming.runs[incoming.active]?.id;const active=kept.runs.length+Math.max(0,additions.findIndex(r=>r.id===desired));
 const runs=[...kept.runs,...additions];return {...kept,runs,active,stage:0,drafts,pendingResults,draft:drafts[runs[active].id]||blankCombat().draft,finished:runs[active].events.length===nodeList.length};
}
export function newEvidence(run:Run,receipts:ReturnType<typeof replay>['receipts']){return run.kind==='rehearsal'?receipts.slice(run.forkAt):receipts;}
export function savingPaused(blocked:boolean,conflict:string|null){return blocked||conflict!==null;}
