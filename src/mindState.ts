export const disciplines = [
  ['analytical', 'Analytical', 'Compare explanations and alternatives using the information available.'],
  ['reactive', 'Reactive', 'Respond to a threat already unfolding without losing the larger plan.'],
  ['proactive', 'Proactive', 'Anticipate a likely threat and prepare before it happens.'],
  ['awareness', 'Fight Awareness', 'Track the live fight: threats, numbers, momentum and missing information.'],
  ['positioning', 'Positioning Awareness', 'Find useful angles with cover, support and an escape route.'],
  ['resources', 'Resource/Cooldown Awareness', 'Track available tools and trade them for the next threat.'],
  ['objective', 'Objective/Macro', 'Convert fights into progress and plan around the win condition.'],
  ['adaptation', 'Adaptability/Flex', 'Change your approach when the enemy answers your plan.'],
  ['teamwork', 'Team Awareness', 'Read teammate readiness, needs and intent; synchronize the squad.'],
  ['pressure', 'Pressure Decision-Making', 'Choose under time pressure despite uncertainty and failure cost.'],
] as const;
export type Discipline = typeof disciplines[number][0];
export const stages = ['Ten Disciplines', 'Mirror Test', 'Evidence Locker', 'Interrogation', 'Contradiction Test', 'Preliminary Diagnosis'];
type Choice = { text: string; value: number; reason: string };
export type Scenario = { id: string; category: Discipline; title: string; prompt: string; choices: Choice[] };
const choice = (text: string, value: number, reason: string): Choice => ({ text, value, reason });
export const scenarios: Scenario[] = [
 {id:'missing',category:'awareness',title:'The missing threat',prompt:'Your squad is advancing. An enemy flanker vanished from the front lane and your backline is exposed. No one has confirmed their location.',choices:[choice('Call the missing threat, check the flank from cover and keep a retreat path.',2,'Uses uncertainty as information while maintaining pressure.'),choice('Leave the objective and search deep alone.',0,'May expose you and surrender tempo without confirming anything.'),choice('Keep advancing but ask the backline to report contact.',1,'Useful communication, but the exposed angle still needs attention.')]},
 {id:'angle',category:'positioning',title:'The beautiful angle',prompt:'A side angle gives a clear shot at a support, but your escape ability is unavailable and your healers cannot see you.',choices:[choice('Take the shot immediately; a support elimination would be huge.',0,'High value is possible, but the escape and support constraints make the cost substantial.'),choice('Use nearby cover to establish a supported angle or wait for the escape tool.',2,'Preserves the opportunity while reducing isolation.'),choice('Stay behind the tank for the whole fight.',1,'Safe now, but gives up every angle even after conditions change.')]},
 {id:'commit',category:'proactive',title:'Before the opening',prompt:'Your squad will regroup shortly. The enemy has repeatedly sent a diver through the side lane after your first attack. No diver is visible yet, and you expect that pattern could repeat.',choices:[choice('Warn the squad and prepare a covered fallback before engaging; keep watching for a different route.',2,'Prepares for a predicted threat without treating the prediction as certain.'),choice('Engage alone now and deal with the diver if they appear.',0,'Relies on a later reaction while ignoring the known pattern and missing teammates.'),choice('Wait in cover for contact, without preparing a fallback or sharing the pattern.',1,'Limits exposure but leaves the likely threat unprepared for.')]},
 {id:'escape',category:'resources',title:'One tool, two jobs',prompt:'Your mobility can secure a low-health opponent or save you from an approaching diver. The opponent is retreating out of objective range.',choices:[choice('Spend mobility to finish the opponent.',0,'A chase outside the win condition can leave you helpless to the imminent threat.'),choice('Keep mobility for the diver and maintain objective pressure.',2,'Accounts for the next threat and the opponent’s reduced relevance.'),choice('Retreat all the way to spawn.',1,'Protects your life but concedes more space than the information requires.')]},
 {id:'target',category:'reactive',title:'The tempting health bar',prompt:'An enemy tank is nearly eliminated but behind cover. A support is exposed in range, and a diver is pressuring your ally next to you.',choices:[choice('Chase the tank around cover.',0,'Low health alone does not make a target accessible or urgent.'),choice('Help the ally against the diver, then reassess the exposed support.',2,'Addresses an immediate local threat and preserves a teammate.'),choice('Shoot the exposed support while calling the diver.',1,'May create value, but depends on your ally surviving without your help.')]},
 {id:'overtime',category:'objective',title:'The overtime split',prompt:'Overtime is active. You are closest to the objective, two allies are nearby, and an enemy is retreating with very low health.',choices:[choice('Chase the elimination to make the next fight easier.',0,'The round can end before a next fight exists.'),choice('Secure contact, call an ally to cover it, then reassess pressure.',2,'Maintains the immediate win condition while creating room for a handoff.'),choice('Stay on the point without communicating.',1,'Keeps the round alive but leaves the contact responsibility unclear.')]},
 {id:'call',category:'teamwork',title:'Too many calls',prompt:'Your team wants to engage, but two players call different targets. You have spotted an accessible isolated opponent.',choices:[choice('Give one short target and timing call, then verify the squad is ready.',2,'Turns information into a shared executable plan.'),choice('Explain every enemy cooldown over voice before committing.',1,'Relevant detail can overload the narrow decision window.'),choice('Attack silently so the team can follow your damage.',0,'Assumes coordination without giving teammates a clear cue.')]},
 {id:'counter',category:'adaptation',title:'The route that stopped working',prompt:'The same flank succeeded once, then failed twice after the enemy started guarding it. Your hero still has useful tools for the main fight.',choices:[choice('Try the same route faster.',0,'Speed alone does not answer the new enemy coverage.'),choice('Change route or timing with the squad; consider a swap if your tools still cannot create value.',2,'Tests a specific adjustment before treating a hero swap as a cure-all.'),choice('Swap immediately without identifying what failed.',1,'A swap may help, but the underlying route or timing problem can persist.')]},
 {id:'lastfight',category:'pressure',title:'The last fight calculation',prompt:'Your team must contest soon. You can attempt a risky flank with a large payoff, but failure would leave the team outnumbered. A safer grouped route is available.',choices:[choice('Take the flank because the highlight could win the match.',0,'Payoff alone ignores the failure cost and available alternative.'),choice('Compare time, enemy coverage and team readiness; choose grouped entry unless the flank has a supported opening.',2,'Makes the risk conditional on observable information.'),choice('Avoid all risk and wait until the timer expires.',0,'Inaction can also lose the match; safe does not mean passive.')]},
 {id:'reset',category:'analytical',title:'Two explanations, one loss',prompt:'You committed early and died. A teammate also missed an ability. You suspect either timing or poor support sightlines caused the loss. There is time to compare the sequence before the next fight.',choices:[choice('Tell them their miss caused the loss.',0,'Narrows the explanation to someone else and blocks useful correction.'),choice('Compare your entry time and support sightlines, ask what each teammate saw, then test one readiness cue.',2,'Compares competing explanations and proposes an observable test rather than treating blame as evidence.'),choice('Mute everyone and focus on playing perfectly.',1,'Can reduce distraction, but gives up coordination and a specific correction.')]},
];
export const MIND_KEY = 'rivals-workshop.chapter3.v1';
export type Mind = { version:2; legacy:Record<string,unknown>|null; stage:number; top:(Discipline|'')[]; weakest:Discipline|''; confidence:string; evidence:Record<string,string>; replies:Record<string,string>; choices:Record<string,number>; rationales:Record<string,string>; skipped:number[]; finished:boolean };
export function blankMind():Mind { return {version:2,legacy:null,stage:0,top:[],weakest:'',confidence:'',evidence:{},replies:{},choices:{},rationales:{},skipped:[],finished:false}; }
export function decodeMind(raw:string|null):Mind {
 const s=blankMind(); try { const d=JSON.parse(raw||'null'); if(d?.version!==1&&d?.version!==2)return s;
 if(d.version===1){
   // Preserve the original payload before narrowing categories. Ambiguous claims
   // are archived rather than reinterpreted as evidence for a new discipline.
   s.legacy=d;
 }else if(d.legacy&&typeof d.legacy==='object'&&!Array.isArray(d.legacy))s.legacy=d.legacy;
 const ids=disciplines.map(x=>x[0]); const retained=d.version===1?ids.filter(id=>id!=='awareness'):ids; const str=(x:unknown)=>typeof x==='string'?x.slice(0,4000):'';
 s.stage=Number.isInteger(d.stage)&&d.stage>=0&&d.stage<6?d.stage:0;
 s.top=Array.isArray(d.top)&&d.version===2&&d.top.length<=2&&d.top.every((id:unknown)=>id===''||retained.includes(id as Discipline))&&new Set(d.top.filter(Boolean)).size===d.top.filter(Boolean).length?d.top.slice():Array.isArray(d.top)?[...new Set<Discipline>(d.top.filter((id:unknown)=>typeof id==='string'&&retained.includes(id as Discipline)))].slice(0,2):[];
 s.weakest=retained.includes(d.weakest)&&!s.top.includes(d.weakest)?d.weakest:'';
 s.confidence=['1','2','3','4','5'].includes(d.confidence)?d.confidence:'';
 for(const [id] of disciplines){s.evidence[id]=retained.includes(id)?str(d.evidence?.[id]):'';s.replies[id]=retained.includes(id)?str(d.replies?.[id]):'';}
 for(const q of scenarios){const v=d.choices?.[q.id];if((d.version===2||!['missing','commit','target','lastfight','reset'].includes(q.id))&&Number.isInteger(v)&&v>=0&&v<q.choices.length)s.choices[q.id]=v;s.rationales[q.id]=str(d.rationales?.[q.id]);}
 s.skipped=Array.isArray(d.skipped)?[0,1,2,3,4].filter(i=>d.skipped.includes(i)):[];s.finished=d.version===2&&d.finished===true;return s;
 }catch{return s;}
}
export function classify(text:string) { // Structure cues only; never claim semantic understanding.
 const context=/\b(when|while|during|round|fight|objective|overtime|spawn)\b/i.test(text);
 const action=/\b(I|we)\s+(used|held|waited|called|moved|pushed|retreated|swapped|checked|chose|decided|pinged|stayed)\b/i.test(text);
 const outcome=/\b(because|result|so that|won|lost|survived|died|learned|next time)\b/i.test(text);
 return {label:!text.trim()?'No evidence':context&&action&&outcome?'Structured account':'Needs more detail',context,action,outcome,prompt:!context?'What was happening, and what information was missing?':!action?'What did you personally choose to do, and what alternative did you reject?':!outcome?'What happened afterward, and what would change your decision next time?':'What alternative explanation fits the outcome, and what observation would distinguish it?'};
}
export function diagnosis(s:Mind){return disciplines.map(([id,name])=>{
 const qs=scenarios.filter(q=>q.category===id);const answered=qs.filter(q=>s.choices[q.id]!==undefined);const points=answered.reduce((n,q)=>n+q.choices[s.choices[q.id]].value,0);
 const signal=!answered.length?'Unobserved':points===answered.length*2?'Promising scenario signal':points===0?'Practice opportunity':'Context-dependent signal';
 const claim=s.top.includes(id)?'Claimed strength':s.weakest===id?'Claimed weakest':'No mirror claim';
 const tension=s.top.includes(id)&&answered.length&&points<answered.length*2?'Claim and scenario diverge':s.weakest===id&&points===answered.length*2&&answered.length?'Scenario challenges weakest claim':'';
 return {id,name,signal,claim,tension,evidence:classify([s.evidence[id],s.replies[id]].filter(Boolean).join(' ')).label};
});}

