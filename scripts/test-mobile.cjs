const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.css']=()=>{};
const store=new Map();global.sessionStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)};
const FocusDeck=require('../src/FocusDeck.tsx').default;
const children=[1,2,3].map(n=>React.createElement('input',{key:n,defaultValue:'draft-'+n}));
for(const [saved,expected] of [['0',1],['1',2],['999',3],['-5',1],['corrupt',1]]){
 store.set('rivals-focus.test',saved);const html=renderToStaticMarkup(React.createElement(FocusDeck,{id:'test'},children));assert.ok(html.includes(`QUESTION ${expected} / 3`));assert.equal((html.match(/hidden=""/g)||[]).length,2);for(let n=1;n<=3;n++)assert.ok(html.includes('draft-'+n),'Hidden question drafts must remain mounted');
}
const manifest=JSON.parse(fs.readFileSync('dist/manifest.webmanifest','utf8'));assert.equal(manifest.display,'standalone');assert.equal(manifest.scope,'./');assert.equal(manifest.orientation,undefined,'Portrait must not require rotation');
for(const icon of manifest.icons){const png=fs.readFileSync('dist/'+icon.src.replace('./',''));const size=Number(icon.sizes.split('x')[0]);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);}
const events={},deleted=[];let activation;
vm.runInNewContext(fs.readFileSync('dist/sw.js','utf8'),{self:{addEventListener:(name,fn)=>events[name]=fn,skipWaiting:()=>{},clients:{claim:async()=>{}}},caches:{keys:async()=>['rivals-workshop-old','another-app'],delete:async key=>{deleted.push(key);}}});
assert.equal(events.fetch,undefined,'Closed beta must use network authentication for every request');assert.equal(events.message,undefined);events.activate({waitUntil:p=>activation=p});
activation.then(()=>{assert.deepEqual(deleted,['rivals-workshop-old']);const media=JSON.parse(fs.readFileSync('src/hero-media.json'));const heroes=JSON.parse(fs.readFileSync('src/heroes.official.json'));for(const h of heroes){assert.ok(media[h.id]);assert.ok(fs.existsSync('public/'+media[h.id].src.replace('./','')));}console.log('Mobile checks passed: question position recovery, preserved mounted drafts, installable manifest, raster icon dimensions, no orientation lock, network-only beta worker, old private cache purge, unrelated cache preservation, all 54 local character portraits.');}).catch(e=>{console.error(e);process.exitCode=1;});
