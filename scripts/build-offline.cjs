const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const dist=path.resolve(__dirname,'../dist');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
if(process.env.VITE_CLOSED_BETA==='true'){
 fs.writeFileSync(path.join(dist,'sw.js'),`// Closed beta: network-only service worker. Never persist an authenticated shell.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith('rivals-workshop-'))await caches.delete(key);
 await self.clients.claim();
})()));`);
 console.log('Closed beta build: installable PWA with network-only worker; offline shell caching disabled.');process.exit(0);
}
const files=walk(dist).filter(f=>!f.endsWith('sw.js'));
const version=crypto.createHash('sha256');files.forEach(f=>version.update(fs.readFileSync(f)));
const assets=files.map(f=>'./'+path.relative(dist,f).split(path.sep).join('/'));
const sw=`// Generated from the production build. No private data or API responses are cached.
const CACHE='rivals-workshop-'+${JSON.stringify(version.digest('hex').slice(0,16))};
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(self.clients.claim());});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/api/'))return;
 const local=new URL(event.request.mode==='navigate'?'./index.html':event.request.url,self.registration.scope);
 if(!local.href.startsWith(self.registration.scope))return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  const cached=await cache.match(local.href);if(cached)return cached;
  // Older hashed assets stay available for an already loaded tab. Old caches are
  // intentionally retained; updates never purge content under an active run.
  const older=await caches.match(local.href);return older||fetch(event.request);
 }));
});
`;
fs.writeFileSync(path.join(dist,'sw.js'),sw);console.log('Offline shell generated: '+assets.length+' assets.');
