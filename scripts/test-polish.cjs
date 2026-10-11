const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.css']=()=>{};
const {mediaFor,safeMediaPath}=require('../src/mediaRegistry.ts'),{localNarrative,validNarrative}=require('../src/narrativeState.ts'),{localTitles,validTitles}=require('../src/creativeState.ts'),{blankMusic}=require('../src/musicState.ts'),{blank,heroes}=require('../src/chapterState.ts');
for(const src of ['https://evil.test/a.png','./media/../secret.png','data:image/svg+xml,x','//evil.test/i.png','./media/a.svg?x=1'])assert.equal(safeMediaPath(src),false);
assert.equal(mediaFor('missing','invalid').src,'./media/duelist-portrait.svg');
const custom={src:'./media/user-portrait.webp',alt:'User supplied portrait',credit:'Artist',rights:'Used with permission'};assert.deepEqual(mediaFor('test','vanguard',{test:custom}),custom);
assert.equal(mediaFor('test','vanguard',{test:{...custom,credit:''}}).src,'./media/vanguard-portrait.svg');
for(const r of ['vanguard','duelist','strategist'])assert.ok(fs.existsSync('public/media/'+r+'.svg'));
const empty=Array(6).fill(null);assert.match(localNarrative(empty),/No included answers/);assert.equal(localNarrative(empty),localNarrative(empty));assert.match(localNarrative(['{broken',...empty.slice(1)]),/No included answers/);
const {blankAnswers,decodeSave}=require('../src/chapterState.ts');const variants=[];
for(let i=0;i<32;i++){const c=decodeSave(null);c.preferred='vanguard';c.roles.vanguard.decision='play';const h=heroes.find(h=>h.roles.includes('vanguard'));c.roles.vanguard.picks=[h.id];c.roles.vanguard.answers[h.id]={...blankAnswers(),why:'Supported motivation '+i};variants.push(localTitles([JSON.stringify(c),...empty.slice(1)]));}
assert.ok(new Set(variants.map(v=>v.items.team.title)).size>=12);variants.forEach(v=>assert.ok(validTitles(v)));assert.deepEqual(variants[0],localTitles([(()=>{const c=decodeSave(null),h=heroes.find(h=>h.roles.includes('vanguard'));c.preferred='vanguard';c.roles.vanguard.decision='play';c.roles.vanguard.picks=[h.id];c.roles.vanguard.answers[h.id]={...blankAnswers(),why:'Supported motivation 0'};return JSON.stringify(c);})(),...empty.slice(1)]));
assert.equal(validNarrative({version:1,text:'x',origin:'ai',fingerprint:'a',receipts:[]}),true);assert.equal(validNarrative({version:1,text:'x'.repeat(15001),origin:'ai',fingerprint:'a',receipts:[]}),false);
const {ChapterBanner,HeroPortrait}=require('../src/WorkshopVisuals.tsx'),NarrativeLab=require('../src/NarrativeLab.tsx').default;
for(let c=1;c<=7;c++){const html=renderToStaticMarkup(React.createElement(ChapterBanner,{chapter:c}));assert.ok(html.includes('Chapter '+c+' introduction'));assert.ok(html.includes('./media/'));}
const html=renderToStaticMarkup(React.createElement(NarrativeLab,{receipts:[],fallback:'<script>alert(1)</script>',storageKey:'test'}));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('checked=""'));assert.match(html,/disabled=""/);
const css=fs.readFileSync('src/polish.css','utf8');assert.match(css,/prefers-reduced-motion/);assert.match(css,/focus-visible/);assert.match(css,/max-width:760px/);
(async()=>{const {requestNarrative}=require('../src/aiRequest.ts');const payload={evidence:[{id:'E1'}]},signal=new AbortController().signal;
 const mock=(data,status=200)=>async()=>new Response(JSON.stringify(data),{status});
 assert.equal(await requestNarrative(payload,signal,mock({origin:'provider',text:'A supported hypothesis [E1]',citations:['E1']})),'A supported hypothesis [E1]');
 for(const data of [{origin:'provider',text:'Invented receipt [E2]',citations:['E2']},{origin:'provider',text:'No reference',citations:['E1']},{origin:'local',text:'x',citations:[]}])await assert.rejects(requestNarrative(payload,signal,mock(data)),/evidence|references/);
 await assert.rejects(requestNarrative(payload,signal,mock({retryAfter:7},429)),/7 seconds/);await assert.rejects(requestNarrative(payload,signal,mock({},503)),/unavailable/);await assert.rejects(requestNarrative(payload,signal,async()=>new Response('broken')),/unreadable/);await assert.rejects(requestNarrative(payload,signal,async()=>{throw Error('network unavailable');}),/network/);
 console.log('V2.3 checks passed: title diversity and determinism, missing/corrupt data, media registry and fallbacks, narrative bounds, safe React rendering, seven chapter banners, consent off, reduced motion/mobile/focus rules, API quota/network/invalid citation errors.');
})().catch(e=>{console.error(e);process.exitCode=1;});
