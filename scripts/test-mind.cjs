const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const file = path.resolve(__dirname, '../src/mindState.ts');
const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const loaded = new Module(file,module); loaded.filename=file;loaded.paths=module.paths;loaded._compile(compiled,file);
const {blankMind,decodeMind,diagnosis,classify,disciplines,scenarios,MIND_KEY,interrogate,provisional,subskills}=loaded.exports;
assert.equal(disciplines.length,10);assert.equal(scenarios.length,10);
assert.equal(new Set(scenarios.map(q=>q.category)).size,10);
assert.equal(MIND_KEY,'rivals-workshop.chapter3.v1');
assert.deepEqual(decodeMind('{broken'),blankMind());
assert.deepEqual(decodeMind('{"version":99}'),blankMind());
const s=blankMind();s.top=['analytical','awareness'];s.weakest='pressure';s.confidence='5';s.evidence.awareness='When the fight began, I checked the flank because we lost sight.';s.replies.awareness='Next time I waited.';s.choices.missing=1;s.skipped=[2];s.stage=5;s.finished=true;
assert.deepEqual(decodeMind(JSON.stringify(s)).top,s.top);
assert.equal(decodeMind(JSON.stringify(s)).evidence.awareness,s.evidence.awareness);
assert.equal(decodeMind(JSON.stringify(s)).finished,true);
assert.equal(diagnosis(s).find(r=>r.id==='awareness').tension,'Claim and scenario diverge');
assert.equal(diagnosis(s).find(r=>r.id==='pressure').signal,'Unobserved');
assert.equal(classify('').label,'No evidence');
assert.equal(classify(s.evidence.awareness).label,'Structured account');
assert.equal(classify('I am excellent').label,'Needs more detail');
const invalid=decodeMind(JSON.stringify({...s,top:['pressure','pressure','made-up'],weakest:'pressure',stage:99,confidence:'99',choices:{missing:99,angle:-1},skipped:[-1,2,88]}));
assert.deepEqual(invalid.top,['pressure']);assert.equal(invalid.weakest,'');assert.equal(invalid.stage,0);assert.equal(invalid.confidence,'');assert.deepEqual(invalid.choices,{});assert.deepEqual(invalid.skipped,[2]);
for(const q of scenarios){s.choices[q.id]=q.choices.findIndex(c=>c.value===2);}
assert(diagnosis(s).every(r=>r.signal==='Promising scenario signal'));
assert.equal(diagnosis(s).find(r=>r.id==='pressure').tension,'Scenario challenges weakest claim');
console.log('Chapter 3 checks passed: coverage, corrupt-save recovery, ordered claims, bounded choices, missing evidence, contradictions and transparent rubric.');


assert.deepEqual(disciplines.map(d=>d[1]),['Analytical','Reactive','Proactive','Fight Awareness','Positioning Awareness','Resource/Cooldown Awareness','Objective/Macro','Adaptability/Flex','Team Awareness','Pressure Decision-Making']);
assert.deepEqual(subskills,['Engagement Timing','Target Priority','Risk Assessment','Composure']);
const old={version:1,stage:5,top:['awareness','timing'],weakest:'composure',confidence:'4',evidence:{awareness:'Broad account',timing:'Early engagement',positioning:'Cover'},replies:{timing:'Kept draft'},choices:{missing:0,commit:2,target:1,lastfight:1,reset:1,angle:1},rationales:{commit:'Waited for team'},skipped:[2],finished:true};
const migrated=decodeMind(JSON.stringify(old));assert.equal(migrated.version,2);assert.deepEqual(migrated.legacy,old);assert.deepEqual(migrated.top,[]);assert.equal(migrated.weakest,'');assert.equal(migrated.evidence.awareness,'');assert.equal(migrated.evidence.positioning,'Cover');assert.deepEqual(migrated.choices,{angle:1});assert.equal(migrated.rationales.commit,'Waited for team');assert.equal(migrated.finished,false);assert.equal(migrated.stage,5);assert.deepEqual(decodeMind(JSON.stringify(migrated)),migrated);
const direct=decodeMind(JSON.stringify({...old,top:['positioning','resources'],weakest:'teamwork'}));assert.deepEqual(direct.top,['positioning','resources']);assert.equal(direct.weakest,'teamwork');
const empty=provisional(blankMind());assert.equal(empty.title,'The Uncharted Flame');assert.equal(empty.strengths.length,0);assert.match(empty.identityNote,/Chapter 7/);
const rich=provisional(s);assert.equal(rich.strengths.length,10);assert(rich.strengths.every(r=>r.source&&r.reason&&!r.corroborated));assert.match(rich.uncertainty,/Low confidence/);
const snapshot=JSON.stringify(s);s.evidence.analytical='I am the best because I won';assert.equal(provisional(s).title,rich.title);assert.equal(provisional(s).strengths.length,10);Object.assign(s,JSON.parse(snapshot));
for(const [id] of disciplines){const probe=interrogate(id,'');assert.match(probe.feedback,/No account/);assert(probe.neighbor&&probe.question&&probe.structureQuestion);assert.equal(probe.cue,false);}
assert.notEqual(interrogate('reactive','After contact').question,interrogate('proactive','Before contact').question);
assert.equal(interrogate('reactive','After contact').cue,true);assert.equal(interrogate('proactive','Before contact').cue,true);assert.match(interrogate('proactive','Before contact').feedback,/not proof/);
console.log('Polish checks passed: exact taxonomy, archived migration, idempotence, no invented strengths, targeted overlap probes and provisional Chapter 7 boundary.');
