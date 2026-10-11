import WritingField from './WritingField';
import { useEffect, useRef, useState } from 'react';
import { decodeSave, KEY } from './chapterState';
import { disciplines, MIND_KEY } from './mindState';
import { combatStages, CONTENT_VERSION, nodeList } from './combatContent';
import { adjustedNode, replay, score } from './combatEngine';
import type { Receipt } from './combatEngine';
import { blankCombat, COMBAT_KEY, commit, createRun, decodeCombat, dossier, encounterStage, forkRun, rememberDraft, selectRun, mergeBackup, newEvidence, savingPaused } from './combatState';
import type { CombatSave } from './combatState';
import { downloadJson, downloadText } from './saveRecovery';
import { localCoach } from './combatCoach';
import './chapter.css';
import './combat.css';

function read(){let raw:string|null=null;try{raw=localStorage.getItem(COMBAT_KEY);return {save:decodeCombat(raw),raw,error:''};}catch(e){return {save:blankCombat(),raw,error:raw?String(e):'Storage is unavailable. Keep a downloaded backup for this visit.'};}}
const uuid=()=>crypto.randomUUID();
const name=(id:string)=>disciplines.find(d=>d[0]===id)?.[1]||id;

export default function ChapterFour({nickname}:{nickname:string}){
 const [loaded]=useState(read),[s,set]=useState(loaded.save),[notice,setNotice]=useState(''),[blocked,setBlocked]=useState(!!loaded.raw&&!!loaded.error);
 const [conflict,setConflict]=useState<string|null>(null),[error,setError]=useState(loaded.error),[review,setReview]=useState(false),[showResult,setShowResult]=useState(!!loaded.save.pendingResults?.[loaded.save.runs[loaded.save.active]?.id]);
 const [writer]=useState(uuid),[role,setRole]=useState(()=>{try{return decodeSave(localStorage.getItem(KEY)).preferred;}catch{return '';}});
 const heading=useRef<HTMLHeadingElement>(null),lastRaw=useRef(loaded.raw),file=useRef<HTMLInputElement>(null);
 const saveRef=useRef(s);saveRef.current=s;
 const run=s.runs[s.active],state=run?replay(run.events,run.seed):null,row=state&&nodeList[state.index],node=row&&state?adjustedNode(state.index,state.battle):null;
 const dossierData=run?dossier(run):null,rows=state&&run?score(newEvidence(run,state.receipts)):[],latest=state?.receipts.at(-1);
 const combatVisible=s.stage>=2&&s.stage<=4;
 const activeStage=state&&row?encounterStage(state.index):5;
 function update(fn:(v:CombatSave)=>CombatSave){set(v=>{const next=fn(rememberDraft(v));return next===v?v:{...next,revision:v.revision+1,writer};});}
 useEffect(()=>{
  if(savingPaused(blocked,conflict))return;
  try{
   const current=localStorage.getItem(COMBAT_KEY);
   if(current!==lastRaw.current){setConflict(current||'');setNotice('Another tab changed this save. Choose which draft to keep.');return;}
   const raw=JSON.stringify(rememberDraft(s));localStorage.setItem(COMBAT_KEY,raw);lastRaw.current=raw;setNotice('Saved on this browser.');
  }catch{setNotice('Storage unavailable. Download your backup; this visit remains in memory.');}
 },[s,blocked,conflict]);
 useEffect(()=>{const listener=(e:StorageEvent)=>{if((e.key===COMBAT_KEY||e.key===null)&&e.newValue!==lastRaw.current){setConflict(e.newValue||'');}};window.addEventListener('storage',listener);return ()=>window.removeEventListener('storage',listener);},[]);
 useEffect(()=>{heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'start',behavior:'instant'});},[s.stage,s.active,state?.index,review,showResult]);
 function newRun(){
  if(s.runs.length>=12){setError('This save holds 12 runs. Download a backup before starting a separate collection.');return;}
  let raw=null;try{raw=localStorage.getItem(MIND_KEY);}catch{/* neutral */}
  const next=createRun(raw,role,Math.floor(Math.random()*1_000_001),uuid(),s.runs.length?'rehearsal':'first');
  next.forkAt=0;
  update(v=>({...v,runs:[...v.runs,next],active:v.runs.length,stage:1,finished:false,draft:blankCombat().draft}));setReview(false);setShowResult(false);setError('');
 }
 function recover(){
  try{if(loaded.raw)localStorage.setItem(`${COMBAT_KEY}.recovery`,loaded.raw);lastRaw.current=localStorage.getItem(COMBAT_KEY);setBlocked(false);update(()=>blankCombat());setError('Original save preserved in recovery storage. Download it before clearing browser data.');}
  catch{setError('Could not archive the original. Download it first; the original has not been replaced.');}
 }
 function resolveConflict(useIncoming:boolean){
  try{
   const current=localStorage.getItem(COMBAT_KEY);
   if(useIncoming){const incoming=decodeCombat(current);lastRaw.current=current;set(s=>({...incoming,revision:Math.max(s.revision,incoming.revision)+1,writer}));}
   else {if(current)localStorage.setItem(`${COMBAT_KEY}.conflict-backup`,current);lastRaw.current=current;update(v=>({...v}));}
   setConflict(null);setError('');
  }catch(e){setError(`Unable to resolve this save: ${String(e)}. Download both copies for recovery.`);}
 }
 async function importBackup(input:HTMLInputElement){
  const selected=input.files?.[0];if(!selected)return;
  try{if(selected.size>2_000_000)throw new Error('Backup exceeds 2 MB.');const imported=decodeCombat(await selected.text());
   const combined=mergeBackup(saveRef.current,imported);update(()=>combined);setError('Backup imported. Existing histories and unfinished drafts were kept.');setReview(false);setShowResult(!!combined.pendingResults?.[combined.runs[combined.active]?.id]);
  }catch(e){setError(String(e));}finally{input.value='';}
 }
 function decide(skip=false){
  if(!run||!node||blocked||conflict!==null)return;
  const draft=s.draft;
  update(v=>commit(v,{nodeId:node.id,actionId:skip?'skip':draft.actionId,cue:skip?'':draft.cue,rationale:draft.rationale,at:new Date().toISOString()}));
  setShowResult(true);
 }
 function ReceiptCard({receipt,index}:{receipt:Receipt;index:number}){return <article className="ch-panel combat-receipt">
  <p className="eyebrow">DECISION {index+1} · {nodeList[index].encounter.title}</p><h3>{nodeList[index].node.title}</h3>
  {run?.kind==='rehearsal'&&index<run.forkAt&&<p className="combat-note">Inherited context from the parent run — excluded from new rehearsal evidence.</p>}
  <p><strong>{receipt.actionId==='skip'?'Skipped':nodeList[index].node.options.find(o=>o.id===receipt.actionId)?.text}</strong></p>
  <p>{localCoach(receipt,s.tone)}</p><p>State: space {receipt.after.space}/4 · readiness {receipt.after.readiness}/4 · reserve {receipt.after.reserve}/1 · tempo {receipt.after.tempo}/4 · {receipt.after.exposed?'isolated':'connected'}</p>
  <details><summary>Decision rubric & evidence</summary>{receipt.marks.map(m=><p key={m.category}><strong>{name(m.category)} · {m.value}/2</strong> (weight {m.weight}): {m.reason}</p>)}</details>
 {receipt.rationale&&<blockquote>{receipt.rationale}</blockquote>}{receipt.ending&&<p className="combat-ending">{receipt.ending}</p>}
  {dossierData?.focus.some(id=>receipt.marks.some(m=>m.category===id))&&<p className="combat-note">Dossier follow-up: {dossierData!.rows.filter(r=>dossierData!.focus.includes(r.id)&&receipt.marks.some(m=>m.category===r.id)).map(r=>`${r.name}: ${r.claim}; ${r.signal}${r.tension?` — ${r.tension}`:''}.`).join(' ')} Which confirmed cue supports or challenges this earlier picture? Find one real fight that could disagree.</p>}
  {review&&<><details><summary>Explore other decisions</summary>{adjustedNode(index,receipt.before).options.filter(o=>o.id!==receipt.actionId).map(o=><div key={o.id}><p><strong>{o.text}</strong></p><p>{o.marks.map(m=>`${name(m.category)} ${m.value}/2`).join(' · ')} — {o.counterfactual}</p></div>)}</details><button className="ch-quiet" disabled={s.runs.length>=12||blocked||conflict!==null} onClick={()=>{update(v=>forkRun(v,index,uuid()));setReview(false);setShowResult(false);}}>Rehearse from this decision (keep original)</button></>}
 </article>;}
 return <div className="ch-shell combat-shell"><a className="skip" href="#combat-main" onClick={e=>{e.preventDefault();heading.current?.focus();}}>Skip to combat content</a>
 <header className="ch-header"><a className="ch-brand" href="#main"><img src="./flame.svg" alt=""/>RIVALS WORKSHOP</a><span className="ch-player">PLAYER <strong>{nickname||'Player'}</strong></span><a className="ch-quiet" href="#chapter-3">Chapter 3</a><a className="ch-quiet" href="#main">Return to workshop</a></header>
 <div className="ch-layout"><aside className="ch-sidebar"><p className="eyebrow">CHAPTER / 04</p><h2>Trial by Combat</h2><p className="ch-muted">Your instincts have entered the arena.</p>
 <nav aria-label="Chapter 4 stages">{combatStages.map((title,i)=><button key={title} aria-current={s.stage===i?'step':undefined} disabled={i===1&&!run||i>=2&&i<=4&&(!row||i!==activeStage)||i===5&&!state?.receipts.length} onClick={()=>{update(v=>({...v,stage:i}));setReview(false);setShowResult(false);}}>{i+1}. {title}</button>)}</nav>
 <p role="status" className="ch-storage">{notice||'Preparing local save…'}</p><p>{run?.events.length||0}/{nodeList.length} decisions visited · {run?.events.filter(e=>e.actionId!=='skip').length||0} answered</p><progress aria-label="Trial decisions visited" value={run?.events.length||0} max={nodeList.length}/>
 <p className="ch-muted">Authored simulation · no live AI · no rank prediction. New encounters start with fresh resources. Earlier choices remain in your receipts.</p>
 <details className="combat-tools"><summary>Saved runs, backups & coach settings</summary><label className="ch-field"><span>Coach delivery</span><select value={s.tone} onChange={e=>update(v=>({...v,tone:e.target.value as CombatSave['tone']}))}><option value="playful">Playful</option><option value="supportive">Supportive</option></select></label>
 {s.runs.length>0&&<label className="ch-field"><span>Saved run</span><select value={s.active} onChange={e=>{update(v=>selectRun(v,Number(e.target.value)));setReview(false);setShowResult(!!s.pendingResults?.[s.runs[Number(e.target.value)].id]);}}>{s.runs.map((r,i)=><option key={r.id} value={i}>{i+1}. {r.kind==='first'?'First attempt':'Rehearsal'} · {r.events.length}/18</option>)}</select></label>}
 <button className="ch-quiet" onClick={()=>downloadJson('rivals-workshop-combat-backup.json',rememberDraft(s))}>Download combat backup</button><label className="ch-field"><span>Import combat backup (JSON, up to 2 MB)</span><input ref={file} type="file" accept="application/json,.json" disabled={blocked||conflict!==null} onChange={e=>void importBackup(e.currentTarget)}/></label>
 </details></aside><main id="combat-main" className="combat-main"><p className="eyebrow">{run?.kind==='rehearsal'?'PRACTICE REHEARSAL · ORIGINAL KEPT':'FIRST ATTEMPT'} · CHAPTER 04</p>
 <h1 className="ch-title" tabIndex={-1} ref={heading}>{review?'Decision receipts':showResult?'Decision debrief':combatVisible&&row?row.node.title:combatStages[s.stage]}</h1>
 {error&&<p role="alert" className="combat-warning">{error}</p>}
 {blocked&&<section className="ch-panel"><h2>Your original save needs recovery</h2><p>It has not been replaced. Download it or preserve it in recovery storage before creating a compatible draft.</p><button className="primary" onClick={()=>downloadText('combat-original-recovery.json',loaded.raw||'')}>Download original</button><button className="ch-quiet" onClick={recover}>Preserve original & start a clean draft</button></section>}
 {conflict!==null&&<section className="ch-panel" role="alert"><h2>Two tabs, two drafts</h2><p>Saving is paused. Keep one whole tactical history; histories cannot be merged safely.</p><button className="primary" onClick={()=>resolveConflict(true)}>Use the other tab’s save</button><button className="ch-quiet" onClick={()=>resolveConflict(false)}>Keep this draft & archive the other</button><button className="ch-quiet" onClick={()=>downloadText('combat-other-tab.json',conflict)}>Download other copy</button></section>}
 {!blocked&&conflict===null&&<>
 {showResult&&latest?<><div role="status"><ReceiptCard receipt={latest} index={state!.index-1}/></div><button className="primary" onClick={()=>{setShowResult(false);update(v=>({...v,pendingResults:{...v.pendingResults,[run!.id]:false}}));}}>{row?'Continue to next decision':'Open combat debrief'} →</button></>:review?<><p>Rehearsal creates a separate branch. Original decisions remain intact. Inherited decisions in a rehearsal are context, not new evidence.</p>{state?.receipts.map((r,i)=><ReceiptCard key={r.nodeId} receipt={r} index={i}/>)}<button className="primary" onClick={()=>setReview(false)}>Return to trial</button></>:<>
 {s.stage===0&&<><p className="ch-lead">Six escalating encounters. Eighteen decisions. A chance to test the mind behind the mechanics — without placing your rank on trial.</p>
 {run?<><section className="ch-panel"><p className="eyebrow">CHAPTER 3 SNAPSHOT · {run.hasBriefing?'CARRIED INTO THIS RUN':'NEUTRAL BRIEFING'}</p><h2>{dossierData!.profile.title}</h2><p>{dossierData!.profile.uncertainty}</p><p>Focus: {dossierData!.focus.length?dossierData!.focus.map(name).join(' · '):'Transfer across changing situations; no ranked priority.'}</p><p>We prioritize the first claimed strength, first tension and claimed weakest area (or first scored weak/unobserved area) in the original ten-category order. This changes follow-up questions, never scores. Your Chapter 3 snapshot stays fixed for this run.</p><p>Role context: {run.role||'No preference supplied'} · {run.kind==='first'?'First attempt':'Rehearsal'} · {run.events.length}/18 decisions visited.</p></section>
 <button className="primary" onClick={()=>update(v=>({...v,stage:run.events.length===18?5:run.events.length?activeStage:1}))}>{run.events.length===18?'View debrief':'Resume this trial'} →</button></>:<section className="ch-panel"><h2>Your briefing starts here</h2><p>Chapter 3 is optional. Existing results will be carried into a new snapshot, with uncertainty preserved. No save? You get the same core encounters and scoring.</p></section>}
 <label className="ch-field"><span>Role context for a new run (flavor only)</span><select value={role} onChange={e=>setRole(e.target.value)}><option value="">No preference</option><option value="vanguard">Vanguard</option><option value="duelist">Duelist</option><option value="strategist">Strategist</option><option value="no-preference">Flex / no single role</option></select></label>
 <button className={run?'ch-quiet':'primary'} disabled={s.runs.length>=12} onClick={newRun}>{run?'Start fresh rehearsal with current Chapter 3 snapshot':'Create my trial'}</button><p className="ch-muted">New runs keep previous runs. Up to 12 fit in a combat backup. The six encounters use illustrative role-neutral tools, not current ability statistics.</p></>}
 {s.stage===1&&run&&<><section className="ch-panel"><h2>Read the fight. Choose the play.</h2><ol><li>Read confirmed cues, unknowns and the cost of waiting.</li><li>Pick an action and the cue that mattered. The chosen cue and optional reasoning are saved for reflection; only the action is scored.</li><li>Commit once, then review the consequences and category-specific reasoning.</li></ol><p>A 2 respects the stated constraints; 1 reflects a reasonable but incomplete trade; 0 ignores a critical known constraint. Multiple actions can earn 2 with different costs.</p><p>Wins and losses do not change decision scores. Opponent responses and execution variants are authored and fixed for your run. Reload never rerolls them. There is no reading countdown. Pressure scores reflect recognizing urgency in a written scenario, not measured speed or composure.</p><p>Space/readiness/tempo use a fictional 0–4 scale; reserve is 0–1. Encounters reset these resources because each is a new situation. A skip keeps the state unchanged and adds no category observation.</p></section><section className="ch-panel"><h2>Warm-up, no score</h2><p>Someone says “the diver must be behind us.” You only saw them leave the front. Which part is known?</p><details><summary>Check the cue</summary><p>The diver is missing. Their destination is a hypothesis. Prepare a covered fallback without claiming a confirmed location.</p></details></section><button className="primary" onClick={()=>update(v=>({...v,stage:activeStage}))}>Enter the arena →</button></>}
 {combatVisible&&node&&row&&state&&<><p className="ch-lead">{row.encounter.title} · {row.encounter.difficulty} · Decision {row.nodeIndex+1}/3</p>{s.tone==='playful'&&<p className="combat-joke">{row.encounter.joke}</p>}
 <dl className="combat-context"><div><dt>Objective</dt><dd>{row.encounter.objective}</dd></div><div><dt>Squad</dt><dd>{row.encounter.team}</dd></div><div><dt>Tools</dt><dd>{row.encounter.tools}</dd></div><div><dt>Current branch</dt><dd>Space {state.battle.space}/4 · readiness {state.battle.readiness}/4 · reserve {state.battle.reserve}/1 · tempo {state.battle.tempo}/4 · {state.battle.exposed?'isolated: reconnect through the described route':'connected to support'}</dd></div></dl>
 {row.nodeIndex===0&&<p className="combat-note">Fresh encounter: resources reset. Earlier decisions stay in your receipts.</p>}
 <section className="ch-panel"><p>{node.brief}</p><h2>Confirmed cues</h2><ul>{node.cues.map(c=><li key={c}>{c}</li>)}</ul><p><strong>Unknown:</strong> {node.unknown}</p><p><strong>Waiting costs:</strong> {node.wait}</p></section>
 <form onSubmit={e=>{e.preventDefault();decide();}}><fieldset className="ch-panel"><legend>What do you do?</legend>{node.options.map(o=><label className="combat-option" key={o.id}><input type="radio" required name={`action-${node.id}`} value={o.id} checked={s.draft.nodeId===node.id&&s.draft.actionId===o.id} onChange={()=>update(v=>({...v,draft:{...v.draft,nodeId:node.id,actionId:o.id}}))}/><span>{o.text}</span></label>)}</fieldset>
 <label className="ch-field"><span>Which visible cue mattered most?</span><select required value={s.draft.cue} onChange={e=>update(v=>({...v,draft:{...v.draft,nodeId:node.id,cue:e.target.value}}))}><option value="">Choose a confirmed cue</option>{node.cues.map(c=><option key={c}>{c}</option>)}</select></label>
 <div className="ch-field"><span>Reasoning: alternative rejected and what could change your mind (optional)</span><WritingField key={run!.id+node.id} context={node.brief+" Confirmed cues: "+node.cues.join("; ")+" Unknown: "+node.unknown} chapter={4} aria-label="Decision reasoning (optional)" maxLength={4000} value={s.draft.rationale} onChange={e=>update(v=>({...v,draft:{...v.draft,nodeId:node.id,rationale:e.target.value}}))}/><small>{s.draft.rationale.length}/4000 · not scored</small></div>
 <div className="combat-controls"><button className="ch-quiet" type="button" disabled={!state?.receipts.length} onClick={()=>{setReview(true);setShowResult(false);}}>Back / review</button><button className="primary" type="submit">Commit decision →</button><button className="ch-quiet" type="button" onClick={()=>decide(true)}>Skip decision (no score)</button></div></form></>}
 {s.stage===5&&state&&run&&<><p className="ch-lead">{state.index===18?'Trial complete.':'Partial debrief — you can return to the current decision.'} {run.kind==='rehearsal'?'This is rehearsal; inherited decisions are excluded from new evidence.':'These are first-attempt practice responses.'} No final archetype or rank is assigned.</p>
 <section className="ch-panel"><h2>Coverage before conclusions</h2><p>{state.index}/18 visited · {run.events.filter(e=>e.actionId!=='skip').length} answered · {run.events.filter(e=>e.actionId==='skip').length} skipped. Earlier run scores are kept separately.</p><p>Category index = weighted points ÷ weighted possible points × 100. Primary weight 2, secondary weight 1. No points for unobserved categories, prose, confidence or battle wins.</p><p>Fewer than three opportunities or two encounters means limited evidence. With sufficient coverage, 75–100 = consistent practice signal, 40–74 = context-dependent, below 40 = practice opportunity. These authored thresholds need player testing; they are not measured rank percentiles.</p><p>One authored execution variant can turn a sound plan into a loss. Judge the receipts, not just the ending.</p></section>
 <div className="combat-grid">{score(newEvidence(run,state.receipts)).map(r=>{const prior=dossierData!.rows.find(p=>p.id===r.id)!;return <article className="ch-panel" key={r.id}><h2>{r.name}</h2><p className="combat-index">{r.index===null?'—':`${r.index}/100`}</p><p><strong>{r.signal}</strong> · {r.opportunities} opportunities across {r.encounterCount} encounters.</p><p>Chapter 3: {prior.signal} · {prior.claim}</p><p>{!r.sufficient?'Hypothesis still open: more distinct situations needed.':prior.signal==='Promising scenario signal'&&r.index!<40?'Chapter 3 signal challenged by this trial.':prior.signal==='Practice opportunity'&&r.index!>=75?'Trial challenges the earlier practice concern.':r.index!>=75?'Trial supports this as a practice hypothesis.':'Compare these receipts with a real fight before revising your claim.'}</p><details><summary>Category receipts</summary>{r.entries.map(({m,r:receipt})=><p key={receipt.nodeId}>{nodeList.find(n=>n.node.id===receipt.nodeId)?.node.title}: {m.value}/2 — {m.reason}</p>)}</details></article>;})}</div>
 <section className="ch-panel"><a className="primary" href="#chapter-5">Continue to The Friend or the Menace →</a><h2>One experiment for the next three fights</h2><p>Focus: {name(rows.find(r=>r.sufficient&&r.index!<40)?.id||dossierData!.focus[0]||rows.find(r=>!r.sufficient)?.id||'adaptation')}. Name the cue, your decision, and an alternative explanation. Find one fight that challenges this trial’s story. A practice signal is a starting point, not a player identity.</p><button className="primary" onClick={()=>{setReview(true);setShowResult(false);}}>Review decisions & rehearse</button><button className="ch-quiet" onClick={()=>downloadJson('rivals-workshop-combat-profile.json',{contentVersion:CONTENT_VERSION,run,profile:score(newEvidence(run,state.receipts)),receipts:state.receipts})}>Download profile & receipts</button>{row&&<button className="ch-quiet" onClick={()=>update(v=>({...v,stage:activeStage}))}>Resume current decision</button>}</section></>}
 </>}
 {state?.receipts.length&&s.stage!==5&&!review&&!showResult?<button className="ch-quiet" onClick={()=>setReview(true)}>Review committed decisions</button>:null}
 </>}
 </main></div><footer className="ch-footer">Unofficial fan project · Your device, your data. No online coaching is connected.<span>PLAY. REFLECT. TRY AGAIN.</span></footer></div>;
}


