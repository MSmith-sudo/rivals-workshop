const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const cache=new Map();
function load(name){if(name.endsWith('.json'))return JSON.parse(fs.readFileSync(path.resolve(__dirname,'../src',name),'utf8'));const file=path.resolve(__dirname,'../src',name+'.ts');if(cache.has(file))return cache.get(file).exports;const m=new Module(file,module);m.filename=file;m.paths=module.paths;cache.set(file,m);m.require=id=>id.startsWith('./')?load(id.slice(2)):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;}
const J=load('judgmentState'),C=load('chapterState'),S=load('socialState'),M=load('musicState'),B=load('combatState'),E=load('combatEngine'),N=load('combatContent'),Mind=load('mindState'),Court=load('courtState');
const blank=()=>Array(6).fill(null),encode=(a)=>a.map(s=>s===null?null:JSON.stringify(s));
assert.equal(J.judge(blank()).primary,null);assert.equal(J.judge(blank()).secondary,null);
assert(J.judge(blank()).claims.every(c=>c.index===null));
for(let i=0;i<6;i++){let raw=blank();raw[i]='{';let j=J.judge(raw);assert.equal(j.coverage[i].status,'Excluded');assert.equal(raw[i],'{');}
let raw=blank();raw[0]=JSON.stringify({version:99});assert.equal(J.judge(raw).coverage[0].status,'Excluded');
function identity(role,flex='one-role'){let c=C.blankSave();c.preferred=role;c.flexibility=flex;return c;}
function social(choices){let s=S.blankSocial();for(const [id,choice] of Object.entries(choices))s.answers[id]={choice,example:'Private literal <script> text',skipped:false};return s;}
function result(one,choices){return J.judge(encode([one,null,null,null,social(choices),null]));}
assert.equal(result(identity('duelist'),{quad:'dive',peel:'finish'}).primary.id,'kill');
assert.equal(result(identity('strategist'),{peel:'turn',heals:'cue'}).primary.id,'savior');
assert.equal(result(identity('vanguard'),{heals:'ping',own:'later',quad:'zone'}).primary.id,'lord');
assert.equal(result(identity('vanguard'),{quad:'zone',trust:'hold'}).primary.id,'anchor');
assert.equal(result(identity('vanguard'),{lost:'reset',heals:'cue'}).primary.id,'conductor');
assert.equal(result(identity('vanguard'),{trust:'check',ego:'replay'}).primary.id,'architect');
assert.equal(result(identity('no-preference','any-role'),{swap:'swap',heals:'cue'}).primary.id,'shifter');
assert.equal(result(identity('vanguard'),{own:'own',streak:'break'}).primary.id,'diplomat');
assert.equal(result(identity('vanguard'),{boundary:'direct',heals:'ping'}).primary.id,'sentinel');
const selectedHero=C.heroes.find(h=>h.roles.includes('duelist')).id;
let specialist=identity('duelist');specialist.roles.duelist={decision:'play',picks:[selectedHero],answers:{[selectedHero]:{...C.blankAnswers(),loyalty:'yes',mastery:'5'}}};
assert.equal(result(specialist,{swap:'offer'}).primary.id,'oath');
specialist.roles.duelist.answers[selectedHero]={...C.blankAnswers(),tags:['Big moments']};
assert.equal(result(specialist,{own:'later'}).primary.id,'spark');
let combat=B.blankCombat();let run=B.createRun(null,'vanguard',71,'baseline');
for(let i=0;i<N.nodeList.length;i++){const node=N.nodeList[i].node;const option=E.adjustedNode(i,E.replay(run.events,run.seed).battle).options.find(o=>o.marks.every(m=>m.value===0))||E.adjustedNode(i,E.replay(run.events,run.seed).battle).options.find(o=>!o.effect.reserve||E.replay(run.events,run.seed).battle.reserve+o.effect.reserve>=0);run.events.push({nodeId:node.id,actionId:option.id,cue:node.cues[0],rationale:'',at:'test'});}
combat.runs=[run];let mind=Mind.blankMind();mind.top=['analytical','proactive'];
raw=encode([identity('duelist'),null,mind,combat,social({quad:'dive'}),null]);let j=J.judge(raw);assert(j.claims.some(c=>c.comparison==='Scenario challenges claim'));
// Find a supported False Hope fixture by selecting claims for the lowest sufficient disciplines.
mind.top=j.claims.filter(c=>c.sufficient).sort((a,b)=>a.index-b.index).slice(0,2).map(c=>c.id);
raw=encode([identity('no-preference'),null,mind,combat,null,null]);j=J.judge(raw);assert.equal(j.primary.id,'hope');
assert.deepEqual(J.judge(raw),j,'Determinism');
const original=JSON.stringify(raw);const rehearse={...run,id:'rehearsal',kind:'rehearsal',parentId:'baseline',forkAt:0};combat.runs.push(rehearse);combat.active=1;
const after=J.judge(encode([identity('no-preference'),null,mind,combat,null,null]));assert.deepEqual(after.claims,j.claims);assert.equal(after.primary.id,j.primary.id);assert.equal(JSON.stringify(raw),original);
const music=M.blankMusic();music.songs[0]={...music.songs[0],title:'PRIVATE SONG',source:'Me',reason:'PRIVATE STORY',skipped:true};music.connections='PRIVATE COMMENT';music.behindSkipped=true;
let c=identity('duelist');const hero=C.heroes.find(h=>h.roles.includes('duelist')).id;c.roles.duelist={decision:'play',picks:[hero],answers:{[hero]:{...C.blankAnswers(),why:'PRIVATE MAIN',tags:['Big moments']}}};c.skipped=[`duelist-${hero}-story`];
let s=social({quad:'dive',peel:'finish'});s.answers.quad.skipped=true;s.answers.quad.example='SKIPPED PRIVATE';
j=J.judge(encode([c,null,null,null,s,music]));const full=JSON.stringify(J.exportJudgment(j,'',true));for(const text of ['PRIVATE SONG','PRIVATE STORY','PRIVATE COMMENT','PRIVATE MAIN','SKIPPED PRIVATE'])assert(!full.includes(text));
const defaultExport=J.exportJudgment(result(identity('duelist'),{quad:'dive',peel:'finish'}));assert(!('nickname'in defaultExport));assert(!('includedAnswers'in defaultExport));assert(!JSON.stringify(defaultExport).includes('Private literal'));
assert.deepEqual(defaultExport.profileV2.consent,{teamChemistry:false,aiPartner:false,examples:false});assert.equal(defaultExport.profileV2.schemaVersion,2);
let court=Court.blankCourt();court.cases=[Court.makeCase('demo','Demo','Vanguard','PRIVATE DEMO')];assert(!JSON.stringify(J.judge(encode([null,court,null,null,null,null])).sources).includes('PRIVATE DEMO'));
// Free text and soundtrack cannot change identity scores.
let r=result(identity('duelist'),{quad:'dive',peel:'finish'});s=social({quad:'dive',peel:'finish'});s.answers.quad.example='support proactive analytical '.repeat(200);music.songs[0].skipped=false;let r2=J.judge(encode([identity('duelist'),null,null,null,s,music]));assert.deepEqual(r.ranking.map(a=>a.points),r2.ranking.map(a=>a.points));
// Sufficient tactical evidence excludes skipped decisions and never treats an outcome as the rubric.
combat.runs=[{...run,events:run.events.map(e=>({...e,actionId:'skip',cue:''}))}];j=J.judge(encode([null,null,mind,combat,null,null]));assert(j.claims.every(c=>c.index===null));assert(!j.signals.some(s=>s.id==='claimGap'));assert.equal(j.primary,null);
assert.equal(new Set(J.archetypes.map(a=>a.id)).size,12);
console.log('Chapter 7 checks passed: deterministic scoring, all 12 archetypes, missing/corrupt saves, baseline/rehearsal isolation, skipped/private drafts, V2 consent and no free-text/music scoring.');