export const subskills = ['Engagement Timing', 'Target Priority', 'Risk Assessment', 'Composure'] as const;
const probes:Record<Discipline,{neighbor:Discipline;question:string;cue:RegExp}>={
 analytical:{neighbor:'adaptation',question:'What competing explanation did you test? What evidence favored it, and did you change your plan or only understand it better?',cue:/alternative|compared|evidence|explanation/i},
 reactive:{neighbor:'proactive',question:'Had the threat already appeared when you acted, or did you prepare before it? Name the trigger and how much time you had.',cue:/already|after|appeared|respond|trigger/i},
 proactive:{neighbor:'reactive',question:'What did you predict before contact? What preparation would still help if that prediction was wrong?',cue:/before|predict|anticipat|prepare/i},
 awareness:{neighbor:'teamwork',question:'Which live enemy or fight cue did you notice? Separately, what did you know about teammate readiness rather than assume?',cue:/noticed|missing|enemy|numbers|threat/i},
 positioning:{neighbor:'resources',question:'Would this location still be safe without mobility? Separate cover and support sightlines from the cooldown that made escape possible.',cue:/cover|angle|sightline|escape|location/i},
 resources:{neighbor:'positioning',question:'Which specific tool was available or spent? Would the same trade work from another position, and what cooldown cue changed your choice?',cue:/cooldown|ability|tool|available|spent/i},
 objective:{neighbor:'pressure',question:'What was the win condition and next rotation? Separate the macro plan from the urgent choice you made when the timer narrowed.',cue:/objective|overtime|rotation|timer|point/i},
 adaptation:{neighbor:'analytical',question:'What changed in the enemy response, what did you change in your play, and what happened on the next attempt?',cue:/changed|swap|adjust|next attempt|route/i},
 teamwork:{neighbor:'awareness',question:'What teammate need or readiness cue did you confirm? How did that change your action beyond simply noticing the fight?',cue:/teammate|ally|ready|call|ping|squad/i},
 pressure:{neighbor:'analytical',question:'How little time did you have? Which tradeoff did you commit to with incomplete information, and how did you keep composure?',cue:/seconds|urgent|pressure|tradeoff|time|commit/i},
};
export function interrogate(id:Discipline,text:string){
 const structure=classify(text), probe=probes[id];
 return {...structure,neighbor:disciplines.find(d=>d[0]===probe.neighbor)![1],cue:probe.cue.test(text),
 question:probe.question,structureQuestion:structure.prompt,
 feedback:!text.trim()?'No account yet; no discipline inference is possible.':probe.cue.test(text)?'A relevant wording cue was found; this is a heuristic prompt, not proof of this discipline.':'No expected wording cue was found; your example may still demonstrate this discipline.'};
}
const titles:Record<Discipline,string>={analytical:'The Pattern Lantern',reactive:'The Spark Catcher',proactive:'The Storm Scout',awareness:'The Battlefield Watchtower',positioning:'The Angle Architect',resources:'The Reserve Keeper',objective:'The Compass Bearer',adaptation:'The Shape Shifter',teamwork:'The Squad Conductor',pressure:'The Calm at the Crossroads'};
export function provisional(s:Mind){
 const rows=diagnosis(s);
 const strengths=rows.filter(r=>r.signal==='Promising scenario signal').map(r=>{
  const q=scenarios.find(q=>q.category===r.id)!;
  return {id:r.id,name:r.name,source:q.title,reason:q.choices[s.choices[q.id]].reason,account:s.evidence[r.id]?.trim()||'',corroborated:false};
 });
 const lead=strengths.find(r=>s.top.includes(r.id))||strengths[0];
 const challenge=rows.find(r=>r.tension)||rows.find(r=>r.signal==='Practice opportunity')||rows.find(r=>r.signal==='Unobserved');
 return {title:lead?titles[lead.id]:'The Uncharted Flame',strengths,contradictions:rows.filter(r=>r.tension),
 uncertainty:'Low confidence: one authored dilemma per discipline, self-reported examples, no verified match observation. Wording cues do not score skill. Rehearsed choices and missing context can distort the picture.',
 challenge:challenge?{id:challenge.id,name:challenge.name,prompt:probes[challenge.id].question}:{id:'adaptation' as Discipline,name:'Transfer under changing conditions',prompt:'Test one supported decision in a different fight. Which changed cue makes you revise the plan?'},
 identityNote:'A provisional reflection title based on selected scenario responses. Final archetypes belong to Chapter 7; this is not an archetype assignment.'};
}
