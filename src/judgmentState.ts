import {decodeSave, KEY, heroes, roles, stepsFor, answered} from './chapterState';
import {decodeCourt, COURT_KEY} from './courtState';
import {decodeMind, MIND_KEY, disciplines, scenarios as mindScenarios} from './mindState';
import {decodeCombat, COMBAT_KEY} from './combatState';
import {replay, score} from './combatEngine';
import {nodeList} from './combatContent';
import {decodeSocial, SOCIAL_KEY, scenarios as socialScenarios, evidence as socialEvidence} from './socialState';
import {decodeMusic, safeLink, MUSIC_KEY, stages as musicStages} from './musicState';

export const RULES='judgment-1';
export const keys=[KEY,COURT_KEY,MIND_KEY,COMBAT_KEY,SOCIAL_KEY,MUSIC_KEY];
export type Source={chapter:number;path:string;label:string;text:string};
export type Signal={id:string;chapter:number;path:string;label:string;value:number};
export type Coverage={chapter:number;status:string;included:number;skipped:number;total:number;warning:string};
export type Archetype={id:string;name:string;story:string;cost:string;challenge:string;weights:Record<string,number>};
export const archetypes:Archetype[]=[
 {id:'kill',name:'The Kill-Seeker',story:'You answer the opening before the orchestra finishes its first note. Your selected risks put initiative in the spotlight.',cost:'A spectacular entry can leave nobody able to convert it.',challenge:'For three fights, name your exit and one ally’s readiness cue before committing. Count supported entries, not eliminations.',weights:{initiative:3,duelist:1,spectacle:1}},
 {id:'savior',name:'The Stalwart Savior',story:'When the scene falls apart, you look for the person who can still be brought home.',cost:'Rescue can consume the tools needed for the next threat.',challenge:'For three fights, confirm whether a rescue has cover and a reachable ally before spending your escape. Review one rescue you declined.',weights:{support:3,teamwork:2,strategist:1}},
 {id:'hope',name:'The False Hope',story:'Your claimed strength outruns the current scenario receipts. This is a repairable expectation gap, not a verdict on your worth.',cost:'Confidence without a checked cue can become a plan the squad cannot follow.',challenge:'Replay the lowest supported claimed discipline. Write one visible cue that would change your choice, then test it over three fights.',weights:{claimGap:4}},
 {id:'lord',name:'The Unsung Lord',story:'You build the conditions for the win while somebody else gets the trailer shot.',cost:'Quiet value can become invisible coordination if nobody knows your plan.',challenge:'For three fights, pair your objective decision with one short handoff ping. Track whether someone acknowledges it.',weights:{objective:2,resources:2,quiet:3}},
 {id:'anchor',name:'The Iron Anchor',story:'Your selected decisions favor space, cover and a line the team can return to.',cost:'Holding ground can become holding a position past its usefulness.',challenge:'Before three engagements, identify both useful cover and a retreat destination. Move when either stops serving the objective.',weights:{positioning:2,resources:1,vanguard:2}},
 {id:'conductor',name:'The Squad Conductor',story:'You turn separate intentions into a timing cue the squad can use.',cost:'Too many instructions can crowd out the one call that matters.',challenge:'Use one target, one timing cue and one readiness check for three engagements. Ask whether the call was usable.',weights:{leadership:3,teamwork:2}},
 {id:'architect',name:'The Patient Architect',story:'You prefer to understand the opening and prepare the ground before spending the team’s resources.',cost:'Preparation can run past the moment when action is needed.',challenge:'Set a decision deadline before three fights. State the missing cue, then act on the best available information at the deadline.',weights:{analytical:2,proactive:2,verification:1}},
 {id:'shifter',name:'The Shape-Shifter',story:'You let a changing problem change your approach instead of making every fight defend yesterday’s plan.',cost:'Changing too quickly can prevent you learning which adjustment worked.',challenge:'Try one named adjustment for two fights before changing another variable. Record the cue that justified the change.',weights:{adaptation:2,flexibility:3}},
 {id:'oath',name:'The Oathbound Main',story:'A familiar hero is part of the story you want to keep telling.',cost:'Loyalty needs a measurable job when the matchup pushes back.',challenge:'Name the specific job your main will do next fight and one failure cue that would justify changing the plan.',weights:{loyalty:3,mastery:1}},
 {id:'spark',name:'The Spotlight Spark',story:'You choose your heroes for the big moment and give the scene a memorable silhouette.',cost:'Aesthetic excitement does not tell us whether a play creates value.',challenge:'After three fights, separate the moment you enjoyed from the objective value it created. Look for one where they differed.',weights:{spectacle:3,duelist:1}},
 {id:'diplomat',name:'The Reset Diplomat',story:'Your selected squad responses make room to repair the process and start the next fight with less baggage.',cost:'Smoothing tension can postpone a necessary direct conversation.',challenge:'After one tense fight, own one controllable action and agree one concrete repair. Check later whether the agreement happened.',weights:{accountability:3,reset:2}},
 {id:'sentinel',name:'The Boundary Sentinel',story:'You protect attention and make the terms of participation visible.',cost:'Distance protects your energy but can leave coordination unfinished.',challenge:'Choose one clear boundary phrase and one fallback communication channel before your next session. Review whether both helped.',weights:{boundaries:3,quiet:1}},
];

