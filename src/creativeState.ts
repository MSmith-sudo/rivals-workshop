import {judge} from './judgmentState';
export const WORKSPACE_TITLES='rivals-workshop.creative-titles.v1';
export const titleKinds=['archetype','secondary','social','team'] as const;
export type TitleKind=typeof titleKinds[number];
export type TitleSet={items:Record<TitleKind,{title:string;explanation:string}>;origin:'ai'|'local'|'edited';fingerprint:string;receipts:{id:string;chapter:number;path:string;label:string;text:string}[]};
export function fingerprint(v:unknown){const s=JSON.stringify(v);let n=2166136261;for(let i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return (n>>>0).toString(16);}
export function validTitles(v:unknown):v is TitleSet{const t=v as TitleSet;return !!t&&['ai','local','edited'].includes(t.origin)&&typeof t.fingerprint==='string'&&t.fingerprint.length<100&&titleKinds.every(k=>typeof t.items?.[k]?.title==='string'&&t.items[k].title.length>0&&t.items[k].title.length<=80&&typeof t.items[k].explanation==='string'&&t.items[k].explanation.length<=600)&&Array.isArray(t.receipts)&&t.receipts.length<=200&&t.receipts.every(e=>/^E[1-9]\d*$/.test(e.id)&&Number.isInteger(e.chapter)&&e.chapter>=1&&e.chapter<=6&&['path','label','text'].every(k=>typeof e[k as 'text']==='string'&&e[k as 'text'].length<=12000));}
export function localTitles(chapters:(string|null)[]):TitleSet{
 const j=judge(chapters),fp=fingerprint({sources:j.sources,signals:j.signals});
 const names=['Lantern','Compass','Beacon','Circuit','Constellation','Signal','Cadence','Spark'];
 const modifiers=['Patient','Watchful','Restless','Resolute','Curious','Steady','Resourceful','Thoughtful'];
 const seed=parseInt(fp,16),motif=names[seed%names.length],voice=modifiers[(seed>>>4)%modifiers.length];
 const supported=j.sources.length>0;
 return {origin:'local',fingerprint:fp,receipts:[],items:{archetype:{title:j.primary?voice+' '+motif+' · '+j.primary.name.replace(/^The /,''):'The Unwritten Flame',explanation:j.primary?'Creative local variation anchored to the deterministic identity: '+j.primary.name+'. '+j.primary.story:'Not enough independent scored evidence to name an identity.'},secondary:{title:j.secondary?j.secondary.name+' / '+motif:'A Spark Still Forming',explanation:j.secondary?j.secondary.story:'Sparse secondary evidence remains unknown.'},social:{title:j.social[0]?voice+' '+motif+' / '+j.social[0].tendency.slice(0,40):'The Open Seat',explanation:j.social[0]?j.social[0].strength+' Potential friction: '+j.social[0].friction:'No included social answer yet.'},team:{title:supported?'The '+voice+' '+motif+' Ensemble':'The Workshop Ensemble',explanation:'A reproducible creative motif from the included answer fingerprint; not a scored team assessment or gameplay claim.'}}};
}
