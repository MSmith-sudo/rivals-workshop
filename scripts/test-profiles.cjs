const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const p=require('../src/profileStore.ts'),{keys}=require('../src/judgmentState.ts'),{blankSave}=require('../src/chapterState.ts');
class Memory{constructor(){this.map=new Map()}getItem(k){return this.map.get(k)??null}setItem(k,v){this.map.set(k,v)}removeItem(k){this.map.delete(k)}}
const s=new Memory(),raw=JSON.stringify(blankSave());s.setItem(keys[0],raw);s.setItem('rivals-workshop.nickname','Flame');
const l=p.readLibrary(s);assert.equal(l.profiles.length,1);assert.equal(l.profiles[0].consent.team,false);assert.equal(s.getItem(keys[0]),raw);assert.equal(p.readLibrary(s).profiles.length,1);
const first=l.profiles[0];first.chapters[0]=JSON.stringify({...blankSave(),preferred:'duelist'});assert.equal(first.original[0],raw);p.restore(s,first);assert.equal(s.getItem(keys[0]),first.chapters[0]);
first.consent.team=true;const imported=p.importLibrary(JSON.stringify(l));assert.equal(imported.profiles[0].consent.team,false);assert.notEqual(imported.profiles[0].id,first.id);assert.deepEqual(imported.profiles[0].original,first.original);
assert.throws(()=>p.importLibrary('{broken'));assert.throws(()=>p.importLibrary(JSON.stringify({...l,version:99})));assert.throws(()=>p.validateChapters(['{"version":1}',null,null,null,null,null]));assert.throws(()=>p.validateLibrary({...l,profiles:[first,first]}));
const second=p.createProfile('Two',Array(6).fill(null));assert.throws(()=>p.chemistry([first,second]));second.consent.team=true;const team=p.chemistry([first,second]);assert.equal(team.members.length,2);assert.match(team.limitations,/No predictive/);assert.throws(()=>p.chemistry([first,first]));assert.throws(()=>p.chemistry([first]));assert.equal(p.evidence(first,[]).length,0);assert.ok(p.evidence(first,[1]).every(e=>e.chapter===1));
const corrupt=new Memory();corrupt.setItem(p.STORE,'{oops');assert.throws(()=>p.readLibrary(corrupt));assert.equal(corrupt.getItem(p.STORE),'{oops');
const unavailable=new Memory();unavailable.setItem=()=>{throw Error('Quota')};assert.throws(()=>p.saveLibrary(unavailable,l));
console.log('Profile checks passed: migration idempotence, original preservation, restore, import consent reset, corruption/quota handling, evidence privacy, group consent and bounds.');