// Read-only adapters: never replace, migrate, or write any Chapter 1–6 key.
export function judge(raw:(string|null)[]){
 const warnings=Array(6).fill('') as string[];
 const decode=<T,>(i:number,fn:(s:string|null)=>T,validate:(d:any)=>boolean):T=>{
  try{if(raw[i]&&!validate(JSON.parse(raw[i]!)))throw Error('Unsupported schema');return fn(raw[i]||null);}
  catch{warnings[i]='Unreadable or unsupported save excluded. Original data remains untouched.';return fn(null);}
 };
 const one=decode(0,decodeSave,d=>d?.version===1);
 const court=decode(1,decodeCourt,d=>d?.version===1&&Array.isArray(d.cases));
 const mind=decode(2,decodeMind,d=>[1,2].includes(d?.version));
 const combat=decode(3,decodeCombat,d=>d?.schemaVersion===1);
 const social=decode(4,decodeSocial,d=>d?.version===1);
 const music=decode(5,decodeMusic,d=>d?.version===1);
 const sources:Source[]=[], signals:Signal[]=[];
 const add=(chapter:number,path:string,label:string,text:string)=>{if(text.trim())sources.push({chapter,path,label,text});};
 const sig=(chapter:number,path:string,id:string,value:number,label:string)=>{signals.push({chapter,path,id,value,label});};
 const skippedOne=(id:string)=>one.skipped.includes(id);
 if(!skippedOne('identity')){
  add(1,'identity','Preferred role and flexibility',[one.preferred,one.flexibility].filter(Boolean).join(' · '));
  if(roles.includes(one.preferred as typeof roles[number]))sig(1,'preferred',one.preferred,1,'Declared preferred role');
  if(one.flexibility==='any-role'||one.flexibility==='two-roles')sig(1,'flexibility','flexibility',1,'Declared multi-role comfort');
 }
 for(const role of roles)if(one.roles[role].decision==='play'&&!skippedOne(`${role}-picks`))for(const id of one.roles[role].picks){
  const a=one.roles[role].answers[id],prefix=`${role}-${id}`,name=heroes.find(h=>h.id===id)?.name||id;
  add(1,`${role}.picks`,`${name} · selected main`,role);
  if(!a)continue;
  if(!skippedOne(`${prefix}-story`)){
   add(1,`${prefix}-story`,`${name} · attraction and ability`,[a.tags.join(', '),a.why,a.ability].filter(Boolean).join('\n'));
   if(a.tags.includes('Big moments')||a.tags.includes('Design / aesthetic'))sig(1,`${prefix}-story`,'spectacle',1,'Selected big-moment or aesthetic tag');
  }
  if(!skippedOne(`${prefix}-workshop`))add(1,`${prefix}-workshop`,`${name} · weakness and proposed change`,[a.weakness,a.change,a.rationale].filter(Boolean).join('\n'));
  if(!skippedOne(`${prefix}-loyalty`)){
   add(1,`${prefix}-loyalty`,`${name} · loyalty and self-rated mastery`,[a.loyalty,a.mastery&&`Mastery ${a.mastery}/5 (self-rating)`].filter(Boolean).join(' · '));
   if(a.loyalty==='yes')sig(1,`${prefix}-loyalty`,'loyalty',1,'Declared loyalty despite tier list');
   if(Number(a.mastery)>=4)sig(1,`${prefix}-loyalty`,'mastery',1,'Self-rated mastery of 4 or 5');
  }
 }
 for(const c of court.cases.filter(c=>c.id!=='demo')){
  if(!c.skipped.includes(1))add(2,`${c.id}.opening`,`${c.hero} · balance proposal`,[c.proposal,c.rationale,c.weakness].filter(Boolean).join('\n'));
  c.replies.forEach((reply,i)=>{if(!c.skipped.includes(i+3))add(2,`${c.id}.round${i+1}`,`${c.hero} · court round ${i+1}`,[c.choices[i],reply].filter(Boolean).join('\n'));});
  if(!c.skipped.includes(6))add(2,`${c.id}.extra`,`${c.hero} · unresolved discussion`,c.extra);
 }
 if(!mind.skipped.includes(1)&&(mind.top.some(Boolean)||mind.weakest||mind.confidence))add(3,'mirror','Claimed strengths and weakest',[`Strengths: ${mind.top.filter(Boolean).join(', ')||'unanswered'}`,`Weakest: ${mind.weakest||'unanswered'}`,mind.confidence&&`Confidence ${mind.confidence}/5`].filter(Boolean).join('\n'));
 for(const [id,name] of disciplines){
  if(!mind.skipped.includes(2))add(3,`evidence.${id}`,`${name} · self-described evidence`,mind.evidence[id]||'');
  if(!mind.skipped.includes(3))add(3,`replies.${id}`,`${name} · reflection`,mind.replies[id]||'');
 }
 if(!mind.skipped.includes(4))for(const q of mindScenarios){const choice=q.choices[mind.choices[q.id]];if(choice)add(3,`choices.${q.id}`,`${q.title} · Chapter 3 scenario`,`${choice.text}\n${mind.rationales[q.id]||''}\nAuthored reasoning: ${choice.reason}`);}
 // Earliest first run avoids cherry-picking a favorable rehearsal. Rehearsals never inflate baseline.
 const baseline=combat.runs.find(r=>r.kind==='first');
 const receipts=baseline?replay(baseline.events,baseline.seed).receipts:[];
 const rows=score(receipts);
 for(const r of receipts)if(r.actionId!=='skip')add(4,`${baseline!.id}.${r.nodeId}`,nodeList.find(n=>n.node.id===r.nodeId)!.node.title,`Selected ${r.actionId}; cue: ${r.cue}\n${r.rationale}\nRubric: ${r.marks.map(m=>`${m.category} ${m.value}/2 — ${m.reason}`).join('; ')}\nAuthored consequence: ${r.consequence}`);
 for(const row of rows)if(row.sufficient)sig(4,row.id,row.id,row.index!/100,`${row.name}: ${row.index}/100 authored rubric index`);
 const claims=disciplines.map(([id,name])=>{
  const row=rows.find(r=>r.id===id)!;
  const claim=mind.skipped.includes(1)?'Mirror skipped':mind.top.includes(id)?'Claimed strength':mind.weakest===id?'Claimed weakest':'No claim';
  const comparison=row.index===null?'No Chapter 4 evidence':!row.sufficient?'Too little Chapter 4 evidence to compare':claim==='Claimed strength'?(row.index>=75?'Scenario supports claim':'Scenario challenges claim'):claim==='Claimed weakest'&&row.index>=75?'Scenario challenges weakest claim':'No supported contradiction';
  if(comparison==='Scenario challenges claim')sig(3,`top → Chapter 4 / ${id}`,'claimGap',(100-row.index!)/100,`${name}: claimed strength versus ${row.index}/100 scenario index`);
  return {id,name,claim,comparison,index:row.index,opportunities:row.opportunities,encounters:row.encounterCount,sufficient:row.sufficient};
 });
 const socialRows=socialEvidence(social);
 const mappings:Record<string,Record<string,string>>={quad:{dive:'initiative',zone:'resources',cue:'teamwork'},peel:{turn:'support',split:'support',finish:'initiative'},lost:{reset:'leadership',ask:'verification',follow:'teamwork'},heals:{ping:'quiet',cue:'teamwork',joke:'teamwork'},trust:{check:'verification',sync:'teamwork',hold:'resources'},own:{own:'accountability',both:'accountability',later:'quiet'},swap:{swap:'flexibility',trial:'adaptation',offer:'loyalty'},ego:{replay:'analytical',explain:'teamwork',test:'verification'},boundary:{direct:'boundaries',mute:'boundaries',leave:'boundaries'},streak:{break:'reset',goal:'reset',mode:'reset'}};
 add(5,'context','Squad context (self-described)',social.context);
 for(const row of socialRows)if(row.choice){
  add(5,row.scenario.id,row.scenario.title,`${row.choice.label}\nTendency: ${row.choice.tendency}\nUseful: ${row.choice.strength}\nFriction: ${row.choice.friction}\nContext: ${row.choice.context}\n${row.example}`);
  const id=mappings[row.scenario.id]?.[row.choice.id];if(id)sig(5,row.scenario.id,id,1,row.choice.tendency);
 }
 music.songs.forEach((s,i)=>{if(!s.skipped)add(6,`songs.${i}`,musicStages[i],[s.title,s.source,s.tags.join(', '),s.scene,s.reason].filter(Boolean).join('\n'));});
 if(!music.behindSkipped){add(6,'reflection','Musical meaning',music.reflection);add(6,'connections','Self-authored chapter connections',music.connections);}
 // Each feature is capped at 1: selecting extra heroes cannot multiply influence.
 const features:Record<string,number>={};signals.forEach(s=>features[s.id]=Math.max(features[s.id]||0,s.value));
 const ranking=archetypes.map((a,order)=>{
  const contributions=signals.filter(s=>a.weights[s.id]).map(s=>({...s,weight:a.weights[s.id],points:s.value*a.weights[s.id]}));
  const points=Object.entries(a.weights).reduce((n,[id,w])=>n+(features[id]||0)*w,0);
  return {...a,points,order,contributions};
 }).sort((a,b)=>b.points-a.points||a.order-b.order);
 const sufficient=signals.length>=3&&new Set(signals.map(s=>s.chapter)).size>=2;
 const primary=sufficient&&ranking[0].points>0?ranking[0]:null;
 const secondary=primary?ranking.find(a=>a.id!==primary.id&&a.points>0)||null:null;
 const tension=claims.find(c=>c.comparison==='Scenario challenges claim'||c.comparison==='Scenario challenges weakest claim');
 const contradiction=tension?`${tension.name}: ${tension.claim.toLowerCase()} meets a ${tension.index}/100 scenario index. Compare the receipts before changing your self-description.`:socialRows.find(r=>r.choice)?`A tradeoff in your selected response: ${socialRows.find(r=>r.choice)!.choice!.friction}`:'No supported contradiction yet. Missing answers are not proof of consistency.';
 const coverage:Coverage[]=[
  {chapter:1,included:stepsFor(one).filter(s=>s.kind!=='summary'&&!skippedOne(s.id)&&answered(s,one)).length,skipped:one.skipped.length,total:stepsFor(one).length-1},
  {chapter:2,included:court.cases.filter(c=>c.id!=='demo').reduce((n,c)=>n+c.replies.filter((t,i)=>!!t&&!c.skipped.includes(i+3)).length,0),skipped:court.cases.filter(c=>c.id!=='demo').reduce((n,c)=>n+c.skipped.length,0),total:court.cases.filter(c=>c.id!=='demo').length*3},
  {chapter:3,included:mind.skipped.includes(1)?0:mind.top.filter(Boolean).length+(mind.weakest?1:0),skipped:mind.skipped.length,total:3},
  {chapter:4,included:receipts.filter(r=>r.actionId!=='skip').length,skipped:receipts.filter(r=>r.actionId==='skip').length,total:nodeList.length},
  {chapter:5,included:socialRows.filter(r=>r.choice).length,skipped:socialScenarios.filter(q=>social.answers[q.id]?.skipped).length,total:socialScenarios.length},
  {chapter:6,included:music.songs.filter(s=>!s.skipped&&s.title&&s.source).length,skipped:music.songs.filter(s=>s.skipped).length,total:3},
 ].map(c=>({...c,status:warnings[c.chapter-1]?'Excluded':!raw[c.chapter-1]?'Not started':c.included===0?'No counted answers':c.included<c.total?'Partial':'Counted answers complete',warning:warnings[c.chapter-1]}));
 const mains=sources.filter(s=>s.chapter===1&&s.path.endsWith('.picks')).map(s=>s.label.replace(' · selected main',''));
 const proposal=sources.find(s=>s.chapter===2&&s.path.endsWith('.opening'));
 const supported=claims.filter(c=>c.sufficient&&c.index!>=75).map(c=>c.name);
 const selectedSocial=socialRows.filter(r=>r.choice);
 const includedSongs=music.songs.filter(s=>!s.skipped&&s.title&&s.source);
 const narrative=[
  mains.length?`Your Chapter 1 cast is ${mains.join(', ')}. These are declared mains, not verified match picks. ${signals.some(s=>s.id==='loyalty')?'Your included loyalty answer adds commitment to that identity. ':''}${signals.some(s=>s.id==='spectacle')?'Your selected attraction tags also foreground spectacle or aesthetic identity.':''}`:'Chapter 1 leaves your hero identity open; no favorite is inferred.',
  proposal?`The conviction beside that cast is your Chapter 2 proposal: “${proposal.text.split('\n')[0]}”. Its merits remain unverified. The included rebuttals below show how you defended or revised it, without converting prose into a skill score.`:'No included balance proposal connects your hero choices to a court argument yet.',
  supported.length?`In Chapter 4, ${supported.join(', ')} meet the authored threshold for a consistent practice signal. ${tension?contradiction:'No supported claim-versus-scenario contradiction was identified.'} Scenario outcomes do not change these decision marks.`:`Chapter 4 does not yet support a consistent practice signal above 75 for any sufficiently sampled discipline. ${tension?contradiction:'Limited or missing evidence leaves the game-sense comparison open.'}`,
  selectedSocial.length?`Your squad lens adds ${selectedSocial.slice(0,3).map(r=>r.choice!.tendency.toLowerCase()).join(', ')} from selected Chapter 5 responses. These choices contextualize the tactical portrait; they do not establish how you actually treat teammates. Each useful instinct and its potential cost appears below.`:'No included Chapter 5 response supplies a social lens for the tactical story yet.',
  includedSongs.length?`Your creative frame includes ${includedSongs.map(s=>`“${s.title}” (${s.source})`).join(', ')}. Those themes accompany the portrait without changing its score. ${music.behindSkipped||!music.connections?'No included musical commentary makes a further chapter connection.':'Your own musical connection is quoted in the soundtrack section.'}`:'Your soundtrack remains a draft or was skipped; no musical identity is invented.',
 ];
 return {rulesVersion:RULES,primary,secondary,contradiction,narrative,ranking,signals,sources,coverage,claims,baselineId:baseline?.id||null,rehearsals:combat.runs.filter(r=>r.kind==='rehearsal').map(r=>({id:r.id,newDecisions:r.events.slice(r.forkAt).filter(e=>e.actionId!=='skip').length})),award:primary?`${primary.name.replace(/^The /,'')} · Signature Contribution Award`:'The Unwritten Flame · Reflection Starter Award',challenge:primary?.challenge||'Complete one role story and three squad scenarios, then return. A blank page deserves curiosity, not a label.',social:selectedSocial.map(r=>({title:r.scenario.title,tendency:r.choice!.tendency,strength:r.choice!.strength,friction:r.choice!.friction,context:r.choice!.context})),soundtrack:music.songs.map((s,i)=>({role:musicStages[i],status:s.skipped?'Skipped':s.title&&s.source?'Recorded':'Draft',title:s.skipped?'':s.title,source:s.skipped?'':s.source,moods:s.skipped?[]:s.tags,url:s.skipped?null:safeLink(s.url),preview:s.skipped?undefined:s.preview})),connections:music.behindSkipped?'':music.connections};
}
export type Judgment=ReturnType<typeof judge>;
// Explicit, versioned V2 integration contract. No transport or inferred consent.
export type PartnerProfileV2={schema:'rivals-workshop.partner-profile';schemaVersion:2;rulesVersion:string;scope:'individual';consent:{teamChemistry:false;aiPartner:false;examples:false};capabilities:{teamChemistry:'reserved';aiPartner:'reserved'};identity:{primary:string|null;secondary:string|null};evidence:{origin:'self-report-and-authored-scenarios';baselineRunId:string|null;coverage:Coverage[]};preferences:{communication:string[]};growthChallenge:string;extensions:Record<string,unknown>};
export function partnerProfile(j:Judgment):PartnerProfileV2{return {schema:'rivals-workshop.partner-profile',schemaVersion:2,rulesVersion:RULES,scope:'individual',consent:{teamChemistry:false,aiPartner:false,examples:false},capabilities:{teamChemistry:'reserved',aiPartner:'reserved'},identity:{primary:j.primary?.id||null,secondary:j.secondary?.id||null},evidence:{origin:'self-report-and-authored-scenarios',baselineRunId:j.baselineId,coverage:j.coverage},preferences:{communication:j.social.map(s=>s.tendency)},growthChallenge:j.challenge,extensions:{}};}
export function exportJudgment(j:Judgment,nickname='',includeAnswers=false){return {schema:'rivals-workshop.final-judgment',schemaVersion:1,rulesVersion:RULES,scope:'individual',...(nickname?{nickname}:{}),primary:j.primary?.name||'Insufficient evidence',secondary:j.secondary?.name||null,contradiction:j.contradiction,award:j.award,growthChallenge:j.challenge,coverage:j.coverage,scoring:{featureCap:1,minimumSignals:3,minimumChapters:2,tieBreaker:'roster order',candidates:j.ranking.map(a=>({id:a.id,points:a.points,weights:a.weights})),signals:j.signals.map(({id,chapter,path,value})=>({id,chapter,path,value}))},limitations:'Deterministic authored rules; provisional reflection, not live AI, observed matches, rank or psychological diagnosis.',profileV2:partnerProfile(j),...(includeAnswers?{includedAnswers:j.sources,soundtrack:j.soundtrack,claims:j.claims}:{})};}
