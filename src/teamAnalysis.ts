import {decodeSave, roles, heroes} from './chapterState';
import {judge} from './judgmentState';
import {compareHabits, type Profile} from './profileStore';

export function roleDeclarations(p:Profile){
 const one=decodeSave(p.chapters[0]);
 return roles.map(role=>{
  const entry=one.roles[role], skipped=one.skipped.includes(`${role}-picks`);
  const status=skipped?'skipped':entry.decision==='none'?'not-played':entry.decision==='play'&&entry.picks.length?'declared':'unanswered';
  return {role,status,heroes:status==='declared'?entry.picks.map(id=>heroes.find(h=>h.id===id)?.name||id):[],path:`roles.${role}`,preferred:!one.skipped.includes('identity')&&one.preferred===role};
 });
}
export function teamAnalysis(profiles:Profile[]){
 if(profiles.length<2||profiles.length>6||new Set(profiles.map(p=>p.id)).size!==profiles.length||profiles.some(p=>!p.consent.team))throw Error('Choose 2–6 distinct consenting profiles.');
 const members=profiles.map(p=>{const j=judge(p.chapters);return {name:p.name,roles:roleDeclarations(p),coverage:j.coverage,habits:j.social,challenge:j.challenge,contradiction:j.contradiction,receipts:j.sources.filter(s=>[1,3,4,5].includes(s.chapter)),archetype:j.primary?.name||'Unwritten Flame'};});
 const coverage=roles.map(role=>({role,players:members.filter(m=>m.roles.some(r=>r.role===role&&r.status==='declared')).map(m=>m.name),declarations:members.map(m=>({player:m.name,...m.roles.find(r=>r.role===role)!}))}));
 const comparisons=compareHabits(profiles);
 const missing=coverage.filter(c=>!c.players.length).map(c=>c.role);
 const crowded=coverage.filter(c=>c.players.length>1).map(c=>c.role);
 const fingerprints=members.map(m=>[m.name,m.archetype,...m.habits.map(h=>h.tendency),...m.roles.flatMap(r=>r.heroes)].join('|')).sort().join('|');
 let hash=2166136261;for(const char of fingerprints)hash=Math.imul(hash^char.charCodeAt(0),16777619)>>>0;
 const adjectives=['Cosmic','Caffeinated','Velvet','Emergency','Suspicious','Glorious','Pocket','Chaotic'];
 const mascots=['Flamingos','Waffles','Comets','Gremlins','Raccoons','Disco Knights','Moon Ducks','Toast Patrol'];
 const shared=comparisons.filter(c=>c.shared).length,different=comparisons.length-shared;
 const names=[`The ${adjectives[hash%8]} ${mascots[(hash>>>3)%8]}`,`${profiles.length} Flames and ${missing.length?'a Role Wanted Ad':'a Full Toolbox'}`,`${different>shared?'The Mixed Signals':'The Shared Cue'} Committee`];
 const roleAnalysis=[missing.length?`No included Chapter 1 main declares ${missing.join(', ')}. Ask for volunteers or complete those role sections; preference alone is not coverage.`:'Every role has at least one included declared main. This is self-report, not a guaranteed team composition.',crowded.length?`Multiple players declare ${crowded.join(', ')}. Agree who fills each slot before queuing; overlapping mains offer options but do not establish synergy.`:'No duplicated declared role pool. Check willingness before assigning a role.'];
 const coordination=[...roleAnalysis,comparisons.length?`${shared} shared and ${different} differing responses across matching Chapter 5 scenarios. Use the pair receipts below to agree a start cue, exit cue and repair phrase.`:'There are no matching answered Chapter 5 scenarios. Complete three together before drawing a habit comparison.'];
 return {schema:'rivals-workshop.team',version:2,created:new Date().toISOString(),names,nameBasis:'Deterministic playful names from member names, included mains, archetypes, group size and shared/differing authored scenario choices.',coverage,members,comparisons,coordination,why:'Role options come from included Chapter 1 selections. Synergy and friction are conditional interpretations of matching Chapter 5 authored responses; the receipts remain attached. No hero combo, damage bonus or live patch claim is inferred.',challenges:comparisons.length?comparisons.slice(0,3).map(c=>`${c.players.join(' + ')} / ${c.scenario}: ${c.experiment}`):['Each player answers the same three Chapter 5 scenarios; agree one start cue and one exit cue.'],limitations:'Authored reflection on self-report and scenarios. No predictive accuracy or observed gameplay claims.'};
}
