import {validTitles,localTitles,WORKSPACE_TITLES,type TitleSet} from './creativeState';
import { keys, judge } from './judgmentState';
import { teamAnalysis } from './teamAnalysis';
export const STORE='rivals-workshop.profiles.v3';
export const LEGACY_STORE='rivals-workshop.profiles.v2';
export type Profile={titles?:TitleSet;id:string;name:string;created:string;updated:string;consent:{team:boolean};original:(string|null)[];chapters:(string|null)[]};
export type Library={schema:'rivals-workshop.library';version:3;revision:number;profiles:Profile[];migrated:boolean};
export const empty=():Library=>({schema:'rivals-workshop.library',version:3,revision:0,profiles:[],migrated:false});
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
export function validateChapters(v:unknown):asserts v is (string|null)[]{
 if(!Array.isArray(v)||v.length!==6)throw Error('Expected six chapter snapshots. Chapter 7 is derived from these.');
 v.forEach((s,i)=>{if(s===null)return;if(typeof s!=='string'||s.length>300000)throw Error('Invalid chapter snapshot');const d=JSON.parse(s);if(!d||typeof d!=='object'||Array.isArray(d)||!(i===3?d.schemaVersion===1:i===2?[1,2].includes(d.version):d.version===1))throw Error(`Unsupported chapter ${i+1} version`);});
 v.forEach((s,i)=>{if(!s)return;const d=JSON.parse(s);const object=(x:unknown)=>!!x&&typeof x==='object'&&!Array.isArray(x);
 if(i===0&&(!object(d.roles)||!['vanguard','duelist','strategist'].every(r=>object(d.roles[r])&&Array.isArray(d.roles[r].picks)&&object(d.roles[r].answers))))throw Error('Invalid chapter 1 roles');
 if(i===1&&!Array.isArray(d.cases))throw Error('Invalid court cases');
 if(i===2&&(!Array.isArray(d.top)||!object(d.choices)))throw Error('Invalid mind answers');
 if(i===3&&!Array.isArray(d.runs))throw Error('Invalid combat runs');
 });
 if(judge(v).coverage.some(c=>c.warning))throw Error('Invalid chapter data');
}
export function validateLibrary(v:unknown):Library{
 const d=v as Library;
 if(!d||d.schema!=='rivals-workshop.library'||![2,3].includes(d.version)||typeof d.migrated!=='boolean'||!Array.isArray(d.profiles)||d.profiles.length>50)throw Error('Unsupported profile library; expected version 2 or 3, at most 50 profiles.');
 const ids=new Set<string>();
 for(const p of d.profiles){if(!p||typeof p.id!=='string'||!p.id||p.id.length>100||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||typeof p.created!=='string'||typeof p.updated!=='string'||!Number.isFinite(Date.parse(p.created))||!Number.isFinite(Date.parse(p.updated))||typeof p.consent?.team!=='boolean')throw Error('Invalid profile metadata');if(p.titles!==undefined&&!validTitles(p.titles))throw Error('Invalid creative titles');ids.add(p.id);validateChapters(p.original);validateChapters(p.chapters);}
 if(d.revision!==undefined&&(!Number.isSafeInteger(d.revision)||d.revision<0))throw Error('Invalid vault revision');
 return {...clone(d),version:3,revision:d.revision??0};
}
export function snapshot(storage:Storage){return keys.map(k=>storage.getItem(k));}
export function createProfile(name:string,chapters:(string|null)[]):Profile{validateChapters(chapters);if(!name.trim()||name.trim().length>80)throw Error('Use a name of 1–80 characters.');const now=new Date().toISOString();let titles=localTitles(chapters);try{const v=JSON.parse(localStorage.getItem(WORKSPACE_TITLES)||'null');if(validTitles(v))titles=v;}catch{}return {id:crypto.randomUUID(),name:name.trim(),created:now,updated:now,consent:{team:false},original:clone(chapters),chapters:clone(chapters),titles};}
export function saveLibrary(storage:Storage,l:Library){const clean=validateLibrary(l),raw=storage.getItem(STORE);if(raw){const current=validateLibrary(JSON.parse(raw));if(current.revision!==clean.revision)throw Error('Player Vault changed in another tab. Reopen the vault before saving; no data was overwritten.');}const next={...clean,revision:clean.revision+1},encoded=JSON.stringify(next);if(encoded.length>16000000)throw Error('Vault exceeds 16 MB. Export and remove unused profiles.');if(raw)storage.setItem(STORE+'.backup',raw);storage.setItem(STORE,encoded);return next;}
export function readLibrary(storage:Storage):Library{const raw=storage.getItem(STORE);if(raw)return validateLibrary(JSON.parse(raw));const legacy=storage.getItem(LEGACY_STORE);if(legacy){const l=validateLibrary(JSON.parse(legacy));l.migrated=true;return saveLibrary(storage,l);}const l=empty();const chapters=snapshot(storage);if(chapters.some(Boolean))l.profiles.push(createProfile(storage.getItem('rivals-workshop.nickname')||'Imported local player',chapters));l.migrated=true;return saveLibrary(storage,l);}
export function importLibrary(raw:string):Library{if(raw.length>16000000)throw Error('Import exceeds 16 MB.');const l=validateLibrary(JSON.parse(raw));l.profiles=l.profiles.map(p=>({...p,id:crypto.randomUUID(),consent:{team:false}}));return l;}
export function restore(storage:Storage,p:Profile){validateChapters(p.chapters);const old=snapshot(storage),name=storage.getItem('rivals-workshop.nickname'),oldTitles=storage.getItem(WORKSPACE_TITLES);storage.setItem('rivals-workshop.restore-backup.v1',JSON.stringify({chapters:old,name,titles:oldTitles}));try{keys.forEach((k,i)=>p.chapters[i]===null?storage.removeItem(k):storage.setItem(k,p.chapters[i]!));storage.setItem('rivals-workshop.nickname',p.name);if(p.titles)storage.setItem(WORKSPACE_TITLES,JSON.stringify(p.titles));else storage.removeItem(WORKSPACE_TITLES);}catch(e){try{keys.forEach((k,i)=>old[i]===null?storage.removeItem(k):storage.setItem(k,old[i]!));if(oldTitles!==null)storage.setItem(WORKSPACE_TITLES,oldTitles);else storage.removeItem(WORKSPACE_TITLES);if(name!==null)storage.setItem('rivals-workshop.nickname',name);else storage.removeItem('rivals-workshop.nickname');}catch{throw Error('Restore interrupted. Your pre-load workspace is preserved in rivals-workshop.restore-backup.v1; export browser data before retrying.');}throw e;}}
export function evidence(p:Profile,chapters:number[]){return judge(p.chapters).sources.filter(s=>chapters.includes(s.chapter)).map((s,i)=>({...s,id:`E${i+1}`}));}
export function compareHabits(profiles:Profile[]){return profiles.flatMap((a,i)=>profiles.slice(i+1).flatMap(b=>{
 const left=judge(a.chapters).social,right=judge(b.chapters).social;
 return left.flatMap(h=>{const other=right.find(x=>x.title===h.title);if(!other)return [];return [{players:[a.name,b.name],scenario:h.title,shared:h.tendency===other.tendency,explanation:h.tendency===other.tendency?`Both selected ${h.tendency.toLowerCase()}. This supplies a shared default: ${h.strength} The same blind spot may compound: ${h.friction}`:`${a.name} selected ${h.tendency.toLowerCase()}; ${b.name} selected ${other.tendency.toLowerCase()}. They may complement each other if they agree when to switch approaches. Their competing costs are: ${h.friction} / ${other.friction}`,experiment:`Compare priorities before queuing. ${h.context} ${other.context}`,source:'Chapter 5 selected responses; see member receipts.'}];});
 }));}
export const chemistry=teamAnalysis;

